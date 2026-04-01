import db from './db.js';
import { json } from 'express';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { companyId, type } = req.query;
      const filter = {};
      if (companyId) filter.companyId = companyId;
      if (type) filter.type = type;
      const docs = await db.getDocuments(filter);
      res.status(200).json(docs);
    } else if (req.method === 'POST') {
      const doc = req.body;
      const saved = await db.saveDocument(doc);
      res.status(200).json(saved);
    } else if (req.method === 'PUT') {
      const doc = req.body;
      if (!doc.id) throw new Error('ID required');
      const updated = await db.saveDocument(doc);
      res.status(200).json(updated);
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) throw new Error('ID required');
      await db.deleteDocument(id);
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

