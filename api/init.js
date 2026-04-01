import db from './db.js';
import { json } from 'express';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
  }

  try {
    const dbConn = await db.connect();
    const companies = await dbConn.collection('companies').countDocuments();
    const docs = await dbConn.collection('documents').countDocuments();

    if (companies === 0) {
      // Seed sample company
      const sampleCo = {
        name: 'Sample Trading LLC',
        email: 'info@sample.com',
        phone: '+971 4 123 4567',
        address: 'Business Bay, Dubai, UAE',
        currency: 'AED',
        color: '#1e3a2f',
        taxId: 'TRN123456789',
        logo: '',
        signature: ''
      };
      await db.saveCompany(sampleCo);
    }

    res.status(200).json({ 
      success: true, 
      seeded: companies === 0,
      stats: { companies, documents: docs } 
    });
  } catch (error) {
    console.error('Init Error:', error);
    res.status(500).json({ error: error.message });
  }
}

