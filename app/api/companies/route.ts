import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';

export async function GET() {
  try {
    await dbConnect();
    const companies = await Company.find({});
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const company = new Company(body);
    await company.save();
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}