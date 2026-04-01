import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import { getNextSequence } from '@/lib/sequence';
import { amountToWords } from '@/lib/amountToWords';

function calculateTotals(lines: any[], freight: number = 0) {
  let subtotal = 0;
  let vatAmount = 0;
  let taxableAmount = 0;

  lines.forEach(line => {
    const lineTotal = line.quantity * line.price * (1 - line.discount / 100);
    line.total = lineTotal;
    subtotal += lineTotal;
    if (line.tax > 0) {
      const taxAmount = lineTotal * (line.tax / 100);
      vatAmount += taxAmount;
      taxableAmount += lineTotal;
    }
  });

  const grandTotal = subtotal + vatAmount + freight;

  return {
    subtotal,
    discount: 0, // global discount not implemented
    taxableAmount,
    vatAmount,
    freight,
    grandTotal,
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const query: any = {};
    if (company) query.company = company;
    if (type) query.type = type;
    if (status) query.status = status;

    const documents = await Document.find(query).populate('company').populate('billTo').populate('shipTo');
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { lines, freight, currency, company, type, date } = body;

    const year = new Date(date).getFullYear();
    const number = await getNextSequence(company, type, year);

    const totals = calculateTotals(lines, freight);
    const amountInWords = amountToWords(totals.grandTotal, currency);

    const document = new Document({
      ...body,
      number,
      lines,
      ...totals,
      amountInWords,
    });

    await document.save();
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}