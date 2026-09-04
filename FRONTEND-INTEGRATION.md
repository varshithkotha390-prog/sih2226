# Frontend Integration Guide — Kabadiwala Connect (SIH26229)

> **Audience**: **Person 1 (Frontend Developer)**  
> **Prepared by**: **Person 2 (Backend & Database)**  
> **Backend Base URL**: `http://localhost:5000/api`  
> **Interactive Swagger UI**: `http://localhost:5000/api/docs`  
> **OpenAPI 3.0 JSON Specification**: `http://localhost:5000/api/docs/json`  

---

## Table of Contents
1. [Backend Base Configuration & Quick Start](#1-backend-base-configuration--quick-start)
2. [Authentication & Authorization Guide](#2-authentication--authorization-guide)
3. [CORS Configuration](#3-cors-configuration)
4. [Complete End-to-End Frontend Application Flow](#4-complete-end-to-end-frontend-application-flow)
5. [Verified API Reference](#5-verified-api-reference)
   - [A. Authentication](#a-authentication)
   - [B. Materials](#b-materials)
   - [C. Prices](#c-prices)
   - [D. Recyclers](#d-recyclers)
   - [E. E-Waste Lots](#e-e-waste-lots)
   - [F. Transactions](#f-transactions)
   - [G. QR-Based Handover](#g-qr-based-handover)
   - [H. Collector Earnings](#h-collector-earnings)
6. [Demo Test Accounts (Local Demo Only)](#6-demo-test-accounts-local-demo-only)
7. [Local Development & Setup for Person 1](#7-local-development--setup-for-person-1)
8. [Troubleshooting & Common Errors](#8-troubleshooting--common-errors)

---

## 1. Backend Base Configuration & Quick Start

* **Server Host**: `127.0.0.1` / `localhost`
* **Default Port**: `5000`
* **API Prefix**: All endpoints are prefixed with `/api`
* **Health Check**: `GET http://localhost:5000/api/health`

### Response Envelope Format
All successful JSON responses follow a standardized format:
```json
{
  "success": true,
  "message": "Human-readable confirmation message",
  "data": { ... }
}
```

All error responses follow this format:
```json
{
  "success": false,
  "message": "Detailed description of error",
  "error": null
}
```

---

## 2. Authentication & Authorization Guide

### How to Authenticate Protected Requests
When a user logs in via `POST /api/auth/login` or registers via `POST /api/auth/register`, the backend returns a signed JWT token in `data.token`.

Store this token securely in the frontend (e.g., `localStorage`, `sessionStorage`, or in-memory state with an auth context).

For **every protected request**, send the token in the `Authorization` HTTP header:
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Axios Interceptor Example (Frontend Setup)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kc_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens or unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('kc_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

> ⚠️ **CRITICAL SECURITY NOTE**:  
> Never expose, store, or bundle the backend `JWT_SECRET` in frontend source code. The frontend only needs to store the signed token string returned from the login endpoint.

---

## 3. CORS Configuration

### Current Backend Status
The Express backend has Cross-Origin Resource Sharing (CORS) enabled globally via:
```javascript
// src/app.js
app.use(cors());
```
* **Allowed Origins**: `*` (Wildcard enabled by default in development mode).
* **Supported Methods**: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`.
* **Allowed Headers**: Standard headers including `Content-Type` and `Authorization`.

### Recommendations for Person 1
1. If your frontend dev server runs on Vite (`http://localhost:5173`), Create React App (`http://localhost:3000`), or Next.js (`http://localhost:3000`), direct API requests to `http://localhost:5000/api` will succeed out of the box without CORS blockage.
2. Alternatively, you can configure a proxy in your frontend development server:
   ```javascript
   // vite.config.js example
   export default {
     server: {
       proxy: {
         '/api': 'http://localhost:5000'
       }
     }
   }
   ```

---

## 4. Complete End-to-End Frontend Application Flow

This section explains the exact sequence of screens and API interactions across the complete e-waste recycling lifecycle.

```
[1. Collector Login] 
       │
       ▼ (token)
[2. Get Materials Catalog] ──▶ (materialId)
       │
       ▼
[3. Create E-Waste Lot] ──▶ (lotId)
       │
       ▼
[4. Get Recommended Recyclers] ──▶ (recyclerId)
       │
       ▼
[5. Create Transaction] ──▶ (transactionId)
       │
       ▼ (Recycler accepts transaction)
[6. Collector Generates QR Code] ──▶ (qrCode string)
       │
       ▼ (Frontend displays QR image)
[7. Recycler Scans & Verifies QR] ──▶ (Scale weight verified)
       │
       ▼
[8. Transaction Completed & Simulated Payment]
       │
       ▼
[9. Collector Views Real-Time Earnings Dashboard]
```

### Stage-by-Stage Data Flow

| Stage | Action | API Endpoint Called | Method | Request Payload / Params | Data Returned & Carried Forward |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **1. Login** | Collector logs into portal | `/api/auth/login` | `POST` | `{ email, password }` | Save `token` & `user.role` |
| **2. Materials** | Display material selection dropdown | `/api/materials` | `GET` | *(None)* | List of materials $\rightarrow$ user selects `materialId` |
| **3. Create Lot** | Collector submits aggregated weight | `/api/lots` | `POST` | `{ materialId, weight, collectorLocation, latitude, longitude }` | Backend computes `estimatedPrice` $\rightarrow$ returns `lot.id` |
| **4. Recommend** | Recommend top recyclers for lot | `/api/recyclers/recommended` | `GET` | `?lotId=<lot.id>` | Ranked list with 5-factor score breakdown |
| **5. Transact** | Collector confirms deal with recycler | `/api/transactions` | `POST` | `{ lotId, recyclerId, offeredPrice }` | Backend calculates `totalAmount` $\rightarrow$ returns `transaction.id` |
| **6. Accept Deal**| Recycler accepts deal | `/api/transactions/:id/status`| `PATCH`| `{ status: "ACCEPTED" }` | Transitions transaction to `ACCEPTED`, lot to `ASSIGNED` |
| **7. Create QR** | Collector generates handover QR | `/api/handover/create` | `POST` | `{ transactionId }` | Returns `qrData.code` (e.g. `QR-KC-2026-XXXXXXXX`) |
| **8. Display QR**| Frontend renders QR image | *(Client QR Component)* | N/A | Convert `qrData.code` string into SVG/Canvas | Displays QR on collector screen |
| **9. Verify** | Recycler scans QR at depot | `/api/handover/verify` | `POST` | `{ qrCode, verifiedWeight, notes }` | Verifies scale weight $\rightarrow$ transaction & lot marked `COMPLETED` |
| **10. Earnings**| Collector views dashboard | `/api/earnings/me` | `GET` | *(None, Bearer token)* | Returns today, week, month, total earnings, weight sold, breakdown |

---

## 5. Verified API Reference

### A. Authentication

#### 1. Register User
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/register`
* **Authentication**: None (Public)
* **Required Role**: None
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Ramesh Kumar",
    "email": "ramesh.collector@kconnect.demo",
    "password": "Password@123",
    "phone": "+919811001001",
    "role": "COLLECTOR"
  }
  ```
* **Example Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "c1a2b3c4-0001-4000-8000-000000000001",
        "name": "Ramesh Kumar",
        "email": "ramesh.collector@kconnect.demo",
        "phone": "+919811001001",
        "role": "COLLECTOR",
        "createdAt": "2026-09-04T10:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request`: Validation failure or duplicate email (`"A user with this email address already exists."`).

---

#### 2. Login User
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Authentication**: None (Public)
* **Required Role**: None
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "ramesh.collector@kconnect.demo",
    "password": "Password@123"
  }
  ```
* **Example Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "c1a2b3c4-0001-4000-8000-000000000001",
        "name": "Ramesh Kumar",
        "email": "ramesh.collector@kconnect.demo",
        "role": "COLLECTOR"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request`: Email or password omitted.
  * `401 Unauthorized`: Invalid email or incorrect password.

---

#### 3. Get Current User Profile
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/auth/me`
* **Authentication**: Required
* **Required Role**: Any valid token
* **Headers**: `Authorization: Bearer <token>`
* **Example Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Current user profile retrieved",
    "data": {
      "id": "c1a2b3c4-0001-4000-8000-000000000001",
      "name": "Ramesh Kumar",
      "email": "ramesh.collector@kconnect.demo",
      "role": "COLLECTOR",
      "phone": "+919811001001"
    }
  }
  ```
* **Error Responses**:
  * `401 Unauthorized`: Missing or malformed token.

---

### B. Materials

#### 1. List Materials
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/materials`
* **Authentication**: None (Public)
* **Query Parameters**:
  * `search` *(optional string)*: Keyword search against name or material code.
* **Example Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "mat-001",
        "name": "Printed Circuit Boards (Grade A)",
        "code": "MAT-PCB-A",
        "description": "High-grade telecom and server motherboards with gold contacts",
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

#### 2. Get Material Details
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/materials/:id`
* **Authentication**: None (Public)
* **Path Parameters**: `id` *(Material UUID string)*
* **Example Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "mat-001",
      "name": "Printed Circuit Boards (Grade A)",
      "code": "MAT-PCB-A",
      "description": "High-grade telecom and server motherboards",
      "unit": "kg",
      "prices": [
        {
          "pricePerKg": 520.00,
          "location": "Delhi NCR",
          "validFrom": "2026-08-01T00:00:00.000Z"
        }
      ]
    }
  }
  ```
* **Error Responses**:
  * `404 Not Found`: Material ID does not exist.

---

### C. Prices

#### 1. Get Material Price History
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/prices/:materialId`
* **Authentication**: None (Public)
* **Path Parameters**: `materialId` *(Material UUID string)*
* **Example Successful Response (200 OK)**:
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
* **Error Responses**:
  * `404 Not Found`: Material ID does not exist.

---

### D. Recyclers

#### 1. List Recyclers
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/recyclers`
* **Authentication**: None (Public)
* **Query Parameters**:
  * `authorized`: `true` / `false`
  * `pickupAvailable`: `true` / `false`
  * `materialId`: Filter by accepted material UUID
  * `search`: Keyword for name or address
* **Example Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "rec-profile-01",
        "name": "EcoGreen E-Waste Recyclers Pvt Ltd",
        "address": "Plot 42, Mayapuri Industrial Area Phase 1, New Delhi",
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

#### 2. Get Recycler Details
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/recyclers/:id`
* **Authentication**: None (Public)
* **Path Parameters**: `id` *(Recycler UUID string)*
* **Example Successful Response (200 OK)**: Returns complete profile, CPCB status, coordinates, and supported materials.

---

#### 3. Get Recycler Accepted Materials
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/recyclers/:id/materials`
* **Authentication**: None (Public)
* **Path Parameters**: `id` *(Recycler UUID string)*
* **Example Successful Response (200 OK)**: Returns list of materials accepted by this recycler with active benchmark rates.

---

#### 4. Get Recommended Recyclers for Lot
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/recyclers/recommended?lotId=<LOT_ID>`
* **Authentication**: Public (works with or without Bearer token)
* **Query Parameters**:
  * `lotId` *(Required)*: UUID of the e-waste lot
* **Scoring Formula (0–100 Scale)**:
  * Price Score (30%)
  * Distance Score (25%) via Haversine geodesic formula
  * Material Compatibility (20%)
  * CPCB Authorization (15%)
  * Doorstep Pickup Availability (10%)
* **Example Successful Response (200 OK)**:
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
          "recyclerId": "rec-profile-01",
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
* **Error Responses**:
  * `400 Bad Request`: Missing `lotId` query parameter.
  * `404 Not Found`: Lot not found.

---

### E. E-Waste Lots

#### 1. Create E-Waste Lot
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/lots`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: `COLLECTOR`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "materialId": "mat-001",
    "weight": 20.0,
    "collectorLocation": "Mayapuri Depot Gate 2, Delhi",
    "latitude": 28.6340,
    "longitude": 77.1260,
    "imageUrl": "https://example.com/pcb.jpg"
  }
  ```
  *(Note: The backend retrieves the current benchmark price and calculates `estimatedPrice = weight * pricePerKg`. The frontend does NOT calculate this value).*
* **Example Successful Response (201 Created)**:
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
* **Error Responses**:
  * `400 Bad Request`: Non-positive weight (`weight <= 0`) or missing fields.
  * `403 Forbidden`: User role is not `COLLECTOR`.
  * `404 Not Found`: Material ID does not exist.

---

#### 2. Get My Lots
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/lots/my-lots`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: `COLLECTOR`
* **Example Successful Response (200 OK)**: Returns an array of lots owned by the authenticated collector.

---

#### 3. Get Lot by ID
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/lots/:id`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: Lot owner, Recyclers, or Admin
* **Path Parameters**: `id` *(Lot UUID)*

---

#### 4. Update Lot Status
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/api/lots/:id/status`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: Lot owner or Admin
* **Request Body**:
  ```json
  {
    "status": "CANCELLED"
  }
  ```
* **Valid Lot Statuses**: `AVAILABLE`, `ASSIGNED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`.
* **Error Responses**:
  * `400 Bad Request`: Illegal status transition (e.g. attempting to cancel an already completed lot).

---

### F. Transactions

#### 1. Create Transaction
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/transactions`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: `COLLECTOR`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "lotId": "lot-001",
    "recyclerId": "rec-profile-01",
    "offeredPrice": 520.00
  }
  ```
  *(Note: The backend calculates `totalAmount = weight * agreedPrice`. Client values for total amount are discarded).*
* **Example Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Transaction initiated successfully",
    "data": {
      "id": "tx-001",
      "lotId": "lot-001",
      "collectorId": "col-001",
      "recyclerId": "rec-profile-01",
      "offeredPrice": 520.00,
      "totalAmount": 10400.00,
      "transactionStatus": "PENDING",
      "paymentStatus": "PENDING"
    }
  }
  ```
* **Error Responses**:
  * `400 Bad Request`: Recycler does not accept the lot's material, or lot is not in `AVAILABLE` state.
  * `403 Forbidden`: Authenticated user does not own this lot.

---

#### 2. Get My Transactions
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/transactions/my-transactions`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: Collector or Recycler
* **Query Parameters**:
  * `status` *(optional string)*: Filter by status (`PENDING`, `ACCEPTED`, `COMPLETED`, etc.)
* **Example Successful Response (200 OK)**: Returns array of user's transactions with related lot and recycler details.

---

#### 3. Get Transaction by ID
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/transactions/:id`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: Transaction participant (Collector or Recycler) or Admin
* **Path Parameters**: `id` *(Transaction UUID)*

---

#### 4. Update Transaction Status
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/api/transactions/:id/status`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: Transaction participant or Admin
* **Request Body**:
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
* **Valid Statuses**: `PENDING`, `ACCEPTED`, `PICKUP_SCHEDULED`, `HANDED_OVER`, `COMPLETED`, `CANCELLED`, `REJECTED`.
* **State Machine & Lot Synchronization**:
  * Setting `ACCEPTED` automatically synchronizes lot to `ASSIGNED`.
  * Setting `PICKUP_SCHEDULED` automatically synchronizes lot to `IN_TRANSIT`.
  * Setting `COMPLETED` sets payment to `PAID` and lot to `COMPLETED`.
  * Setting `CANCELLED` or `REJECTED` releases the lot back to `AVAILABLE`.

---

### G. QR-Based Handover

#### 1. Create Handover (Generate QR Code)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/handover/create`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: `COLLECTOR` (or `ADMIN`)
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "transactionId": "tx-001",
    "location": "Mayapuri Depot Gate 2, Delhi"
  }
  ```
* **Example Successful Response (201 Created)**:
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
* **Error Responses**:
  * `400 Bad Request`: Transaction is still `PENDING` (must be accepted first), or already `COMPLETED`.
  * `403 Forbidden`: Authenticated user is not the owner of this transaction.

---

#### 2. Verify Handover (Recycler Scans QR Code)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/handover/verify`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: `RECYCLER` (or `ADMIN`)
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "qrCode": "QR-KC-2026-F9A83B1C",
    "verifiedWeight": 19.8,
    "notes": "Verified PCB Grade A, digital scale reading 19.8 kg"
  }
  ```
  *(Note: Accepts `qrCode`, `qrIdentifier`, or `handoverCode`. If `verifiedWeight` is omitted, defaults to lot weight).*
* **Example Successful Response (200 OK)**:
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
* **Error Responses**:
  * `400 Bad Request`: Duplicate scan prevention (`"Handover has already been verified and processed. Repeated scans are prevented."`).
  * `403 Forbidden`: Recycler mismatch (`"You are not the designated recycler for this handover"`).
  * `404 Not Found`: Invalid or unrecognized QR code.

---

#### 3. Get Handover by ID or QR Identifier
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/handover/:id`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Path Parameters**: `id` *(Accepts internal handover UUID or QR code string like `QR-KC-2026-F9A83B1C`)*
* **Example Successful Response (200 OK)**: Returns complete audit trail and status.

---

### H. Collector Earnings

#### 1. Get Collector Earnings Dashboard
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/earnings/me`
* **Authentication**: Required (`Authorization: Bearer <token>`)
* **Required Role**: `COLLECTOR`
* **Request Body**: None
* **Calculation Details**: Dynamically computed from `COMPLETED` transactions only. Verified scale weights from physical handovers take priority over initial lot estimates.
* **Example Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Collector earnings calculated successfully",
    "data": {
      "collector": {
        "id": "col-001",
        "name": "Ramesh Kumar",
        "email": "ramesh.collector@kconnect.demo"
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
* **Error Responses**:
  * `403 Forbidden`: Authenticated user is not a `COLLECTOR` (e.g. Recycler attempting access).

---

## 6. Demo Test Accounts (Local Demo Only)

> 🔒 **LOCAL DEVELOPMENT ONLY**:  
> The following demo credentials are generated automatically by `npm run seed` for local offline testing. Never use these credentials in production environments.

### Standard Test Password
All seeded demo users share the standard test password:  
**`Password@123`**

### 1. Collector Accounts
| Name | Email | Role | Notes |
| :--- | :--- | :---: | :--- |
| Ramesh Kumar | `ramesh.collector@kconnect.demo` | `COLLECTOR` | Primary demo collector (active lots, transactions & earnings) |
| Suresh Verma | `suresh.collector@kconnect.demo` | `COLLECTOR` | Demo collector |
| Anita Devi | `anita.collector@kconnect.demo` | `COLLECTOR` | Demo collector |
| Mohammad Arif | `arif.collector@kconnect.demo` | `COLLECTOR` | Demo collector |
| Vikram Singh | `vikram.collector@kconnect.demo` | `COLLECTOR` | Demo collector |
| Pooja Sharma | `pooja.collector@kconnect.demo` | `COLLECTOR` | Zero/low earnings test collector |

### 2. Recycler Accounts
| Facility Name | Email | Role | Features |
| :--- | :--- | :---: | :--- |
| EcoGreen E-Waste Recyclers | `recycler1@kconnect.demo` | `RECYCLER` | CPCB Authorized, Pickup Available (Mayapuri, Delhi) |
| Bharat Metal Dismantlers | `recycler2@kconnect.demo` | `RECYCLER` | CPCB Authorized, Pickup Available (Mayapuri, Delhi) |
| Mayapuri Circular Solutions | `recycler3@kconnect.demo` | `RECYCLER` | Informal (Unauthorized, No Pickup) |
| GreenEarth Technologies | `recycler4@kconnect.demo` | `RECYCLER` | CPCB Authorized, Pickup Available (Okhla, Delhi) |
| *(Recyclers 5 through 25)* | `recycler5@kconnect.demo` ... | `RECYCLER` | Additional NCR recycling facilities |

### 3. Central Admin Account
| Name | Email | Role | Privileges |
| :--- | :--- | :---: | :--- |
| Central Admin | `admin@kabadiwala.demo` | `ADMIN` | Catalog management, benchmark pricing, all transactions |

---

## 7. Local Development & Setup for Person 1

### Prerequisites
1. **Node.js**: Version 18+ (tested on `v24.13.0`)
2. **PostgreSQL**: Running on port `5432`

### Setup Steps
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Configure .env file
cp .env.example .env
```

Ensure `.env` contains your local PostgreSQL credentials:
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kabadiwala_connect?schema=public"
JWT_SECRET=super_secret_local_dev_jwt_key_2026
JWT_EXPIRES_IN=7d
```

### Database Initialization & Seed
```bash
# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Seed 25 recyclers, 12 materials, 192 prices, lots & transactions
npm run seed
```

### Start Server
```bash
# Development mode with hot-reloading:
npm run dev

# Or standard production mode:
npm start
```

### Verify Running Instance
Open your browser or run:
```bash
curl http://localhost:5000/api/health
# Returns: {"success":true,"message":"Kabadiwala Connect API is running"}
```
Explore the interactive Swagger UI at:  
**`http://localhost:5000/api/docs`**

---

## 8. Troubleshooting & Common Errors

| Error Code & Message | Probable Cause | Solution for Person 1 |
| :--- | :--- | :--- |
| **`401 Unauthorized`** | Missing or expired `Authorization` header | Check that `Authorization: Bearer <token>` is sent. If expired, redirect user to `/login` to obtain a fresh token. |
| **`403 Forbidden`** | User role lacks permission | The user's role does not permit this action (e.g. Recycler attempting to call `POST /api/lots`, or Collector attempting `POST /api/handover/verify`). |
| **`404 Not Found`** | Invalid ID or URL | Check path parameter UUIDs and ensure base URL includes `/api`. |
| **`400 Bad Request`** | Validation failure or illegal state transition | Inspect `response.data.message` or `response.data.errors` for specific validation feedback. |
| **CORS Network Error** | Frontend origin blocked | Ensure backend is running and `cors()` is mounted. In dev mode, CORS allows `*`. |
| **"Cannot generate handover QR for PENDING transaction"** | Recycler has not accepted deal | Recycler must first accept the transaction (`PATCH /api/transactions/:id/status` with status `"ACCEPTED"`). |
| **"Handover has already been verified"** | Duplicate QR scan | The handover is already completed. The frontend should display a "Completed" badge and disable the scan button. |
| **"You are not the designated recycler for this handover"** | Wrong recycler scanning QR | Only the recycler facility assigned to the transaction can verify the QR code. Ensure the logged-in recycler matches the transaction's recycler. |
| **Database Connection Refused** | PostgreSQL is stopped | Verify PostgreSQL service is active on port `5432` with credentials matching `.env`. |
