import dbConnect from './mongodb';
import Sequence from '@/models/Sequence';

export async function getNextSequence(companyId: string, type: string, year: number): Promise<string> {
  await dbConnect();

  const sequence = await Sequence.findOneAndUpdate(
    { company: companyId, type, year },
    { $inc: { counter: 1 } },
    { new: true, upsert: true }
  );

  return `${type}-${year}-${String(sequence.counter).padStart(3, '0')}`;
}