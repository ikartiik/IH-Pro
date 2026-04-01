import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  legalName: string;
  trn: string;
  address: string;
  city: string;
  country: string;
  poBox: string;
  phone: string;
  email: string;
  website: string;
  logo?: string; // base64 or url
  signature?: string; // base64 or url
  stamp?: string; // base64 or url
  currency: string;
  paymentTerms: string;
  notes: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  branch: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  legalName: { type: String, required: true },
  trn: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  poBox: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  logo: { type: String },
  signature: { type: String },
  stamp: { type: String },
  currency: { type: String, required: true, default: 'AED' },
  paymentTerms: { type: String, required: true, default: 'Net 30' },
  notes: { type: String },
  bankName: { type: String },
  accountName: { type: String },
  accountNumber: { type: String },
  iban: { type: String },
  swift: { type: String },
  branch: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);