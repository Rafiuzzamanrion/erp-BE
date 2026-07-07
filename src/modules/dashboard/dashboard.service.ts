import { Product } from "../products/product.model";
import { Sale } from "../sales/sale.model";
import {
	DashboardQuery,
	DashboardStats,
	LowStockProduct,
	DailyRevenue,
	CategoryRevenue,
	RecentSale,
} from "./dashboard.types";

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

	const totalRevenue = result[0]?.totalRevenue || 0;
	const totalSales = result[0]?.totalSales || 0;

	const last7Days = new Date();
	last7Days.setDate(last7Days.getDate() - 6);
	last7Days.setHours(0, 0, 0, 0);

	const dailyRevenueAgg = await Sale.aggregate([
		{ $match: { createdAt: { $gte: last7Days } } },
		{
			$group: {
				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
				revenue: { $sum: "$grandTotal" },
				sales: { $sum: 1 },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	const dailyRevenue: DailyRevenue[] = dailyRevenueAgg.map((d) => ({
		date: d._id,
		revenue: d.revenue,
		sales: d.sales,
	}));

	const categoryRevenueAgg = await Sale.aggregate([
		{ $unwind: "$items" },
		{
			$group: {
				_id: "$items.productName",
				revenue: { $sum: "$items.subtotal" },
			},
		},
		{ $sort: { revenue: -1 } },
		{ $limit: 5 },
	]);

	const categoryRevenue: CategoryRevenue[] = categoryRevenueAgg.map((c) => ({
		category: c._id,
		revenue: c.revenue,
	}));

	const recentSales = await Sale.find()
		.sort({ createdAt: -1 })
		.limit(5)
		.populate("soldBy", "name")
		.lean();

	const mappedRecentSales: RecentSale[] = recentSales.map((s) => {
		const soldBy = s.soldBy as unknown as { _id: string; name: string };
		return {
			_id: String(s._id),
			grandTotal: s.grandTotal,
			createdAt: s.createdAt.toISOString(),
			soldBy: { _id: String(soldBy._id), name: soldBy.name },
			items: s.items.map((item) => ({
				productName: item.productName,
				quantity: item.quantity,
				subtotal: item.subtotal,
			})),
		};
	});

	return {
		totalProducts,
		totalSales,
		lowStockProducts,
		lowStockCount,
		totalRevenue,
		recentSales: mappedRecentSales,
		dailyRevenue,
		categoryRevenue,
	};
};
