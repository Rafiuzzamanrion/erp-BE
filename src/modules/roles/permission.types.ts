import { z } from "zod";
import {
	createPermissionSchema,
	updatePermissionSchema,
	permissionIdParamsSchema,
} from "./permission.schema";

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionIdParams = z.infer<typeof permissionIdParamsSchema>;
