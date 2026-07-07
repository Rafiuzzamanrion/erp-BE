import { z } from "zod";
import { dashboardQuerySchema } from "./dashboard.schema";

export type DashboardQuery = z.input<typeof dashboardQuerySchema>;

export interface LowStockProduct {
	_id: string;
	name: string;
	sku: string;
	stockQuantity: number;
}

export interface DailyRevenue {
	date: string;
	revenue: number;
	sales: number;
}

export interface CategoryRevenue {
	category: string;
	revenue: number;
}

export interface DashboardStats {
	totalProducts: number;
	totalSales: number;
	lowStockProducts: LowStockProduct[];
	lowStockCount: number;
	totalRevenue: number;
	recentSales: RecentSale[];
	dailyRevenue: DailyRevenue[];
	categoryRevenue: CategoryRevenue[];
}

export interface RecentSale {
	_id: string;
	grandTotal: number;
	createdAt: string;
	soldBy: { _id: string; name: string };
	items: Array<{ productName: string; quantity: number; subtotal: number }>;
}

export interface LowStockAlerts {
	lowStockCount: number;
	lowStockProducts: LowStockProduct[];
}
