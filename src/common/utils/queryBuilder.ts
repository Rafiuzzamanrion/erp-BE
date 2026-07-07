import { Model } from "mongoose";

interface QueryParams {
	[key: string]: unknown;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

const RESERVED_KEYS = new Set(["search", "sort", "page", "limit"]);

export class QueryBuilder<T> {
	private model: Model<T>;
	private queryObj: QueryParams;
	private filterObj: Record<string, unknown>;
	private sortStr = "-createdAt";
	private _page = 1;
	private _limit = 10;
	private selectStr?: string;
	private populatePaths: Array<{ path: string; select?: string }> = [];

	constructor(
		model: Model<T>,
		queryObj: QueryParams,
		baseFilter: Record<string, unknown> = {}
	) {
		this.model = model;
		this.queryObj = queryObj;
		this.filterObj = { ...baseFilter };
	}

	search(fields: string[]): this {
		const searchVal = this.queryObj.search;
		if (searchVal && typeof searchVal === "string" && fields.length > 0) {
			const searchRegex = new RegExp(
				searchVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
				"i"
			);
			this.filterObj.$or = fields.map((field) => ({
				[field]: { $regex: searchRegex },
			}));
		}
		return this;
	}

	filter(fields: string[]): this {
		for (const field of fields) {
			const val = this.queryObj[field];
			if (val !== undefined && val !== "" && !RESERVED_KEYS.has(field)) {
				this.filterObj[field] = val;
			}
		}
		return this;
	}

	sort(defaultSort = "-createdAt"): this {
		const rawSort =
			(typeof this.queryObj.sort === "string"
				? this.queryObj.sort
				: undefined) || defaultSort;
		this.sortStr = rawSort
			.split(",")
			.map((s) => (s.startsWith("-") ? `-${s.substring(1)}` : s))
			.join(" ");
		return this;
	}

	paginate(page?: number, limit?: number): this {
		this._page = page || 1;
		this._limit = limit || 10;
		return this;
	}

	select(fields: string): this {
		this.selectStr = fields;
		return this;
	}

	populate(path: string, select?: string): this {
		this.populatePaths.push({ path, select });
		return this;
	}

	async execute(): Promise<{ data: unknown[]; meta: PaginationMeta }> {
		const skip = (this._page - 1) * this._limit;
		let query = this.model
			.find(this.filterObj)
			.sort(this.sortStr)
			.skip(skip)
			.limit(this._limit);

		if (this.selectStr) {
			query = query.select(this.selectStr);
		}

		for (const { path, select } of this.populatePaths) {
			query = query.populate(path, select);
		}

		const [data, total] = await Promise.all([
			query.lean().exec(),
			this.model.countDocuments(this.filterObj),
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
