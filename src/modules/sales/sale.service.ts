import mongoose from "mongoose";
import Sale, { ISale } from "./sale.model";
import Product from "../products/product.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { QueryBuilder } from "../../common/utils/queryBuilder";
import { CreateSaleInput, SaleQuery } from "./sale.types";

export const createSale = async (
	data: CreateSaleInput,
	userId: string
): Promise<ISale> => {
	const session = await mongoose.startSession();

	try {
		let createdSale: ISale | undefined;

		await session.withTransaction(async () => {
			const productIds = data.items.map((item) => item.productId);

			const products = await Product.find({ _id: { $in: productIds } }).session(
				session
			);

			const productMap = new Map(products.map((p) => [p._id.toString(), p]));

			const itemsWithDetails: Array<{
				product: mongoose.Types.ObjectId;
				productName: string;
				quantity: number;
				unitPrice: number;
				subtotal: number;
			}> = [];
			let grandTotal = 0;

			const lowStockProducts: Array<{
				productId: string;
				name: string;
				sku: string;
				stockQuantity: number;
			}> = [];

			const bulkOps: Array<{
				updateOne: {
					filter: { _id: mongoose.Types.ObjectId };
					update: { $inc: { stockQuantity: number } };
				};
			}> = [];

			for (const item of data.items) {
				const product = productMap.get(item.productId);
				if (!product) {
					throw new ApiError(
						`Product with ID ${item.productId} not found`,
						HTTP_STATUS.NOT_FOUND
					);
				}

				if (product.stockQuantity < item.quantity) {
					throw new ApiError(
						`Insufficient stock for ${product.name}`,
						HTTP_STATUS.BAD_REQUEST
					);
				}

				const unitPrice = product.sellingPrice;
				const productName = product.name;
				const subtotal = unitPrice * item.quantity;

				const newStockQuantity = product.stockQuantity - item.quantity;

				bulkOps.push({
					updateOne: {
						filter: { _id: product._id },
						update: { $inc: { stockQuantity: -item.quantity } },
					},
				});

				itemsWithDetails.push({
					product: product._id,
					productName,
					quantity: item.quantity,
					unitPrice,
					subtotal,
				});

				grandTotal += subtotal;

				if (newStockQuantity < 5) {
					lowStockProducts.push({
						productId: product._id.toString(),
						name: product.name,
						sku: product.sku,
						stockQuantity: newStockQuantity,
					});
				}
			}

			if (bulkOps.length > 0) {
				await Product.bulkWrite(bulkOps, { session });
			}

			const [created] = await Sale.create(
				[
					{
						items: itemsWithDetails,
						grandTotal,
						soldBy: new mongoose.Types.ObjectId(userId),
					},
				],
				{ session }
			);

			createdSale = created;

			for (const lowStock of lowStockProducts) {
				const { io } = await import("../../server");
				io.emit("stock:low", lowStock);
			}
		});

		const populated = await Sale.findById(createdSale!._id)
			.populate("soldBy", "name email")
			.populate(
				"items.product",
				"name sku sellingPrice imageUrl stockQuantity category"
			);

		return populated as ISale;
	} finally {
		await session.endSession();
	}
};

export const getSales = async (
	query: SaleQuery
): Promise<{
	sales: ISale[];
	meta: { page: number; limit: number; total: number; totalPages: number };
}> => {
	const { page, limit } = query;
	const result = await new QueryBuilder<ISale>(
		Sale,
		query as Record<string, unknown>
	)
		.search(["items.productName"])
		.sort("-createdAt")
		.paginate(page, limit)
		.populate("soldBy", "name email")
		.execute();

	return {
		sales: result.data as ISale[],
		meta: result.meta,
	};
};

export const getSaleById = async (id: string): Promise<ISale> => {
	const sale = await Sale.findById(id)
		.populate("soldBy", "name email")
		.populate(
			"items.product",
			"name sku sellingPrice imageUrl stockQuantity category"
		);

	if (!sale) {
		throw new ApiError("Sale not found", HTTP_STATUS.NOT_FOUND);
	}

	return sale;
};
