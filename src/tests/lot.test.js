const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const app = require('../app');

// In-memory mock database for Lot management testing
const mockDB = {
  users: [
    {
      id: 'col-001',
      name: 'Ramesh Collector',
      email: 'ramesh@kconnect.demo',
      phone: '+919811001001',
      role: 'COLLECTOR'
    },
    {
      id: 'col-002',
      name: 'Suresh Collector',
      email: 'suresh@kconnect.demo',
      phone: '+919811001002',
      role: 'COLLECTOR'
    },
    {
      id: 'rec-user-01',
      name: 'EcoGreen Recycler',
      email: 'ecogreen@kconnect.demo',
      role: 'RECYCLER'
    },
    {
      id: 'admin-user-01',
      name: 'System Admin',
      email: 'admin@kabadiwala.demo',
      role: 'ADMIN'
    }
  ],
  materials: [
    {
      id: 'mat-pcb-motherboard',
      name: 'PCB Grade A (Motherboards & Servers)',
      code: 'MAT-PCB-A',
      unit: 'kg',
      description: 'High-grade circuit boards',
      prices: [
        {
          id: 'prc-pcb-spot',
          materialId: 'mat-pcb-motherboard',
          pricePerKg: 520.0,
          location: 'Delhi NCR - Mayapuri Hub',
          source: 'CPCB Official Benchmark',
          validFrom: new Date('2025-01-01'),
          validTo: null
        }
      ]
    }
  ],
  lots: []
};

// Mock prisma methods for Lot tests
prisma.user = {
  findUnique: async ({ where }) => {
    return mockDB.users.find(u => u.id === where.id) || null;
  }
};

prisma.material = {
  findUnique: async ({ where }) => {
    return mockDB.materials.find(m => m.id === where.id) || null;
  }
};

