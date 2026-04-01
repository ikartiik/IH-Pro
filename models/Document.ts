import mongoose, { Schema, Document } from 'mongoose';

export type DocumentType = 'PI' | 'SO' | 'PO' | 'INV' | 'DN' | 'CN' | 'DBN' | 'REC' | 'QT' | 'SOA';
export type DocumentStatus = 'Draft' | 'Sent' | 'Accepted' | 'Paid' | 'Void' | 'Overdue';

export interface IDocumentLine {
  description: string;
  code?: string;
  unit: string;
  quantity: number;
  price: number;
  discount: number; // %
  tax: number; // %
  total: number;
}

export interface IDocument extends Document {
  type: DocumentType;
  number: string;
  date: Date;
  dueDate?: Date;
  deliveryDate?: Date;
  company: mongoose.Types.ObjectId;
  billTo?: mongoose.Types.ObjectId; // Contact
  shipTo?: mongoose.Types.ObjectId; // Contact
  reference?: string;
  currency: string;
  status: DocumentStatus;
  lines: IDocumentLine[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vatAmount: number;
  freight: number;
  grandTotal: number;
  amountInWords: string;
  notes: string;
  bankDetails: boolean;
  signature: boolean;
  stamp: boolean;
  disclaimer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentLineSchema: Schema = new Schema({
  description: { type: String, required: true },
  code: { type: String },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

const DocumentSchema: Schema = new Schema({
  type: { type: String, required: true, enum: ['PI', 'SO', 'PO', 'INV', 'DN', 'CN', 'DBN', 'REC', 'QT', 'SOA'] },
  number: { type: String, required: true },
  date: { type: Date, required: true },
  dueDate: { type: Date },
  deliveryDate: { type: Date },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  billTo: { type: Schema.Types.ObjectId, ref: 'Contact' },
  shipTo: { type: Schema.Types.ObjectId, ref: 'Contact' },
  reference: { type: String },
  currency: { type: String, required: true },
  status: { type: String, required: true, enum: ['Draft', 'Sent', 'Accepted', 'Paid', 'Void', 'Overdue'], default: 'Draft' },
  lines: [DocumentLineSchema],
  subtotal: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true, default: 0 },
  vatAmount: { type: Number, required: true, default: 0 },
  freight: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  amountInWords: { type: String, required: true },
  notes: { type: String },
  bankDetails: { type: Boolean, default: true },
  signature: { type: Boolean, default: true },
  stamp: { type: Boolean, default: false },
  disclaimer: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Index for unique number per company per type per year
DocumentSchema.index({ company: 1, type: 1, number: 1 }, { unique: true });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);