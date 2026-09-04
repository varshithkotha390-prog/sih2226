const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const app = require('../app');

// In-memory mock database for Transaction tests
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
      name: 'Other Collector',
      email: 'other@kconnect.demo',
      phone: '+919811001002',
      role: 'COLLECTOR'
    },
    {
      id: 'rec-user-01',
      name: 'EcoGreen Recycler Rep',
      email: 'ecogreen@kconnect.demo',
      role: 'RECYCLER'
    },
    {
      id: 'rec-user-02',
      name: 'Battery Only Recycler Rep',
      email: 'battery@kconnect.demo',
      role: 'RECYCLER'
    }
  ],

  materials: [
    {
      id: 'mat-pcb-01',
      name: 'PCB Grade A Motherboards',
      code: 'MAT-PCB-A',
      unit: 'kg',
      prices: [{ pricePerKg: 500.0, validFrom: new Date(), validTo: null }]
    },
    {
      id: 'mat-battery-01',
      name: 'Lithium-Ion Battery Packs',
      code: 'MAT-LIO-B',
      unit: 'kg',
      prices: [{ pricePerKg: 300.0, validFrom: new Date(), validTo: null }]
    }
  ],

  recyclers: [
    {
      id: 'rec-profile-01',
      userId: 'rec-user-01',
      name: 'EcoGreen E-Waste Recyclers Pvt Ltd',
      address: 'Plot 42, Mayapuri Phase 1, New Delhi',
      latitude: 28.6342,
      longitude: 77.1265,
      authorizedStatus: true,
      pickupAvailable: true,
      contactInfo: '+91-11-25910001',
      supportedMaterialIds: ['mat-pcb-01'] // Accepts PCB
    },
    {
      id: 'rec-profile-02',
      userId: 'rec-user-02',
      name: 'Lithium Safe Recyclers',
      address: 'B-12, Okhla Phase 2, New Delhi',
      latitude: 28.5280,
      longitude: 77.2790,
      authorizedStatus: true,
      pickupAvailable: false,
      contactInfo: '+91-11-26810002',
      supportedMaterialIds: ['mat-battery-01'] // ONLY accepts battery
    }
  ],

  lots: [
    {
      id: 'lot-available-01',
      lotNumber: 'LOT-2026-12345',
      collectorId: 'col-001',
      materialId: 'mat-pcb-01',
      weight: 20.0,
      estimatedPrice: 10000.0,
      status: 'AVAILABLE',
      collectorLocation: 'Seelampur Depot, Delhi'
    },
    {
      id: 'lot-already-assigned-02',
      lotNumber: 'LOT-2026-99999',
      collectorId: 'col-001',
      materialId: 'mat-pcb-01',
      weight: 30.0,
      estimatedPrice: 15000.0,
      status: 'ASSIGNED',
      collectorLocation: 'Mayapuri Depot, Delhi'
    }
  ],

  transactions: []
};

// Mock prisma queries for Transaction testing
prisma.user = {
  findUnique: async ({ where }) => mockDB.users.find(u => u.id === where.id) || null
};

prisma.material = {
  findUnique: async ({ where }) => mockDB.materials.find(m => m.id === where.id) || null
};

prisma.recycler = {
  findUnique: async ({ where }) => {
    let r = null;
    if (where.id) r = mockDB.recyclers.find(item => item.id === where.id);
    if (where.userId) r = mockDB.recyclers.find(item => item.userId === where.userId);
    if (!r) return null;

    const supportedMaterials = mockDB.materials.filter(m => r.supportedMaterialIds.includes(m.id));
    return {
      ...r,
      supportedMaterials
    };
  }
};

prisma.lot = {
  findUnique: async ({ where }) => {
    const lot = mockDB.lots.find(l => l.id === where.id);
    if (!lot) return null;
    const material = mockDB.materials.find(m => m.id === lot.materialId);
    return { ...lot, material };
  },
  update: async ({ where, data }) => {
    const idx = mockDB.lots.findIndex(l => l.id === where.id);
    if (idx === -1) return null;
    mockDB.lots[idx] = { ...mockDB.lots[idx], ...data };
    return mockDB.lots[idx];
  }
};

