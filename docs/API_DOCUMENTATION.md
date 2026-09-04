# Kabadiwala Connect — API Documentation

**Project**: Smart India Hackathon 2026 (Problem Statement: `SIH26229`)  
**Base URL**: `http://localhost:5000/api`  
**Interactive Swagger UI**: `http://localhost:5000/api/docs`  
**OpenAPI Specification JSON**: `http://localhost:5000/api/docs/json`  

---

## Table of Contents
1. [General Information & Security](#general-information--security)
2. [Health Checks](#health-checks)
3. [Authentication](#authentication)
4. [Materials](#materials)
5. [Prices](#prices)
6. [Recyclers](#recyclers)
7. [Recycler Recommendations](#recycler-recommendations)
8. [E-Waste Lots](#e-waste-lots)
9. [Transactions](#transactions)
10. [QR-Based Handover](#qr-based-handover)
11. [Collector Earnings](#collector-earnings)

---

## General Information & Security

### Authentication Scheme
All protected endpoints require a JSON Web Token (JWT) provided in the `Authorization` request header:
```http
Authorization: Bearer <your_jwt_token>
```

### User Roles & Permissions
- **`COLLECTOR`**: Can create and view their own lots, initiate transactions, generate handover QR codes, and view personal earnings.
- **`RECYCLER`**: Can view assigned transactions, inspect and scan/verify physical handover QR codes.
- **`ADMIN`**: Platform administrators with complete catalog, pricing, and system management privileges.

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": null
}
```

---

## Health Checks

### `GET /api/health`
Verify server uptime and database connectivity status.

- **Authentication**: None (Public)
- **Role Required**: None
- **Parameters**: None
- **Request Body**: None

**Example Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:5000
```

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "Kabadiwala Connect API is running"
}
```

**HTTP Status Codes:**
- `200 OK`: System operational.

---

## Authentication

### `POST /api/auth/register`
Register a new user account as Collector, Recycler, or Admin.

- **Authentication**: None (Public)
- **Role Required**: None
- **Parameters**: None
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | Yes | Full name of the user |
  | `email` | String | Yes | Unique valid email address |
  | `password` | String | Yes | Minimum 6 characters (hashed with bcrypt, 10 rounds) |
  | `phone` | String | No | Contact phone number |
  | `role` | String | No | `COLLECTOR` (default), `RECYCLER`, or `ADMIN` |

**Example Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "Ramesh Kumar",
  "email": "ramesh@kconnect.demo",
  "password": "Password@123",
  "phone": "+919811001001",
  "role": "COLLECTOR"
}
```

**Example Successful Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "c1a2b3c4-0001-4000-8000-000000000001",
      "name": "Ramesh Kumar",
      "email": "ramesh@kconnect.demo",
      "phone": "+919811001001",
      "role": "COLLECTOR",
      "createdAt": "2026-09-04T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Example Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "A user with this email address already exists."
}
```

**HTTP Status Codes:**
- `201 Created`: User successfully registered.
- `400 Bad Request`: Validation failure or duplicate email address.

---

### `POST /api/auth/login`
Authenticate credentials and issue a signed JWT token.

- **Authentication**: None (Public)
- **Role Required**: None
- **Parameters**: None
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Registered email address |
  | `password` | String | Yes | Account password |

**Example Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "ramesh@kconnect.demo",
  "password": "Password@123"
}
```

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "c1a2b3c4-0001-4000-8000-000000000001",
      "name": "Ramesh Kumar",
      "email": "ramesh@kconnect.demo",
      "role": "COLLECTOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Example Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**HTTP Status Codes:**
- `200 OK`: Successfully authenticated.
- `400 Bad Request`: Missing email or password.
- `401 Unauthorized`: Invalid credentials.

---

### `GET /api/auth/me`
Retrieve authenticated user profile. Passwords are strictly excluded.

- **Authentication**: Required (`Bearer <token>`)
- **Role Required**: Any
- **Parameters**: None
- **Request Body**: None

**Example Request:**
```http
GET /api/auth/me HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
```

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "Current user profile retrieved",
  "data": {
    "id": "c1a2b3c4-0001-4000-8000-000000000001",
    "name": "Ramesh Kumar",
    "email": "ramesh@kconnect.demo",
    "phone": "+919811001001",
    "role": "COLLECTOR"
  }
}
```

**HTTP Status Codes:**
- `200 OK`: Profile retrieved.
- `401 Unauthorized`: Token missing, expired, or invalid.

---

## Materials

### `GET /api/materials`
List catalog of standardized e-waste materials with current benchmark prices.

- **Authentication**: None (Public)
- **Role Required**: None
- **Parameters**:
  - `search` *(optional query string)*: Filter by material name or code.
- **Request Body**: None

**Example Request:**
```http
GET /api/materials?search=PCB HTTP/1.1
Host: localhost:5000
```

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "mat-001",
      "name": "Printed Circuit Boards (Grade A)",
      "code": "MAT-PCB-A",
      "description": "High-grade server and desktop motherboards",
      "unit": "kg",
      "currentPrice": {
        "pricePerKg": 520.00,
        "location": "Delhi NCR",
        "validFrom": "2026-08-01T00:00:00.000Z"
      }
    }
  ]
}
```

---

### `GET /api/materials/:id`
Get full details of a specific material including recent price records.

- **Authentication**: None (Public)
- **Role Required**: None
- **Parameters**: `id` *(path, UUID string)*
- **Request Body**: None

**HTTP Status Codes:**
- `200 OK`: Found.
- `404 Not Found`: Material ID does not exist.

---

### `POST /api/materials`
Create a new e-waste material in the catalog.

- **Authentication**: Required
- **Role Required**: `ADMIN`
- **Request Body**:
  ```json
  {
    "name": "Lithium Iron Phosphate (LFP) Cells",
    "code": "MAT-LFP-01",
    "description": "High-capacity EV and ESS battery packs",
    "unit": "kg"
  }
  ```

**HTTP Status Codes:**
- `201 Created`: Created successfully.
- `403 Forbidden`: Non-admin caller.

---

### `PATCH /api/materials/:id`
Update an existing material catalog entry.

- **Authentication**: Required (`ADMIN`)
- **Parameters**: `id` *(path, UUID string)*
- **Request Body**: Partial update fields (`name`, `description`, `unit`).

---

### `DELETE /api/materials/:id`
Delete an unused material catalog entry.

- **Authentication**: Required (`ADMIN`)
- **Parameters**: `id` *(path, UUID string)*

---

## Prices

### `GET /api/prices/:materialId`
Retrieve historical price ledger for a material.

- **Authentication**: None (Public)
- **Parameters**: `materialId` *(path, UUID string)*
- **Request Body**: None

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pr-001",
      "pricePerKg": 520.00,
      "location": "Delhi NCR",
      "source": "CPCB Benchmark",
      "validFrom": "2026-08-01T00:00:00.000Z",
      "validTo": null
    },
    {
      "id": "pr-002",
      "pricePerKg": 490.00,
      "location": "Delhi NCR",
      "source": "Market Survey",
      "validFrom": "2026-07-01T00:00:00.000Z",
      "validTo": "2026-08-01T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/prices`
Record a new benchmark price rate (preserves previous historical records).

- **Authentication**: Required (`ADMIN`)
- **Request Body**:
  ```json
  {
    "materialId": "mat-001",
    "pricePerKg": 550.00,
    "location": "Delhi NCR",
    "source": "Government Benchmark / CPCB",
    "validFrom": "2026-09-01T00:00:00.000Z"
  }
  ```

---

### `PATCH /api/prices/:id`
Update validity date or rate of a price record.

- **Authentication**: Required (`ADMIN`)
- **Parameters**: `id` *(path, UUID string)*

---

## Recyclers

### `GET /api/recyclers`
List certified recyclers with multi-criteria filtering.

- **Authentication**: None (Public)
- **Parameters (Query)**:
  - `authorized`: `true` / `false`
  - `pickupAvailable`: `true` / `false`
  - `materialId`: UUID of accepted material
  - `search`: Name or address keyword
- **Example Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "rec-001",
        "name": "EcoGreen E-Waste Recyclers Pvt Ltd",
        "address": "Plot 42, Mayapuri Phase 1, New Delhi",
        "latitude": 28.6342,
        "longitude": 77.1265,
        "authorizedStatus": true,
        "authorizationId": "CPCB/EW-REG/DL/2024/001",
        "pickupAvailable": true,
        "contactInfo": "+91-11-25910001",
        "supportedMaterials": [
          { "id": "mat-001", "name": "Printed Circuit Boards (Grade A)" }
        ]
      }
    ]
  }
  ```

---

### `GET /api/recyclers/:id`
Get full recycler profile by UUID.

---

### `GET /api/recyclers/:id/materials`
List materials accepted by a specific recycler with current spot market rates.

---

### `POST /api/recyclers`
Register a new certified recycler facility profile.

- **Authentication**: Required (`ADMIN`)
- **Request Body**:
  ```json
  {
    "userId": "user-uuid",
    "name": "Bharat Metal & Electronic Dismantlers",
    "address": "B-12, Mayapuri Phase 2, New Delhi",
    "latitude": 28.6385,
    "longitude": 77.1298,
    "authorizedStatus": true,
    "authorizationId": "CPCB/EW-REG/DL/2024/002",
    "pickupAvailable": true,
    "contactInfo": "+91-11-25910002",
    "supportedMaterialIds": ["mat-001", "mat-002"]
  }
  ```

---

### `PATCH /api/recyclers/:id`
Update an existing recycler facility profile or supported materials.

- **Authentication**: Required (`ADMIN`)

---

## Recycler Recommendations

### `GET /api/recyclers/recommended?lotId=<LOT_ID>`
Multi-factor transparent recycler recommendation engine.

- **Authentication**: Required (`Bearer <token>`)
- **Role Required**: Any
- **Parameters**: `lotId` *(required query string, UUID)*

#### Scoring Formula
Calculates a normalized 0–100 score across 5 explainable components:
$$\text{finalScore} = (0.30 \times \text{Price}) + (0.25 \times \text{Distance}) + (0.20 \times \text{Material}) + (0.15 \times \text{Auth}) + (0.10 \times \text{Pickup})$$

**Example Request:**
```http
GET /api/recyclers/recommended?lotId=lot-001 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGci...
```

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "Top recommended recyclers calculated successfully",
  "data": {
    "lot": {
      "id": "lot-001",
      "lotNumber": "LOT-2026-10293",
      "material": "Printed Circuit Boards (Grade A)",
      "weightKg": 25.0
    },
    "recommendations": [
      {
        "recyclerId": "rec-001",
        "name": "EcoGreen E-Waste Recyclers Pvt Ltd",
        "address": "Plot 42, Mayapuri Phase 1, New Delhi",
        "distanceKm": 2.15,
        "authorized": true,
        "pickupAvailable": true,
        "finalScore": 92.40,
        "scoreBreakdown": {
          "priceScore": { "score": 95.0, "weight": 0.30, "contribution": 28.5 },
          "distanceScore": { "score": 89.6, "weight": 0.25, "contribution": 22.4 },
          "materialScore": { "score": 100.0, "weight": 0.20, "contribution": 20.0 },
          "authorizationScore": { "score": 100.0, "weight": 0.15, "contribution": 15.0 },
          "pickupScore": { "score": 100.0, "weight": 0.10, "contribution": 10.0 }
        }
      }
    ]
  }
}
```

---

## E-Waste Lots

### `POST /api/lots`
Create a new aggregated e-waste lot.

- **Authentication**: Required (`Bearer <token>`)
- **Role Required**: `COLLECTOR`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `materialId` | String | Yes | Material UUID |
  | `weight` | Number | Yes | Positive decimal weight in kg |
  | `collectorLocation` | String | Yes | Pickup depot / neighborhood |
  | `latitude` | Number | No | Depot latitude |
  | `longitude` | Number | No | Depot longitude |
  | `imageUrl` | String | No | Photo URL of the material lot |

*Note: The backend retrieves the current spot rate and calculates `estimatedPrice = weight * rate`. Client values for estimated price are never trusted.*

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "E-waste lot created successfully",
  "data": {
    "id": "lot-001",
    "lotNumber": "LOT-2026-89214",
    "materialId": "mat-001",
    "weight": 20.0,
    "estimatedPrice": 10400.00,
    "status": "AVAILABLE",
    "collectorLocation": "Mayapuri Depot Gate 2, Delhi"
  }
}
```

---

### `GET /api/lots/my-lots`
Retrieve all lots created by the authenticated collector.

- **Authentication**: Required (`COLLECTOR`)

---

### `GET /api/lots/:id`
View details of a specific lot. Access restricted to owner, recyclers, and admin.

---

### `PATCH /api/lots/:id/status`
Transition lot lifecycle status (`AVAILABLE` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `COMPLETED` / `CANCELLED`).

---

## Transactions

### `POST /api/transactions`
Initiate a transaction between collector and a compatible recycler.

- **Authentication**: Required (`COLLECTOR`)
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `lotId` | String | Yes | Owned lot in `AVAILABLE` status |
  | `recyclerId` | String | Yes | Recycler compatible with lot material |
  | `offeredPrice` | Number | No | Custom price per kg (defaults to spot rate) |

*The backend computes `totalAmount = weight * agreedPrice`.*

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Transaction initiated successfully",
  "data": {
    "id": "tx-001",
    "lotId": "lot-001",
    "collectorId": "col-001",
    "recyclerId": "rec-001",
    "offeredPrice": 520.00,
    "totalAmount": 10400.00,
    "transactionStatus": "PENDING",
    "paymentStatus": "PENDING"
  }
}
```

---

### `GET /api/transactions/my-transactions`
List transactions involving the authenticated user (Collector or Recycler). Supports `?status=` filter.

---

### `GET /api/transactions/:id`
Get full transaction details. Restricted to participants and admin.

---

### `PATCH /api/transactions/:id/status`
Transition transaction status and automatically synchronize lot state:
- `ACCEPTED` $\rightarrow$ Lot becomes `ASSIGNED`
- `PICKUP_SCHEDULED` $\rightarrow$ Lot becomes `IN_TRANSIT`
- `COMPLETED` $\rightarrow$ Lot becomes `COMPLETED`, payment simulated to `PAID`
- `CANCELLED` / `REJECTED` $\rightarrow$ Lot released back to `AVAILABLE`

---

## QR-Based Handover

### `POST /api/handover/create`
Generate a unique handover code and record when a transaction is accepted.

- **Authentication**: Required (`COLLECTOR`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "transactionId": "tx-001",
    "location": "Mayapuri Depot Gate 2, Delhi"
  }
  ```

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Handover record created successfully. Display QR code to recycler.",
  "data": {
    "handover": {
      "id": "ho-001",
      "qrIdentifier": "QR-KC-2026-F9A83B1C",
      "status": "PENDING",
      "location": "Mayapuri Depot Gate 2, Delhi"
    },
    "qrData": {
      "code": "QR-KC-2026-F9A83B1C",
      "material": "Printed Circuit Boards (Grade A)",
      "lotWeight": 20.0,
      "instruction": "Display this code or QR to the authorized recycler upon physical material inspection"
    }
  }
}
```

---

### `POST /api/handover/verify`
Recycler scans the QR code at the physical pickup point. Verifies assigned recycler identity, validates scale weight, transitions transaction and lot to `COMPLETED`, records `pickupTime`, and locks against replay attacks.

- **Authentication**: Required (`RECYCLER`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "qrCode": "QR-KC-2026-F9A83B1C",
    "verifiedWeight": 19.8,
    "notes": "Verified PCB Grade A, digital scale reading 19.8 kg"
  }
  ```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Handover successfully verified and transaction completed.",
  "data": {
    "verified": true,
    "auditTrail": {
      "handoverId": "ho-001",
      "qrIdentifier": "QR-KC-2026-F9A83B1C",
      "handoverStatus": "VERIFIED",
      "pickupTime": "2026-09-04T10:30:00.000Z",
      "verifiedWeight": 19.8,
      "transaction": {
        "id": "tx-001",
        "transactionStatus": "COMPLETED",
        "paymentStatus": "PAID",
        "totalAmount": 10296.00,
        "completedAt": "2026-09-04T10:30:00.000Z"
      },
      "lot": {
        "id": "lot-001",
        "status": "COMPLETED"
      }
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK`: Handover verified and completed.
- `400 Bad Request`: Repeated scan / duplicate attempt.
- `403 Forbidden`: Scanning recycler does not match assigned recycler.
- `404 Not Found`: Invalid QR code.

---

### `GET /api/handover/:id`
Retrieve handover record and complete audit trail by UUID or QR code string.

- **Authentication**: Required (Participants or Admin)

---

## Collector Earnings

### `GET /api/earnings/me`
Real-time calculated collector earnings dynamically aggregated from completed transactions.

- **Authentication**: Required (`Bearer <token>`)
- **Role Required**: `COLLECTOR` only
- **Parameters**: None
- **Request Body**: None

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "message": "Collector earnings calculated successfully",
  "data": {
    "collector": {
      "id": "col-001",
      "name": "Ramesh Kumar",
      "email": "ramesh@kconnect.demo"
    },
    "currency": "INR",
    "summary": {
      "todayEarnings": 3000.00,
      "thisWeekEarnings": 15000.00,
      "thisMonthEarnings": 24000.00,
      "totalEarnings": 85000.00,
      "completedTransactionsCount": 14,
      "totalWeightSoldKg": 325.50,
      "averageEarningPerTransaction": 6071.43,
      "averagePricePerKg": 261.14
    },
    "materialBreakdown": [
      {
        "materialName": "Printed Circuit Boards (Grade A)",
        "totalEarnings": 52000.00,
        "weightSoldKg": 100.00,
        "transactionCount": 8
      }
    ],
    "recentTransactions": [
      {
        "id": "tx-001",
        "lotNumber": "LOT-2026-89214",
        "materialName": "Printed Circuit Boards (Grade A)",
        "weightKg": 19.8,
        "totalAmount": 10296.00,
        "recyclerName": "EcoGreen E-Waste Recyclers Pvt Ltd",
        "completedAt": "2026-09-04T10:30:00.000Z"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK`: Earnings computed successfully.
- `401 Unauthorized`: Token missing or invalid.
- `403 Forbidden`: Non-collector role (e.g. Recycler attempting access).
