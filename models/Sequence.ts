import mongoose, { Schema, Document } from 'mongoose';

export interface ISequence extends Document {
  company: mongoose.Types.ObjectId;
  type: string;
  year: number;
  counter: number;
}

const SequenceSchema: Schema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  type: { type: String, required: true },
  year: { type: Number, required: true },
  counter: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

// Unique index for company, type, year
SequenceSchema.index({ company: 1, type: 1, year: 1 }, { unique: true });

export default mongoose.models.Sequence || mongoose.model<ISequence>('Sequence', SequenceSchema);