prisma.transaction = {
  findUnique: async ({ where }) => {
    const tx = mockDB.transactions.find(t => t.id === where.id);
    if (!tx) return null;
    const lot = mockDB.lots.find(l => l.id === tx.lotId);
    const material = mockDB.materials.find(m => m.id === lot.materialId);
    const collector = mockDB.users.find(u => u.id === tx.collectorId);
    const recycler = mockDB.recyclers.find(r => r.id === tx.recyclerId);

    return {
      ...tx,
      lot: { ...lot, material },
      collector,
      recycler
    };
  },

  findMany: async ({ where = {} }) => {
    let result = [...mockDB.transactions];
    if (where.collectorId) result = result.filter(t => t.collectorId === where.collectorId);
    if (where.recyclerId) result = result.filter(t => t.recyclerId === where.recyclerId);
    if (where.transactionStatus) result = result.filter(t => t.transactionStatus === where.transactionStatus);

    return result.map(t => {
      const lot = mockDB.lots.find(l => l.id === t.lotId);
      const material = mockDB.materials.find(m => m.id === lot.materialId);
      const collector = mockDB.users.find(u => u.id === t.collectorId);
      const recycler = mockDB.recyclers.find(r => r.id === t.recyclerId);
      return {
        ...t,
        lot: { ...lot, material },
        collector,
        recycler
      };
    });
  },

  create: async ({ data }) => {
    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lotId: data.lotId,
      collectorId: data.collectorId,
      recyclerId: data.recyclerId,
      offeredPrice: data.offeredPrice,
      finalPrice: data.finalPrice || data.offeredPrice,
      totalAmount: data.totalAmount,
      transactionStatus: data.transactionStatus || 'PENDING',
      paymentStatus: data.paymentStatus || 'PENDING',
      createdAt: new Date(),
      completedAt: null
    };
    mockDB.transactions.push(newTx);

    const lot = mockDB.lots.find(l => l.id === data.lotId);
    const collector = mockDB.users.find(u => u.id === data.collectorId);
    const recycler = mockDB.recyclers.find(r => r.id === data.recyclerId);

    return {
      ...newTx,
      lot,
      collector,
      recycler
    };
  },

  update: async ({ where, data }) => {
    const idx = mockDB.transactions.findIndex(t => t.id === where.id);
    if (idx === -1) return null;
    mockDB.transactions[idx] = { ...mockDB.transactions[idx], ...data, updatedAt: new Date() };
    return mockDB.transactions[idx];
  }
};

