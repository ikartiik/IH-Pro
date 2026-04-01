import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI env var not set');
}

let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db('docuvault');
  return db;
}

// Schemas enforced via JS validation
export async function getCompanies() {
  const db = await connect();
  return await db.collection('companies').find({}).toArray();
}

export async function saveCompany(company) {
  const db = await connect();
  const { id, ...data } = company;
  if (id) {
    await db.collection('companies').updateOne({ id }, { $set: data });
  } else {
    company.id = 'co_' + Date.now() + Math.random().toString(36).slice(2);
    await db.collection('companies').insertOne(company);
  }
  return company;
}

export async function deleteCompany(id) {
  const db = await connect();
  await db.collection('companies').deleteOne({ id });
  // TODO: cascade delete docs?
}

export async function getDocuments(filter = {}) {
  const db = await connect();
  let query = {};
  if (filter.companyId) query.companyId = filter.companyId;
  if (filter.type) query.type = filter.type;
  return await db.collection('documents').find(query).sort({ created: -1 }).toArray();
}

export async function saveDocument(doc) {
  const db = await connect();
  const { id, ...data } = doc;
  if (id) {
    await db.collection('documents').updateOne({ id }, { $set: data });
  } else {
    doc.id = 'doc_' + Date.now() + Math.random().toString(36).slice(2);
    doc.created = Date.now();
    await db.collection('documents').insertOne(doc);
  }
  return doc;
}

export async function deleteDocument(id) {
  const db = await connect();
  await db.collection('documents').deleteOne({ id });
}

export default { connect, getCompanies, saveCompany, deleteCompany, getDocuments, saveDocument, deleteDocument };

