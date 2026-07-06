import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ISale extends Document {
  items: ISaleItem[];
  grandTotal: number;
  soldBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    items: { type: [saleItemSchema], required: true, validate: { validator: (v: ISaleItem[]) => v.length > 0, message: "At least one item is required" } },
    grandTotal: { type: Number, required: true },
    soldBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

saleSchema.index({ createdAt: -1 });

export const Sale = mongoose.model<ISale>("Sale", saleSchema);
export default Sale;
