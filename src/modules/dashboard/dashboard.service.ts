import { Product } from "../products/product.model";
import { Sale } from "../sales/sale.model";
import { DashboardQuery, DashboardStats, LowStockProduct } from "./dashboard.types";

export const getStats = async (
	query?: DashboardQuery
): Promise<DashboardStats> => {
	const [totalProducts, lowStockProducts] = await Promise.all([
		Product.countDocuments(),
		Product.aggregate<LowStockProduct>([
			{ $match: { stockQuantity: { $lt: 5 } } },
			{ $project: { name: 1, sku: 1, stockQuantity: 1 } },
		]),
	]);

	const lowStockCount = lowStockProducts.length;

	const dateMatch: Record<string, unknown> = {};
	if (query?.startDate) {
		dateMatch.createdAt = {
			...(dateMatch.createdAt as Record<string, unknown>),
			$gte: new Date(query.startDate),
		};
	}
	if (query?.endDate) {
		dateMatch.createdAt = {
			...(dateMatch.createdAt as Record<string, unknown>),
			$lte: new Date(query.endDate),
		};
	}

	const result = await Sale.aggregate([
		{ $match: dateMatch },
		{
			$group: {
				_id: null,
				totalRevenue: { $sum: "$grandTotal" },
				totalSales: { $sum: 1 },
			},
		},
	]);

	return {
		totalProducts,
		totalSales: result[0]?.totalSales || 0,
		lowStockProducts,
		lowStockCount,
		totalRevenue: result[0]?.totalRevenue || 0,
	};
};
