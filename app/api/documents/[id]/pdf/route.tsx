import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import Company from '@/models/Company';
import Contact from '@/models/Contact';
import { renderToBuffer } from '@react-pdf/renderer';
import { PDFTemplate } from '@/components/PDFTemplate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const document = await Document.findById(id).populate('company').populate('billTo').populate('shipTo');
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const company = await Company.findById(document.company);
    const billTo = document.billTo ? await Contact.findById(document.billTo) : null;

    const pdfBuffer = await renderToBuffer(
      <PDFTemplate document={document} company={company} billTo={billTo} />
    );

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.type}-${document.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}