import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./user.schema";

export type CreateUserInput = z.output<typeof createUserSchema>;
export type UpdateUserInput = z.output<typeof updateUserSchema>;
