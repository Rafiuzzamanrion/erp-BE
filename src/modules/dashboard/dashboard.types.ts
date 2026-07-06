import { z } from "zod";
import { dashboardQuerySchema } from "./dashboard.schema";

export type DashboardQuery = z.input<typeof dashboardQuerySchema>;

export interface LowStockProduct {
	_id: string;
	name: string;
	sku: string;
	stockQuantity: number;
}

export interface DashboardStats {
	totalProducts: number;
	totalSales: number;
	lowStockProducts: LowStockProduct[];
	lowStockCount: number;
	totalRevenue: number;
}
