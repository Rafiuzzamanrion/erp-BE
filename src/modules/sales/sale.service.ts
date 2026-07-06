import mongoose from "mongoose";
import Sale, { ISale } from "./sale.model";
import Product from "../products/product.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { CreateSaleInput, SaleQuery } from "./sale.types";

export const createSale = async (
	data: CreateSaleInput,
	userId: string
): Promise<ISale> => {
	const session = await mongoose.startSession();

	try {
		let createdSale: ISale | undefined;

		await session.withTransaction(async () => {
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

			for (const item of data.items) {
				const product = await Product.findById(item.productId).session(session);
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

				product.stockQuantity -= item.quantity;
				await product.save({ session });

				itemsWithDetails.push({
					product: product._id,
					productName,
					quantity: item.quantity,
					unitPrice,
					subtotal,
				});

				grandTotal += subtotal;

				if (product.stockQuantity < 5) {
					lowStockProducts.push({
						productId: product._id.toString(),
						name: product.name,
						sku: product.sku,
						stockQuantity: product.stockQuantity,
					});
				}
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

		return (await Sale.findById(createdSale!._id)
			.populate("soldBy", "name email")
			.populate("items.product")) as ISale;
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
	const page = query.page ?? 1;
	const limit = query.limit ?? 10;
	const sort = query.sort || "-createdAt";
	const skip = (page - 1) * limit;

	const sortOption: Record<string, 1 | -1> = {};
	if (sort.startsWith("-")) {
		sortOption[sort.substring(1)] = -1;
	} else {
		sortOption[sort] = 1;
	}

	const [sales, total] = await Promise.all([
		Sale.find()
			.sort(sortOption)
			.skip(skip)
			.limit(limit)
			.populate("soldBy", "name email")
			.lean(),
		Sale.countDocuments(),
	]);

	return {
		sales: sales as ISale[],
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
};

export const getSaleById = async (id: string): Promise<ISale> => {
	const sale = await Sale.findById(id)
		.populate("soldBy", "name email")
		.populate("items.product");

	if (!sale) {
		throw new ApiError("Sale not found", HTTP_STATUS.NOT_FOUND);
	}

	return sale;
};
