import { Model, Document, Query } from "mongoose";

interface QueryParams {
	[key: string]: unknown;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export class QueryBuilder<T extends Document> {
	private modelQuery: Query<unknown[], unknown>;
	private queryObj: QueryParams;
	private _page = 1;
	private _limit = 10;

	constructor(
		model: Model<T>,
		queryObj: QueryParams,
		baseFilter: Record<string, unknown> = {}
	) {
		this.modelQuery = model.find(baseFilter) as unknown as Query<unknown[], unknown>;
		this.queryObj = queryObj;
	}

	search(fields: string[]): this {
		const searchVal = this.queryObj.search;
		if (searchVal && typeof searchVal === "string" && fields.length > 0) {
			const searchRegex = new RegExp(
				searchVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
				"i"
			);
			const orConditions = fields.map((field) => ({
				[field]: { $regex: searchRegex },
			}));
			this.modelQuery = this.modelQuery.find({
				$or: orConditions,
			}) as unknown as Query<unknown[], unknown>;
		}
		return this;
	}

	filter(fields: string[]): this {
		const filterObj: Record<string, unknown> = {};
		const reserved = ["search", "sort", "page", "limit"];
		for (const field of fields) {
			const val = this.queryObj[field];
			if (val !== undefined && !reserved.includes(field)) {
				filterObj[field] = val;
			}
		}
		if (Object.keys(filterObj).length > 0) {
			this.modelQuery = this.modelQuery.find(
				filterObj
			) as unknown as Query<unknown[], unknown>;
		}
		return this;
	}

	sort(defaultSort = "-createdAt"): this {
		const sortBy =
			(typeof this.queryObj.sort === "string"
				? this.queryObj.sort
				: undefined) || defaultSort;
		const sortStr = sortBy
			.split(",")
			.map((s) => (s.startsWith("-") ? `-${s.substring(1)}` : s))
			.join(" ");
		this.modelQuery = this.modelQuery.sort(
			sortStr
		) as unknown as Query<unknown[], unknown>;
		return this;
	}

	paginate(page?: number, limit?: number): this {
		this._page = page || 1;
		this._limit = limit || 10;
		const skip = (this._page - 1) * this._limit;
		this.modelQuery = this.modelQuery
			.skip(skip)
			.limit(this._limit) as unknown as Query<unknown[], unknown>;
		return this;
	}

	async execute(): Promise<{ data: unknown[]; meta: PaginationMeta }> {
		const [data, total] = await Promise.all([
			this.modelQuery.lean().exec(),
			(this.modelQuery.model as Model<T>).countDocuments(
				this.modelQuery.getFilter()
			),
		]);
		return {
			data,
			meta: {
				page: this._page,
				limit: this._limit,
				total,
				totalPages: Math.ceil(total / this._limit),
			},
		};
	}
}
