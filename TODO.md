y
# DocuVault Vercel + MongoDB Deployment TODO

## [x] 1. Project Setup (Scaffolding)
- [x] Create package.json (Node deps)
- [x] Create vercel.json (config)
- [x] Create api/db.js (MongoDB connection/schemas)

## [x] 2. Backend API Endpoints
- [x] Create api/companies.js (CRUD companies)
- [x] Create api/documents.js (CRUD documents)
- [x] Create api/init.js (seed initial data)

## [ ] 3. Frontend Integration
- [ ] Edit IH Pro.html: Replace localStorage with API calls
  - Update persist()/hydrate() → async API
  - Add loading/error states
  - Update all CRUD funcs (add/edit companies, docs)

## [x] 4. Install & Test Locally
- [x] npm install
- [ ] vercel dev (test API + frontend)
- [ ] Fix any issues

## [x] 5. Deploy
- [x] User: Create MongoDB Atlas cluster, get MONGODB_URI
- [ ] User: Git init, commit, push to GitHub
- [x] User: Connect Vercel, deploy, set MONGODB_URI env var
- [ ] Test live site

**Progress: Deployed to Vercel (set MONGODB_URI next). Backend complete. Frontend integration pending.**


