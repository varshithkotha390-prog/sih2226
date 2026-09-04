const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const app = require('../app');

// In-memory mock database for recycler tests
const mockDB = {
  users: [
    {
      id: 'usr-admin-01',
      name: 'System Admin',
      email: 'admin@kabadiwala.demo',
      role: 'ADMIN',
      passwordHash: '$2b$10$hash...'
    },
    {
      id: 'usr-collector-01',
      name: 'Ramesh Collector',
      email: 'ramesh@kconnect.demo',
      role: 'COLLECTOR',
      passwordHash: '$2b$10$hash...'
    },
    {
      id: 'usr-recycler-01',
      name: 'EcoGreen Recyclers',
      email: 'ecogreen@kconnect.demo',
      role: 'RECYCLER',
      passwordHash: '$2b$10$hash...'
    },
    {
      id: 'usr-recycler-02',
      name: 'Capital Scrap Yard',
      email: 'capital@kconnect.demo',
      role: 'RECYCLER',
      passwordHash: '$2b$10$hash...'
    }
  ],
  materials: [
    {
      id: 'mat-copper-01',
      name: 'Copper Wiring & Heavy Cables',
      code: 'MAT-COP-W',
      unit: 'kg',
      description: 'High-purity copper wiring',
      prices: [{ pricePerKg: 750, validFrom: new Date(), validTo: null }]
    },
    {
      id: 'mat-pcb-01',
      name: 'PCB Grade A Motherboards',
      code: 'MAT-PCB-A',
      unit: 'kg',
      description: 'High yield motherboards',
      prices: [{ pricePerKg: 520, validFrom: new Date(), validTo: null }]
    },
    {
      id: 'mat-battery-01',
      name: 'Lithium-Ion Battery Packs',
      code: 'MAT-LIO-B',
      unit: 'kg',
      description: 'Li-ion battery packs',
      prices: [{ pricePerKg: 320, validFrom: new Date(), validTo: null }]
    }
  ],
  recyclers: [
    {
      id: 'rec-001',
      userId: 'usr-recycler-01',
      name: 'EcoGreen E-Waste Recyclers Pvt Ltd',
      address: 'Plot 42, Mayapuri Phase 1, New Delhi',
      latitude: 28.6342,
      longitude: 77.1265,
      authorizedStatus: true,
      authorizationId: 'CPCB/EW-REG/DL/2024/001',
      pickupAvailable: true,
      contactInfo: '+91-11-25910001 | ecogreen@kconnect.demo',
      supportedMaterialIds: ['mat-copper-01', 'mat-pcb-01'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'rec-002',
      userId: 'usr-recycler-02',
      name: 'Capital Scrap Yard',
      address: 'A-23, Okhla Phase 3, New Delhi',
      latitude: 28.5410,
      longitude: 77.2680,
      authorizedStatus: false,
      authorizationId: null,
      pickupAvailable: false,
      contactInfo: '+91-11-26810006 | capital@kconnect.demo',
      supportedMaterialIds: ['mat-battery-01'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ]
};

// Mock Prisma client methods for Recycler tests
prisma.recycler = {
  findMany: async ({ where = {}, orderBy }) => {
    let result = [...mockDB.recyclers];

    if (where.authorizedStatus !== undefined) {
      result = result.filter(r => r.authorizedStatus === where.authorizedStatus);
    }

    if (where.pickupAvailable !== undefined) {
      result = result.filter(r => r.pickupAvailable === where.pickupAvailable);
    }

    if (where.supportedMaterials && where.supportedMaterials.some) {
      const targetMatId = where.supportedMaterials.some.id;
      result = result.filter(r => r.supportedMaterialIds.includes(targetMatId));
    }

    if (where.OR) {
      const query = where.OR[0].name.contains.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query)
      );
    }

    return result.map(r => {
      const user = mockDB.users.find(u => u.id === r.userId);
      const supportedMaterials = mockDB.materials.filter(m => r.supportedMaterialIds.includes(m.id));
      return {
        ...r,
        user,
        supportedMaterials
      };
    });
  },

  findUnique: async ({ where }) => {
    let r = null;
    if (where.id) r = mockDB.recyclers.find(item => item.id === where.id);
    if (where.authorizationId) r = mockDB.recyclers.find(item => item.authorizationId === where.authorizationId);
    if (!r) return null;

    const user = mockDB.users.find(u => u.id === r.userId);
    const supportedMaterials = mockDB.materials.filter(m => r.supportedMaterialIds.includes(m.id));

    return {
      ...r,
      user,
      supportedMaterials
    };
  },

  create: async ({ data, include }) => {
    const supportedIds = data.supportedMaterials && data.supportedMaterials.connect
      ? data.supportedMaterials.connect.map(c => c.id)
      : [];

    const newRecycler = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      authorizedStatus: data.authorizedStatus || false,
      authorizationId: data.authorizationId || null,
      pickupAvailable: data.pickupAvailable || false,
      contactInfo: data.contactInfo,
      supportedMaterialIds: supportedIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.recyclers.push(newRecycler);

    const user = mockDB.users.find(u => u.id === data.userId);
    const supportedMaterials = mockDB.materials.filter(m => supportedIds.includes(m.id));

    return {
      ...newRecycler,
      user,
      supportedMaterials
    };
  },

  update: async ({ where, data }) => {
    const idx = mockDB.recyclers.findIndex(r => r.id === where.id);
    if (idx === -1) return null;

    if (data.supportedMaterials && data.supportedMaterials.set) {
      mockDB.recyclers[idx].supportedMaterialIds = data.supportedMaterials.set.map(s => s.id);
      delete data.supportedMaterials;
    }

    mockDB.recyclers[idx] = {
      ...mockDB.recyclers[idx],
      ...data,
      updatedAt: new Date()
    };

    const r = mockDB.recyclers[idx];
    const user = mockDB.users.find(u => u.id === r.userId);
    const supportedMaterials = mockDB.materials.filter(m => r.supportedMaterialIds.includes(m.id));

    return {
      ...r,
      user,
      supportedMaterials
    };
  }
};

prisma.user = {
  findUnique: async ({ where }) => {
    if (where.id) return mockDB.users.find(u => u.id === where.id) || null;
    if (where.email) return mockDB.users.find(u => u.email.toLowerCase() === where.email.toLowerCase()) || null;
    return null;
  },
  create: async ({ data }) => {
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role || 'RECYCLER',
      passwordHash: data.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.users.push(newUser);
    return newUser;
  }
};

// Tokens
const adminToken = jwt.sign(
  { id: 'usr-admin-01', email: 'admin@kabadiwala.demo', role: 'ADMIN' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const collectorToken = jwt.sign(
  { id: 'usr-collector-01', email: 'ramesh@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

async function runRecyclerTests() {
  console.log('🧪 Starting Recycler Management API Integration Tests...\n');

  let server;
  let baseUrl;
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;

    // -------------------------------------------------------------------------
    // 1. GET /api/recyclers (Public)
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing GET /api/recyclers ---');
    const resList = await fetch(`${baseUrl}/recyclers`);
    const dataList = await resList.json();
    assert(resList.status === 200, 'GET /recyclers returns 200 OK');
    assert(dataList.success === true, 'Response status is true');
    assert(Array.isArray(dataList.data) && dataList.data.length === 2, 'Returns all recyclers');
    assert(dataList.data[0].latitude !== undefined && dataList.data[0].longitude !== undefined, 'Stores and exposes coordinates');
    assert(dataList.data[0].account && dataList.data[0].account.passwordHash === undefined, 'Does not expose sensitive password hashes');

    // -------------------------------------------------------------------------
    // 2. Filtering Support
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Filters (authorized, pickup, material compatibility) ---');
    // Filter by authorized
    const resAuth = await fetch(`${baseUrl}/recyclers?authorized=true`);
    const dataAuth = await resAuth.json();
    assert(dataAuth.data.length === 1 && dataAuth.data[0].authorizedStatus === true, 'Filters by authorized=true correctly');

    // Filter by pickup
    const resPickup = await fetch(`${baseUrl}/recyclers?pickupAvailable=true`);
    const dataPickup = await resPickup.json();
    assert(dataPickup.data.length === 1 && dataPickup.data[0].pickupAvailable === true, 'Filters by pickupAvailable=true correctly');

    // Filter by material compatibility
    const resMatFilter = await fetch(`${baseUrl}/recyclers?materialId=mat-copper-01`);
    const dataMatFilter = await resMatFilter.json();
    assert(dataMatFilter.data.length === 1 && dataMatFilter.data[0].id === 'rec-001', 'Filters by material compatibility correctly');

    // -------------------------------------------------------------------------
    // 3. GET /api/recyclers/:id (Public)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing GET /api/recyclers/:id ---');
    const resSingle = await fetch(`${baseUrl}/recyclers/rec-001`);
    const dataSingle = await resSingle.json();
    assert(resSingle.status === 200, 'GET /recyclers/:id returns 200 OK');
    assert(dataSingle.data.id === 'rec-001', 'Returns requested recycler');
    assert(dataSingle.data.authorizationId === 'CPCB/EW-REG/DL/2024/001', 'Returns authorization details');
    assert(Array.isArray(dataSingle.data.supportedMaterials), 'Includes supported materials list');

    // -------------------------------------------------------------------------
    // 4. GET /api/recyclers/:id/materials (Public)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing GET /api/recyclers/:id/materials ---');
    const resMaterials = await fetch(`${baseUrl}/recyclers/rec-001/materials`);
    const dataMaterials = await resMaterials.json();
    assert(resMaterials.status === 200, 'GET /recyclers/:id/materials returns 200 OK');
    assert(Array.isArray(dataMaterials.data) && dataMaterials.data.length === 2, 'Returns supported materials array');
    assert(dataMaterials.data[0].currentPricePerKg !== undefined, 'Enriches materials with spot prices');

    // -------------------------------------------------------------------------
    // 5. Invalid Recycler IDs
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Invalid Recycler IDs ---');
    const resInvalidId = await fetch(`${baseUrl}/recyclers/non-existent-rec-999`);
    const dataInvalidId = await resInvalidId.json();
    assert(resInvalidId.status === 404, 'GET /recyclers/invalid-id returns 404 Not Found');
    assert(dataInvalidId.success === false, 'Returns clean error response');

    const resInvalidMatId = await fetch(`${baseUrl}/recyclers/non-existent-rec-999/materials`);
    assert(resInvalidMatId.status === 404, 'GET /recyclers/invalid-id/materials returns 404 Not Found');

    // -------------------------------------------------------------------------
    // 6. Unauthorized & Forbidden Requests
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Unauthorized & Forbidden Access ---');
    const resNoToken = await fetch(`${baseUrl}/recyclers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Recycler' })
    });
    assert(resNoToken.status === 401, 'POST /recyclers without token returns 401 Unauthorized');

    const resCollectorToken = await fetch(`${baseUrl}/recyclers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({ name: 'New Recycler' })
    });
    assert(resCollectorToken.status === 403, 'POST /recyclers with COLLECTOR token returns 403 Forbidden');

    // -------------------------------------------------------------------------
    // 7. Coordinate Validation
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing Coordinate Validation ---');
    const resBadCoords = await fetch(`${baseUrl}/recyclers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Invalid Coords Recycler',
        address: 'Delhi',
        latitude: 195.5, // Invalid > 90
        longitude: 77.2,
        contactInfo: '+91-99999',
        email: 'newrec@test.demo',
        password: 'Password@123'
      })
    });
    assert(resBadCoords.status === 400, 'Rejects invalid latitude (> 90) with 400 Bad Request');

    // -------------------------------------------------------------------------
    // 8. Admin Operations: Create & Update Recycler
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing Admin Recycler Creation & Update ---');
    let createdRecyclerId;

    const resCreate = await fetch(`${baseUrl}/recyclers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Apex Precious Metals Dismantlers',
        address: 'D-89, Okhla Industrial Area Phase 2, New Delhi',
        latitude: 28.5280,
        longitude: 77.2790,
        authorizedStatus: true,
        authorizationId: 'CPCB/EW-REG/DL/2024/005',
        pickupAvailable: true,
        contactInfo: '+91-11-26810005 | contact@apexmetals.demo',
        supportedMaterialIds: ['mat-copper-01', 'mat-pcb-01', 'mat-battery-01'],
        email: 'apexmetals@kconnect.demo',
        password: 'Password@123'
      })
    });
    const dataCreate = await resCreate.json();
    assert(resCreate.status === 201, 'POST /recyclers with ADMIN token returns 201 Created');
    assert(dataCreate.data.name === 'Apex Precious Metals Dismantlers', 'Recycler name created accurately');
    assert(dataCreate.data.supportedMaterials.length === 3, 'Supported materials linked properly');
    createdRecyclerId = dataCreate.data.id;

    // Update Recycler
    const resUpdate = await fetch(`${baseUrl}/recyclers/${createdRecyclerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        pickupAvailable: false,
        address: 'Updated Address: D-89, Okhla Phase 2, Delhi'
      })
    });
    const dataUpdate = await resUpdate.json();
    assert(resUpdate.status === 200, 'PATCH /recyclers/:id returns 200 OK');
    assert(dataUpdate.data.pickupAvailable === false, 'pickupAvailable updated successfully');
    assert(dataUpdate.data.address.startsWith('Updated Address:'), 'Address updated successfully');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================');
  console.log(`RECYCLER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRecyclerTests();
