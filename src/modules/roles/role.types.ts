import { z } from "zod";
import { createRoleSchema, updateRoleSchema } from "./role.schema";

export type CreateRoleInput = z.input<typeof createRoleSchema>;
export type CreateRole = z.output<typeof createRoleSchema>;
export type UpdateRoleInput = z.input<typeof updateRoleSchema>;
export type UpdateRole = z.output<typeof updateRoleSchema>;
