import { Category, ICategory } from "./category.model";
import { Product } from "../products/product.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { QueryBuilder } from "../../common/utils/queryBuilder";
import {
	CreateCategoryInput,
	UpdateCategoryInput,
	CategoryQuery,
} from "./category.types";

export const createCategory = async (
	data: CreateCategoryInput
): Promise<ICategory> => {
	const existing = await Category.findOne({ name: data.name });
	if (existing) {
		throw new ApiError(
			"Category with this name already exists",
			HTTP_STATUS.CONFLICT
		);
	}
	return Category.create(data);
};

export const getCategories = async (
	query: CategoryQuery
): Promise<{
	categories: ICategory[];
	meta: { page: number; limit: number; total: number; totalPages: number };
}> => {
	const { page, limit, ...rest } = query;

	const result = await new QueryBuilder<ICategory>(
		Category,
		rest as Record<string, unknown>
	)
		.search(["name", "description"])
		.sort(query.sort || "name")
		.paginate(page, limit)
		.execute();

	return {
		categories: result.data as unknown as ICategory[],
		meta: result.meta,
	};
};

export const getCategory = async (id: string): Promise<ICategory> => {
	const category = await Category.findById(id).lean();
	if (!category) {
		throw new ApiError("Category not found", HTTP_STATUS.NOT_FOUND);
	}
	return category as ICategory;
};

export const updateCategory = async (
	id: string,
	data: UpdateCategoryInput
): Promise<ICategory> => {
	const category = await Category.findById(id);
	if (!category) {
		throw new ApiError("Category not found", HTTP_STATUS.NOT_FOUND);
	}

	if (data.name && data.name !== category.name) {
		const existing = await Category.findOne({ name: data.name });
		if (existing) {
			throw new ApiError(
				"Category with this name already exists",
				HTTP_STATUS.CONFLICT
			);
		}
	}

	Object.assign(category, data);
	return category.save();
};

export const deleteCategory = async (id: string): Promise<void> => {
	const category = await Category.findById(id);
	if (!category) {
		throw new ApiError("Category not found", HTTP_STATUS.NOT_FOUND);
	}

	const productsUsingCategory = await Product.countDocuments({
		category: category.name,
	});
	if (productsUsingCategory > 0) {
		throw new ApiError(
			"Cannot delete category: it is still used by products",
			HTTP_STATUS.CONFLICT
		);
	}

	await category.deleteOne();
};

export const categoryExists = async (name: string): Promise<boolean> => {
	const doc = await Category.findOne({ name: name.toLowerCase() })
		.select("_id")
		.lean();
	return !!doc;
};
