import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  code?: string;
  description: string;
  unit: string;
  price: number;
  tax: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema({
  code: { type: String },
  description: { type: String, required: true },
  unit: { type: String, required: true, default: 'pcs' },
  price: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 5 }, // VAT %
}, {
  timestamps: true,
});

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);