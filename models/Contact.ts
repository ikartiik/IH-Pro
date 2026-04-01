import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  company: string;
  address: string;
  trn: string;
  email: string;
  phone: string;
  currency: string;
  paymentTerms: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
  name: { type: String, required: true },
  company: { type: String },
  address: { type: String },
  trn: { type: String },
  email: { type: String },
  phone: { type: String },
  currency: { type: String, default: 'AED' },
  paymentTerms: { type: String, default: 'Net 30' },
}, {
  timestamps: true,
});

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);