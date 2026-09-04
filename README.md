# Kabadiwala Connect — Backend API

**SIH 2026 Problem Statement**: `SIH26229 — Kabadiwala Connect`  
Production-ready backend service built with Node.js, Express, PostgreSQL, and Prisma ORM.

---

## 📚 API Documentation

* **Interactive Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
* **OpenAPI 3.0 JSON Specification**: [http://localhost:5000/api/docs/json](http://localhost:5000/api/docs/json)
* **Markdown Reference**: [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

---

## ⚙️ Environment Variables

Copy the `.env.example` template to `.env`:
```bash
cp .env.example .env
```

Configure the following variables in your `.env` file:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/kabadiwala_connect?schema=public` | PostgreSQL connection URI |
| `JWT_SECRET` | *(secret string)* | Cryptographic secret for signing and verifying JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration (e.g. `1h`, `7d`, `30d`) |

---

## 🚀 Setup & Database Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup & Migrations
Ensure PostgreSQL is running locally or via Docker, then apply the Prisma schema to your database:

* **Generate Prisma Client:**
  ```bash
  npx prisma generate
  ```

* **Create & Apply Migration (Production/Dev):**
  ```bash
  npx prisma migrate dev --name init
  ```

* **Quick Schema Push (Alternative for rapid prototype syncing):**
  ```bash
  npx prisma db push
  ```

### 3. Seed Realistic Demo Data
Populate the database with demo users, 12 e-waste materials, 192 historical price points, 25 certified recyclers with Delhi NCR geolocations, 55 lots, 105 transactions, and 48 QR handover records:
```bash
npm run seed
```
*(Or run `npx prisma db seed`)*

---

## 🖥️ Server Start Commands

* **Production Mode:**
  ```bash
  npm start
  ```

* **Development Mode (with Nodemon hot-reloading):**
  ```bash
  npm run dev
  ```

Once running, access the server at `http://localhost:5000` and interactive docs at `http://localhost:5000/api/docs`.

---

## 🧪 Testing

Run all automated test suites (Health, Auth, Materials, Prices, Recyclers, Recommendations, Lots, Transactions, Handover, Earnings, Docs):
```bash
npm test
```

---

## 📂 Project Structure

```text
backend/
├── docs/
│   └── API_DOCUMENTATION.md  # Comprehensive Markdown API specifications
├── prisma/
│   ├── schema.prisma         # Prisma data models & relations
│   └── seed.js               # Realistic seed generator script
├── src/
│   ├── config/               # Environment & database configuration
│   ├── controllers/          # Route controller handlers
│   ├── docs/                 # OpenAPI 3.0 document definitions
│   ├── middleware/           # Auth, role authorization, error handling
│   ├── routes/               # Modular route definitions
│   ├── services/             # Business logic layer
│   ├── tests/                # Automated integration test suites
│   ├── utils/                # Standardized API response helpers
│   ├── validators/           # Request schema validation
│   ├── app.js                # Express app setup and middleware registration
│   └── server.js             # Server initialization and lifecycle management
├── .env.example              # Sample environment variable template
├── .gitignore                # Git ignore configuration
└── package.json              # Project dependencies and run scripts
```

---

## 🔌 API Endpoints Summary

### Documentation & Health
* `GET /api/docs` - Interactive Swagger UI documentation
* `GET /api/docs/json` - OpenAPI 3.0 specification in JSON format
* `GET /api/health` - Health check status endpoint

### Authentication
* `POST /api/auth/register` - Register a new user (`COLLECTOR`, `RECYCLER`, `ADMIN`)
* `POST /api/auth/login` - Authenticate credentials and receive JWT
* `GET /api/auth/me` - Protected endpoint returning authenticated user profile

### Materials & Prices
* `GET /api/materials` - List e-waste materials (supports `?search=`)
* `GET /api/materials/:id` - Get material details by ID with current benchmark price
* `POST /api/materials` - *(Admin only)* Create a new material catalog entry
* `PATCH /api/materials/:id` - *(Admin only)* Update an existing material
* `DELETE /api/materials/:id` - *(Admin only)* Delete a material
* `GET /api/prices/:materialId` - Retrieve historical price records for a material
* `POST /api/prices` - *(Admin only)* Add a new price rate (preserves historical ledger)
* `PATCH /api/prices/:id` - *(Admin only)* Update an existing price entry

### Recyclers & Recommendations
* `GET /api/recyclers` - List recyclers with filtering (`?authorized=`, `?pickupAvailable=`, `?materialId=`, `?search=`)
* `GET /api/recyclers/recommended?lotId=<LOT_ID>` - Transparent matching engine scoring Price (30%), Distance (25%), Material Compatibility (20%), Authorization (15%), and Pickup Availability (10%)
* `GET /api/recyclers/:id` - Get recycler details, coordinates, and accepted materials
* `GET /api/recyclers/:id/materials` - List materials accepted by a recycler with current spot prices
* `POST /api/recyclers` - *(Admin only)* Create a new recycler profile & facility account
* `PATCH /api/recyclers/:id` - *(Admin only)* Update recycler information or supported materials

### E-Waste Lots
* `POST /api/lots` - *(Collector only)* Create a new e-waste lot with backend price calculation & unique lot identifier
* `GET /api/lots/my-lots` - *(Collector only)* Retrieve lots created by the authenticated collector
* `GET /api/lots/:id` - View single lot details (restricted to owner, recyclers, and admin)
* `PATCH /api/lots/:id/status` - Transition lot lifecycle status (`AVAILABLE` -> `ASSIGNED` -> `IN_TRANSIT` -> `COMPLETED` / `CANCELLED`)

### Transactions
* `POST /api/transactions` - *(Collector only)* Initiate a transaction with a compatible recycler (`totalAmount` computed on backend)
* `GET /api/transactions/my-transactions` - Retrieve transactions involving user (supports `?status=` filter)
* `GET /api/transactions/:id` - Get comprehensive details of a transaction (restricted to participants and admin)
* `PATCH /api/transactions/:id/status` - Transition transaction lifecycle and synchronize lot status

### QR-Based Handover
* `POST /api/handover/create` - *(Collector only)* Generate a unique handover QR code identifier (`QR-KC-2026-XXXXXXXX`) for an accepted transaction
* `POST /api/handover/verify` - *(Recycler only)* Scan and verify the collector's handover QR code. Validates assigned recycler, verifies scale weight and material, marks handover verified, transitions transaction & lot status to `COMPLETED`, records `pickupTime`, and prevents repeated scans
* `GET /api/handover/:id` - Retrieve handover details and verification audit trail by handover UUID or QR identifier

### Collector Earnings
* `GET /api/earnings/me` - *(Collector only)* Retrieve real-time calculated earnings analytics aggregated directly from completed transactions (today's, this week's, this month's, total earnings, completed transactions count, total e-waste weight sold, material breakdown, recent history)