// Tokens
const collectorToken = jwt.sign(
  { id: 'col-001', email: 'ramesh@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const otherCollectorToken = jwt.sign(
  { id: 'col-002', email: 'other@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const recyclerToken = jwt.sign(
  { id: 'rec-user-01', email: 'ecogreen@kconnect.demo', role: 'RECYCLER' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

async function runTransactionTests() {
  console.log('🧪 Starting Transaction Management API Integration Tests...\n');

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

    let createdTxId;

    // -------------------------------------------------------------------------
    // 1. Create Valid Transaction
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Create Valid Transaction ---');
    // Collector initiates trade on 20 kg PCB @ 550/kg
    // Frontend sends spoofed total_amount: 1.0 (must be ignored!)
    const resCreate = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        lotId: 'lot-available-01',
        recyclerId: 'rec-profile-01',
        offeredPrice: 550.0,
        total_amount: 1.0 // Spoofed amount!
      })
    });
    const dataCreate = await resCreate.json();

    assert(resCreate.status === 201, 'POST /transactions returns 201 Created');
    assert(dataCreate.success === true, 'Response indicates success');
    assert(dataCreate.data.transactionStatus === 'PENDING', 'Initial transactionStatus is PENDING');
    assert(dataCreate.data.paymentStatus === 'PENDING', 'Initial paymentStatus is PENDING');
    assert(dataCreate.data.ratePerKg === 550.0, 'Records agreed/offered rate per kg (550)');
    // Total amount MUST be 20 kg * 550 = 11000, NOT 1.0
    assert(dataCreate.data.totalAmount === 11000.0, 'Backend calculates total amount (20 * 550 = 11000), ignoring frontend input');
    createdTxId = dataCreate.data.id;

    // -------------------------------------------------------------------------
    // 2. Reject Incompatible Material
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Incompatible Material Rejection ---');
    // rec-profile-02 only accepts batteries, but lot is PCB
    const resIncompatible = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        lotId: 'lot-available-01',
        recyclerId: 'rec-profile-02',
        offeredPrice: 500.0
      })
    });
    const dataIncompatible = await resIncompatible.json();
    assert(resIncompatible.status === 400, 'Rejects incompatible recycler with 400 Bad Request');
    assert(dataIncompatible.message.includes('Material Incompatible'), 'Reports material incompatibility message');

    // -------------------------------------------------------------------------
    // 3. Reject Unavailable Lot Status
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Unavailable Lot Status Rejection ---');
    // lot-already-assigned-02 is in ASSIGNED state
    const resAssignedLot = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({
        lotId: 'lot-already-assigned-02',
        recyclerId: 'rec-profile-01',
        offeredPrice: 500.0
      })
    });
    assert(resAssignedLot.status === 400, 'Rejects lot in non-AVAILABLE state with 400 Bad Request');

    // -------------------------------------------------------------------------
    // 4. Reject Unauthorized Lot Trading
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Lot Ownership Authorization ---');
    // Other collector attempts to trade lot owned by col-001
    const resUnowned = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${otherCollectorToken}`
      },
      body: JSON.stringify({
        lotId: 'lot-available-01',
        recyclerId: 'rec-profile-01'
      })
    });
    assert(resUnowned.status === 403, 'Rejects transaction creation on unowned lot with 403 Forbidden');

    // -------------------------------------------------------------------------
    // 5. Complete Transaction Lifecycle & Status Transitions
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Transaction Lifecycle Flow & Lot Synchronization ---');

    // Transition 1: PENDING -> ACCEPTED (by Recycler)
    const resAccept = await fetch(`${baseUrl}/transactions/${createdTxId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recyclerToken}`
      },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });
    const dataAccept = await resAccept.json();
    assert(resAccept.status === 200, 'Recycler accepts transaction (200 OK)');
    assert(dataAccept.data.transactionStatus === 'ACCEPTED', 'Transaction status is now ACCEPTED');
    assert(mockDB.lots.find(l => l.id === 'lot-available-01').status === 'ASSIGNED', 'Lot synchronized to ASSIGNED status');

    // Transition 2: ACCEPTED -> PICKUP_SCHEDULED (by Recycler)
    const resSchedule = await fetch(`${baseUrl}/transactions/${createdTxId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recyclerToken}`
      },
      body: JSON.stringify({ status: 'PICKUP_SCHEDULED' })
    });
    const dataSchedule = await resSchedule.json();
    assert(resSchedule.status === 200, 'Schedules pickup (200 OK)');
    assert(dataSchedule.data.transactionStatus === 'PICKUP_SCHEDULED', 'Transaction status is PICKUP_SCHEDULED');
    assert(mockDB.lots.find(l => l.id === 'lot-available-01').status === 'IN_TRANSIT', 'Lot synchronized to IN_TRANSIT');

    // Transition 3: PICKUP_SCHEDULED -> HANDED_OVER
    const resHandover = await fetch(`${baseUrl}/transactions/${createdTxId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recyclerToken}`
      },
      body: JSON.stringify({ status: 'HANDED_OVER' })
    });
    const dataHandover = await resHandover.json();
    assert(resHandover.status === 200, 'Updates status to HANDED_OVER (200 OK)');
    assert(dataHandover.data.transactionStatus === 'HANDED_OVER', 'Transaction status is HANDED_OVER');

    // Transition 4: HANDED_OVER -> COMPLETED (Simulates Payment = PAID)
    const resComplete = await fetch(`${baseUrl}/transactions/${createdTxId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recyclerToken}`
      },
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    const dataComplete = await resComplete.json();
    assert(resComplete.status === 200, 'Completes transaction (200 OK)');
    assert(dataComplete.data.transactionStatus === 'COMPLETED', 'Transaction status is COMPLETED');
    assert(dataComplete.data.paymentStatus === 'PAID', 'Payment status simulated to PAID upon completion');
    assert(dataComplete.data.completedAt !== null, 'completedAt timestamp is recorded');
    assert(mockDB.lots.find(l => l.id === 'lot-available-01').status === 'COMPLETED', 'Lot synchronized to COMPLETED');

    // -------------------------------------------------------------------------
    // 6. Invalid Status Transition Rejection
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Invalid Transition from Terminal State ---');
    // Attempting to move from terminal COMPLETED to CANCELLED
    const resInvalidTx = await fetch(`${baseUrl}/transactions/${createdTxId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recyclerToken}`
      },
      body: JSON.stringify({ status: 'CANCELLED' })
    });
    assert(resInvalidTx.status === 400, 'Rejects transition from terminal state with 400 Bad Request');

    // -------------------------------------------------------------------------
    // 7. GET /api/transactions/my-transactions
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing GET /api/transactions/my-transactions ---');
    const resMyTx = await fetch(`${baseUrl}/transactions/my-transactions`, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    const dataMyTx = await resMyTx.json();
    assert(resMyTx.status === 200, 'GET /transactions/my-transactions returns 200 OK');
    assert(Array.isArray(dataMyTx.data) && dataMyTx.data.length >= 1, 'Returns array of user transactions');
    assert(dataMyTx.data[0].id === createdTxId, 'Includes created transaction in collector history');

    // -------------------------------------------------------------------------
    // 8. GET /api/transactions/:id
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing GET /api/transactions/:id ---');
    const resGetSingle = await fetch(`${baseUrl}/transactions/${createdTxId}`, {
      headers: { 'Authorization': `Bearer ${collectorToken}` }
    });
    const dataGetSingle = await resGetSingle.json();
    assert(resGetSingle.status === 200, 'GET /transactions/:id by participant returns 200 OK');
    assert(dataGetSingle.data.id === createdTxId, 'Returns complete transaction details');

    // Third-party collector accessing transaction
    const resGetForbidden = await fetch(`${baseUrl}/transactions/${createdTxId}`, {
      headers: { 'Authorization': `Bearer ${otherCollectorToken}` }
    });
    assert(resGetForbidden.status === 403, 'GET /transactions/:id by unauthorized third party returns 403 Forbidden');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================');
  console.log(`TRANSACTION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTransactionTests();
