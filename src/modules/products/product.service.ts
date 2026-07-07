import Product, { IProduct } from "./product.model";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUS } from "../../common/constants/httpStatus.constant";
import { uploadImage, deleteImage } from "../../common/utils/cloudinaryUpload";
import { QueryBuilder } from "../../common/utils/queryBuilder";
import { categoryExists } from "../categories/category.service";
import {
	CreateProductInput,
	UpdateProductInput,
	ProductQuery,
} from "./product.types";

export const createProduct = async (
	data: CreateProductInput,
	imageFile: Express.Multer.File | undefined,
	userId: string
): Promise<IProduct> => {
	const existing = await Product.findOne({ sku: data.sku.toUpperCase() });
	if (existing) {
		throw new ApiError("SKU already exists", HTTP_STATUS.CONFLICT);
	}

	if (!imageFile) {
		throw new ApiError("Product image is required", HTTP_STATUS.BAD_REQUEST);
	}

	const categoryName = data.category.toLowerCase();
	const exists = await categoryExists(categoryName);
	if (!exists) {
		throw new ApiError("Category does not exist", HTTP_STATUS.BAD_REQUEST);
	}

	const uploaded = await uploadImage(imageFile.buffer, "erp/products");

	const product = await Product.create({
		name: data.name,
		sku: data.sku.toUpperCase(),
		category: categoryName,
		purchasePrice: data.purchasePrice,
		sellingPrice: data.sellingPrice,
		stockQuantity: data.stockQuantity ?? 0,
		imageUrl: uploaded.secure_url,
		imagePublicId: uploaded.public_id,
		createdBy: userId,
	});

	return product.toObject() as IProduct;
};

export const getProducts = async (
	query: ProductQuery
): Promise<{
	products: IProduct[];
	meta: { page: number; limit: number; total: number; totalPages: number };
}> => {
	const { page, limit } = query;
	const result = await new QueryBuilder<IProduct>(
		Product,
		query as Record<string, unknown>
	)
		.search(["name", "sku", "category"])
		.filter(["category"])
		.sort("-createdAt")
		.paginate(page, limit)
		.execute();

	return {
		products: result.data as unknown as IProduct[],
		meta: result.meta,
	};
};

export const getProductById = async (id: string): Promise<IProduct> => {
	const product = await Product.findById(id);
	if (!product) {
		throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
	}
	return product.toObject() as IProduct;
};

export const updateProduct = async (
	id: string,
	data: UpdateProductInput,
	imageFile?: Express.Multer.File | undefined
): Promise<IProduct> => {
	const product = await Product.findById(id);
	if (!product) {
		throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
	}

	if (data.sku && data.sku.toUpperCase() !== product.sku) {
		const existing = await Product.findOne({ sku: data.sku.toUpperCase() });
		if (existing) {
			throw new ApiError("SKU already exists", HTTP_STATUS.CONFLICT);
		}
		product.sku = data.sku.toUpperCase();
	}

	if (imageFile) {
		await deleteImage(product.imagePublicId);
		const uploaded = await uploadImage(imageFile.buffer, "erp/products");
		product.imageUrl = uploaded.secure_url;
		product.imagePublicId = uploaded.public_id;
	}

	if (data.category !== undefined) {
		const categoryName = data.category.toLowerCase();
		const exists = await categoryExists(categoryName);
		if (!exists) {
			throw new ApiError("Category does not exist", HTTP_STATUS.BAD_REQUEST);
		}
		product.category = categoryName;
	}

	if (data.name !== undefined) product.name = data.name;
	if (data.purchasePrice !== undefined)
		product.purchasePrice = data.purchasePrice;
	if (data.sellingPrice !== undefined) product.sellingPrice = data.sellingPrice;
	if (data.stockQuantity !== undefined)
		product.stockQuantity = data.stockQuantity;

	await product.save();
	return product.toObject() as IProduct;
};

export const deleteProduct = async (id: string): Promise<IProduct> => {
	const product = await Product.findById(id);
	if (!product) {
		throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
	}
	await product.deleteOne();
	return product.toObject() as IProduct;
};