prisma.lot = {
  findUnique: async ({ where }) => {
    let lot = null;
    if (where.id) lot = mockDB.lots.find(l => l.id === where.id);
    if (where.lotNumber) lot = mockDB.lots.find(l => l.lotNumber === where.lotNumber);
    if (!lot) return null;

    const material = mockDB.materials.find(m => m.id === lot.materialId);
    const collector = mockDB.users.find(u => u.id === lot.collectorId);
    return {
      ...lot,
      material,
      collector,
      transactions: []
    };
  },

  findMany: async ({ where = {}, orderBy }) => {
    let result = [...mockDB.lots];
    if (where.collectorId) {
      result = result.filter(l => l.collectorId === where.collectorId);
    }
    if (where.status) {
      result = result.filter(l => l.status === where.status);
    }
    return result.map(l => {
      const material = mockDB.materials.find(m => m.id === l.materialId);
      return {
        ...l,
        material,
        transactions: []
      };
    });
  },

  create: async ({ data }) => {
    const newLot = {
      id: `lot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lotNumber: data.lotNumber,
      collectorId: data.collectorId,
      materialId: data.materialId,
      weight: data.weight,
      estimatedPrice: data.estimatedPrice,
      status: data.status || 'AVAILABLE',
      imageUrl: data.imageUrl || null,
      collectorLocation: data.collectorLocation,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.lots.push(newLot);

    const material = mockDB.materials.find(m => m.id === data.materialId);
    const collector = mockDB.users.find(u => u.id === data.collectorId);

    return {
      ...newLot,
      material,
      collector
    };
  },

  update: async ({ where, data }) => {
    const idx = mockDB.lots.findIndex(l => l.id === where.id);
    if (idx === -1) return null;
    mockDB.lots[idx] = { ...mockDB.lots[idx], ...data, updatedAt: new Date() };

    const material = mockDB.materials.find(m => m.id === mockDB.lots[idx].materialId);
    return {
      ...mockDB.lots[idx],
      material
    };
  }
};

// Generate tokens
const collectorToken = jwt.sign(
  { id: 'col-001', email: 'ramesh@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const otherCollectorToken = jwt.sign(
  { id: 'col-002', email: 'suresh@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const recyclerToken = jwt.sign(
  { id: 'rec-user-01', email: 'ecogreen@kconnect.demo', role: 'RECYCLER' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

async function runLotTests() {
  console.log('🧪 Starting E-Waste Lot Management API Integration Tests...\n');

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

    let createdLotId;

    // -------------------------------------------------------------------------
    // 1. Create Valid Lot (15 kg PCB @ 520/kg = 7800 estimated)
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Create Valid Lot ---');
    const resCreate = await fetch(`${baseUrl}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        material_id: 'mat-pcb-motherboard',
        weight: 15.0,
        latitude: 28.6650,
        longitude: 77.1650,
        collectorLocation: 'Seelampur E-Waste Depot, Delhi',
        image_url: 'https://storage.kconnect.demo/lots/pcb-15kg.jpg'
      })
    });
    const dataCreate = await resCreate.json();

    assert(resCreate.status === 201, 'POST /lots returns 201 Created');
    assert(dataCreate.success === true, 'Response status is success');
    assert(dataCreate.data.lotNumber.startsWith('LOT-2026-'), 'Generates unique lot identifier (LOT-2026-XXXXX)');
    assert(dataCreate.data.weight === 15.0, 'Stores verified weight (15 kg)');
    assert(dataCreate.data.referencePricePerKg === 520.0, 'Backend fetches spot rate (520/kg)');
    assert(dataCreate.data.estimatedPrice === 7800.0, 'Backend correctly calculates estimated value (15 * 520 = 7800)');
    assert(dataCreate.data.status === 'AVAILABLE', 'Initial lot status is AVAILABLE');
    createdLotId = dataCreate.data.id;

    // -------------------------------------------------------------------------
    // 2. Invalid Material
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Invalid Material ---');
    const resBadMat = await fetch(`${baseUrl}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        material_id: 'non-existent-material-id',
        weight: 20.0,
        latitude: 28.6650,
        longitude: 77.1650
      })
    });
    const dataBadMat = await resBadMat.json();
    assert(resBadMat.status === 404, 'Rejects non-existent material with 404 Not Found');
    assert(dataBadMat.success === false, 'Error response indicates failure');

    // -------------------------------------------------------------------------
    // 3. Negative / Zero Weight Rejection
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Negative and Zero Weight Rejection ---');
    // Zero weight
    const resZeroWeight = await fetch(`${baseUrl}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        material_id: 'mat-pcb-motherboard',
        weight: 0,
        latitude: 28.6650,
        longitude: 77.1650
      })
    });
    assert(resZeroWeight.status === 400, 'Rejects zero weight with 400 Bad Request');

    // Negative weight
    const resNegWeight = await fetch(`${baseUrl}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        material_id: 'mat-pcb-motherboard',
        weight: -15.5,
        latitude: 28.6650,
        longitude: 77.1650
      })
    });
    assert(resNegWeight.status === 400, 'Rejects negative weight with 400 Bad Request');

    // -------------------------------------------------------------------------
    // 4. Unauthorized Access
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Unauthorized Access ---');
    // Without token
    const resNoToken = await fetch(`${baseUrl}/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        material_id: 'mat-pcb-motherboard',
        weight: 10,
        latitude: 28.6,
        longitude: 77.1
      })
    });
    assert(resNoToken.status === 401, 'POST /lots without token returns 401 Unauthorized');

    // Recycler attempting to create lot (role restriction)
    const resRecyclerToken = await fetch(`${baseUrl}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recyclerToken}`
      },
      body: JSON.stringify({
        material_id: 'mat-pcb-motherboard',
        weight: 10,
        latitude: 28.6,
        longitude: 77.1
      })
    });
    assert(resRecyclerToken.status === 403, 'POST /lots with RECYCLER role returns 403 Forbidden');

    // -------------------------------------------------------------------------
    // 5. Collector Viewing Their Own Lots
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Collector Viewing Their Own Lots ---');
    // GET /api/lots/my-lots
    const resMyLots = await fetch(`${baseUrl}/lots/my-lots`, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    const dataMyLots = await resMyLots.json();
    assert(resMyLots.status === 200, 'GET /lots/my-lots returns 200 OK');
    assert(Array.isArray(dataMyLots.data) && dataMyLots.data.length >= 1, 'Returns array of collector lots');
    assert(dataMyLots.data[0].id === createdLotId, 'Contains the newly created lot');

    // GET /api/lots/:id (by owner collector)
    const resGetOwner = await fetch(`${baseUrl}/lots/${createdLotId}`, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    const dataGetOwner = await resGetOwner.json();
    assert(resGetOwner.status === 200, 'GET /lots/:id by owner returns 200 OK');
    assert(dataGetOwner.data.id === createdLotId, 'Returns full lot details');

    // GET /api/lots/:id (by other collector: private access control)
    const resGetOther = await fetch(`${baseUrl}/lots/${createdLotId}`, {
      headers: { 'Authorization': `Bearer ${otherCollectorToken}` }
    });
    assert(resGetOther.status === 403, 'GET /lots/:id by other collector returns 403 Forbidden');

    // -------------------------------------------------------------------------
    // 6. Status Transitions
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Lot Status Transitions ---');
    // Collector cancels available lot
    const resCancel = await fetch(`${baseUrl}/lots/${createdLotId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({ status: 'CANCELLED' })
    });
    const dataCancel = await resCancel.json();
    assert(resCancel.status === 200, 'Collector successfully cancels AVAILABLE lot (200 OK)');
    assert(dataCancel.data.status === 'CANCELLED', 'Status transitioned to CANCELLED');

    // Invalid transition: Attempting to revive CANCELLED lot to AVAILABLE
    const resInvalidTransition = await fetch(`${baseUrl}/lots/${createdLotId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({ status: 'AVAILABLE' })
    });
    assert(resInvalidTransition.status === 400, 'Rejects invalid transition from terminal state (400 Bad Request)');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================');
  console.log(`E-WASTE LOT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLotTests();
