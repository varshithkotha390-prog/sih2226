const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const app = require('../app');

// In-memory mock database for Handover tests
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
      name: 'Suresh Other Collector',
      email: 'suresh@kconnect.demo',
      phone: '+919811001002',
      role: 'COLLECTOR'
    },
    {
      id: 'rec-user-01',
      name: 'EcoGreen Rep User',
      email: 'ecogreen@kconnect.demo',
      role: 'RECYCLER'
    },
    {
      id: 'rec-user-02',
      name: 'Wrong Recycler User',
      email: 'wrong@kconnect.demo',
      role: 'RECYCLER'
    },
    {
      id: 'admin-001',
      name: 'System Admin',
      email: 'admin@kconnect.demo',
      role: 'ADMIN'
    }
  ],

  materials: [
    {
      id: 'mat-pcb-01',
      name: 'PCB Grade A Motherboards',
      code: 'MAT-PCB-A',
      unit: 'kg'
    },
    {
      id: 'mat-copper-01',
      name: 'Stripped Copper Wire',
      code: 'MAT-CU-01',
      unit: 'kg'
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
      contactInfo: '+91-11-25910001'
    },
    {
      id: 'rec-profile-02',
      userId: 'rec-user-02',
      name: 'Wrong Recyclers Ltd',
      address: 'Plot 99, Okhla Phase 2, New Delhi',
      latitude: 28.5342,
      longitude: 77.2665,
      authorizedStatus: true,
      pickupAvailable: false,
      contactInfo: '+91-11-26810002'
    }
  ],

  lots: [
    {
      id: 'lot-accepted-01',
      lotNumber: 'LOT-2026-00001',
      collectorId: 'col-001',
      materialId: 'mat-pcb-01',
      weight: 25.0,
      estimatedPrice: 12500.0,
      status: 'ASSIGNED',
      collectorLocation: 'Mayapuri Depot, Delhi'
    },
    {
      id: 'lot-completed-02',
      lotNumber: 'LOT-2026-00002',
      collectorId: 'col-001',
      materialId: 'mat-pcb-01',
      weight: 15.0,
      estimatedPrice: 7500.0,
      status: 'COMPLETED',
      collectorLocation: 'Seelampur Depot, Delhi'
    },
    {
      id: 'lot-pending-03',
      lotNumber: 'LOT-2026-00003',
      collectorId: 'col-001',
      materialId: 'mat-pcb-01',
      weight: 10.0,
      estimatedPrice: 5000.0,
      status: 'AVAILABLE',
      collectorLocation: 'Okhla Depot, Delhi'
    }
  ],

  transactions: [
    {
      id: 'tx-accepted-01',
      lotId: 'lot-accepted-01',
      collectorId: 'col-001',
      recyclerId: 'rec-profile-01',
      offeredPrice: 500.0,
      finalPrice: 500.0,
      totalAmount: 12500.0,
      transactionStatus: 'ACCEPTED',
      paymentStatus: 'PENDING',
      createdAt: new Date(),
      completedAt: null
    },
    {
      id: 'tx-completed-02',
      lotId: 'lot-completed-02',
      collectorId: 'col-001',
      recyclerId: 'rec-profile-01',
      offeredPrice: 500.0,
      finalPrice: 500.0,
      totalAmount: 7500.0,
      transactionStatus: 'COMPLETED',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 3600000)
    },
    {
      id: 'tx-pending-03',
      lotId: 'lot-pending-03',
      collectorId: 'col-001',
      recyclerId: 'rec-profile-01',
      offeredPrice: 500.0,
      finalPrice: 500.0,
      totalAmount: 5000.0,
      transactionStatus: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date(),
      completedAt: null
    }
  ],

  handovers: []
};

// Mock Prisma
prisma.user = {
  findUnique: async ({ where }) => mockDB.users.find(u => u.id === where.id) || null
};

prisma.material = {
  findUnique: async ({ where }) => mockDB.materials.find(m => m.id === where.id) || null
};

prisma.recycler = {
  findUnique: async ({ where }) => {
    if (where.id) return mockDB.recyclers.find(r => r.id === where.id) || null;
    if (where.userId) return mockDB.recyclers.find(r => r.userId === where.userId) || null;
    return null;
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
    const handover = mockDB.handovers.find(h => h.transactionId === tx.id);

    return {
      ...tx,
      lot: { ...lot, material },
      collector,
      recycler,
      handover: handover || null
    };
  },
  update: async ({ where, data }) => {
    const idx = mockDB.transactions.findIndex(t => t.id === where.id);
    if (idx === -1) return null;
    mockDB.transactions[idx] = { ...mockDB.transactions[idx], ...data };
    return mockDB.transactions[idx];
  }
};

prisma.handover = {
  findUnique: async ({ where }) => {
    let h = null;
    if (where.id) h = mockDB.handovers.find(item => item.id === where.id);
    if (where.qrIdentifier) h = mockDB.handovers.find(item => item.qrIdentifier === where.qrIdentifier);
    if (where.transactionId) h = mockDB.handovers.find(item => item.transactionId === where.transactionId);
    if (!h) return null;

    const tx = mockDB.transactions.find(t => t.id === h.transactionId);
    const lot = mockDB.lots.find(l => l.id === h.lotId);
    const material = lot ? mockDB.materials.find(m => m.id === lot.materialId) : null;
    const collector = mockDB.users.find(u => u.id === h.collectorId);
    const recycler = mockDB.recyclers.find(r => r.id === h.recyclerId);
    const verifiedMaterial = h.verifiedMaterialId ? mockDB.materials.find(m => m.id === h.verifiedMaterialId) : null;

    return {
      ...h,
      transaction: tx,
      lot: { ...lot, material },
      collector,
      recycler,
      verifiedMaterial
    };
  },

  findFirst: async ({ where }) => {
    let h = null;
    if (where.OR) {
      for (const cond of where.OR) {
        if (cond.id) h = mockDB.handovers.find(item => item.id === cond.id);
        if (!h && cond.qrIdentifier) h = mockDB.handovers.find(item => item.qrIdentifier === cond.qrIdentifier);
        if (h) break;
      }
    }
    if (!h) return null;

    const tx = mockDB.transactions.find(t => t.id === h.transactionId);
    const lot = mockDB.lots.find(l => l.id === h.lotId);
    const material = lot ? mockDB.materials.find(m => m.id === lot.materialId) : null;
    const collector = mockDB.users.find(u => u.id === h.collectorId);
    const recycler = mockDB.recyclers.find(r => r.id === h.recyclerId);
    const verifiedMaterial = h.verifiedMaterialId ? mockDB.materials.find(m => m.id === h.verifiedMaterialId) : null;

    return {
      ...h,
      transaction: tx,
      lot: { ...lot, material },
      collector,
      recycler,
      verifiedMaterial
    };
  },

  create: async ({ data }) => {
    const newHandover = {
      id: `ho-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lotId: data.lotId,
      transactionId: data.transactionId,
      collectorId: data.collectorId,
      recyclerId: data.recyclerId,
      qrIdentifier: data.qrIdentifier,
      location: data.location || 'Pickup Point',
      status: data.status || 'PENDING',
      handoverWeight: null,
      verifiedMaterialId: null,
      notes: null,
      pickupTime: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.handovers.push(newHandover);

    const lot = mockDB.lots.find(l => l.id === data.lotId);
    const material = lot ? mockDB.materials.find(m => m.id === lot.materialId) : null;
    const collector = mockDB.users.find(u => u.id === data.collectorId);
    const recycler = mockDB.recyclers.find(r => r.id === data.recyclerId);

    return {
      ...newHandover,
      lot: { ...lot, material },
      collector,
      recycler
    };
  },

  update: async ({ where, data }) => {
    const idx = mockDB.handovers.findIndex(h => h.id === where.id);
    if (idx === -1) return null;
    mockDB.handovers[idx] = { ...mockDB.handovers[idx], ...data, updatedAt: new Date() };

    const h = mockDB.handovers[idx];
    const lot = mockDB.lots.find(l => l.id === h.lotId);
    const collector = mockDB.users.find(u => u.id === h.collectorId);
    const recycler = mockDB.recyclers.find(r => r.id === h.recyclerId);
    const verifiedMaterial = h.verifiedMaterialId ? mockDB.materials.find(m => m.id === h.verifiedMaterialId) : null;

    return {
      ...h,
      lot,
      collector,
      recycler,
      verifiedMaterial
    };
  }
};

// Tokens
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

const assignedRecyclerToken = jwt.sign(
  { id: 'rec-user-01', email: 'ecogreen@kconnect.demo', role: 'RECYCLER' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const wrongRecyclerToken = jwt.sign(
  { id: 'rec-user-02', email: 'wrong@kconnect.demo', role: 'RECYCLER' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { id: 'admin-001', email: 'admin@kconnect.demo', role: 'ADMIN' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

// Helper for making mock HTTP requests
async function makeRequest({ method, url, body = null, token = null }) {
  const http = require('http');
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      const payload = body ? JSON.stringify(body) : null;

      const headers = {};
      if (payload) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(payload);
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: port,
          path: url,
          method: method,
          headers: headers
        },
        (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            server.close();
            try {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: data ? JSON.parse(data) : {}
              });
            } catch (err) {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: data
              });
            }
          });
        }
      );

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  });
}

// Test Runner
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('🧪 Starting QR-Based Handover API Integration Tests...\n');

  let activeHandoverCode = null;
  let activeHandoverId = null;

  // ---------------------------------------------------------------------------
  // 1. Valid Handover Workflow
  // ---------------------------------------------------------------------------
  console.log('--- 1. Testing Valid Handover Workflow (Create & Verify) ---');

  // Step 1a: Collector creates handover record
  const createRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/create',
    body: {
      transactionId: 'tx-accepted-01',
      location: 'Mayapuri Depot Gate 2, Delhi'
    },
    token: collectorToken
  });

  assert(createRes.status === 201, 'POST /api/handover/create returns 201 Created');
  assert(createRes.body.success === true, 'Response indicates success');
  assert(createRes.body.data.handover.status === 'PENDING', 'Initial handover status is PENDING');
  assert(typeof createRes.body.data.qrData.code === 'string', 'Returns QR handover code string');
  assert(createRes.body.data.qrData.code.startsWith('QR-KC-2026-'), 'QR code matches standard format QR-KC-2026-XXXX');

  activeHandoverCode = createRes.body.data.qrData.code;
  activeHandoverId = createRes.body.data.handover.id;

  // Step 1b: Recycler scans and verifies QR code with physical scale reading
  const verifyRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/verify',
    body: {
      qrCode: activeHandoverCode,
      verifiedWeight: 24.8, // slight scale variation from estimated 25.0
      notes: 'Inspected PCB Grade A, scale verified'
    },
    token: assignedRecyclerToken
  });

  assert(verifyRes.status === 200, 'POST /api/handover/verify returns 200 OK');
  assert(verifyRes.body.success === true, 'Response indicates success');
  assert(verifyRes.body.data.verified === true, 'Response marks handover as verified');
  assert(verifyRes.body.data.auditTrail.handoverStatus === 'VERIFIED', 'Audit trail records status as VERIFIED');
  assert(verifyRes.body.data.auditTrail.pickupTime !== null, 'Audit trail records physical pickup time');
  assert(verifyRes.body.data.auditTrail.verifiedWeight === 24.8, 'Audit trail records verified weight (24.8 kg)');
  assert(verifyRes.body.data.auditTrail.transaction.transactionStatus === 'COMPLETED', 'Transaction status transitioned to COMPLETED');
  assert(verifyRes.body.data.auditTrail.transaction.paymentStatus === 'PAID', 'Payment status transitioned to PAID');
  assert(verifyRes.body.data.auditTrail.transaction.totalAmount === 12400.0, 'Recalculates total amount based on verified weight (24.8 * 500 = 12400)');
  assert(verifyRes.body.data.auditTrail.lot.status === 'COMPLETED', 'Lot status synchronized to COMPLETED');

  // ---------------------------------------------------------------------------
  // 2. Testing Repeated Scan Prevention
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Testing Repeated Scan Prevention ---');

  const repeatedVerifyRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/verify',
    body: {
      qrCode: activeHandoverCode,
      verifiedWeight: 24.8
    },
    token: assignedRecyclerToken
  });

  assert(repeatedVerifyRes.status === 400, 'Rejects duplicate scan with 400 Bad Request');
  assert(
    repeatedVerifyRes.body.message.includes('already been verified') ||
    repeatedVerifyRes.body.message.includes('already completed'),
    'Reports that handover/transaction is already verified or completed'
  );

  // ---------------------------------------------------------------------------
  // 3. Testing Invalid Handover Code
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing Invalid Handover Code ---');

  const invalidCodeRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/verify',
    body: {
      qrCode: 'QR-KC-2026-NONEXISTENT'
    },
    token: assignedRecyclerToken
  });

  assert(invalidCodeRes.status === 404, 'Rejects non-existent QR code with 404 Not Found');
  assert(invalidCodeRes.body.success === false, 'Error response indicates failure');

  // ---------------------------------------------------------------------------
  // 4. Testing Wrong Recycler Rejection
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Testing Wrong Recycler Rejection ---');

  // Create a second accepted transaction and handover
  const tx2 = {
    id: 'tx-accepted-second',
    lotId: 'lot-accepted-01',
    collectorId: 'col-001',
    recyclerId: 'rec-profile-01', // assigned to EcoGreen (rec-user-01)
    offeredPrice: 500.0,
    finalPrice: 500.0,
    totalAmount: 10000.0,
    transactionStatus: 'ACCEPTED',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    completedAt: null
  };
  mockDB.transactions.push(tx2);

  const createRes2 = await makeRequest({
    method: 'POST',
    url: '/api/handover/create',
    body: {
      transactionId: 'tx-accepted-second'
    },
    token: collectorToken
  });

  const code2 = createRes2.body.data.qrData.code;

  // Wrong recycler (rec-user-02) attempts to verify EcoGreen's handover
  const wrongRecyclerRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/verify',
    body: {
      qrCode: code2
    },
    token: wrongRecyclerToken
  });

  assert(wrongRecyclerRes.status === 403, 'Rejects wrong recycler with 403 Forbidden');
  assert(
    wrongRecyclerRes.body.message.includes('designated recycler') ||
    wrongRecyclerRes.body.message.includes('Forbidden'),
    'Explains recycler mismatch in error message'
  );

  // ---------------------------------------------------------------------------
  // 5. Testing Already Completed Transaction Rejection
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Testing Already Completed Transaction ---');

  const completedTxRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/create',
    body: {
      transactionId: 'tx-completed-02' // already completed
    },
    token: collectorToken
  });

  assert(completedTxRes.status === 400, 'Rejects handover creation on completed transaction with 400 Bad Request');
  assert(
    completedTxRes.body.message.includes('already COMPLETED') ||
    completedTxRes.body.message.includes('invalid status'),
    'Explains completion restriction'
  );

  // ---------------------------------------------------------------------------
  // 6. Testing Non-Accepted (PENDING) Transaction Rejection
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Testing Non-Accepted (PENDING) Transaction Rejection ---');

  const pendingTxRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/create',
    body: {
      transactionId: 'tx-pending-03' // PENDING, recycler has not accepted yet
    },
    token: collectorToken
  });

  assert(pendingTxRes.status === 400, 'Rejects handover on PENDING transaction with 400 Bad Request');
  assert(
    pendingTxRes.body.message.includes('PENDING') ||
    pendingTxRes.body.message.includes('must accept'),
    'Indicates transaction must be accepted before handover QR creation'
  );

  // ---------------------------------------------------------------------------
  // 7. Testing Unauthorized Collector Creation
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Testing Unauthorized Collector Creation ---');

  const unauthColRes = await makeRequest({
    method: 'POST',
    url: '/api/handover/create',
    body: {
      transactionId: 'tx-accepted-second' // owned by col-001
    },
    token: otherCollectorToken // col-002 attempts to generate
  });

  assert(unauthColRes.status === 403, 'Rejects unauthorized third-party collector with 403 Forbidden');

  // ---------------------------------------------------------------------------
  // 8. Testing GET /api/handover/:id
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. Testing GET /api/handover/:id ---');

  // Test retrieval by internal ID by collector
  const getByIdRes = await makeRequest({
    method: 'GET',
    url: `/api/handover/${activeHandoverId}`,
    token: collectorToken
  });

  assert(getByIdRes.status === 200, 'GET /api/handover/:id by collector returns 200 OK');
  assert(getByIdRes.body.data.id === activeHandoverId, 'Returns matching handover record');
  assert(getByIdRes.body.data.status === 'VERIFIED', 'Returns updated status');

  // Test retrieval by QR Code string by recycler
  const getByCodeRes = await makeRequest({
    method: 'GET',
    url: `/api/handover/${activeHandoverCode}`,
    token: assignedRecyclerToken
  });

  assert(getByCodeRes.status === 200, 'GET /api/handover/:qrCode by recycler returns 200 OK');
  assert(getByCodeRes.body.data.qrIdentifier === activeHandoverCode, 'Returns record matching QR identifier');

  // Test unauthorized third party retrieval
  const getByThirdPartyRes = await makeRequest({
    method: 'GET',
    url: `/api/handover/${activeHandoverId}`,
    token: otherCollectorToken
  });

  assert(getByThirdPartyRes.status === 403, 'GET /api/handover/:id by unauthorized user returns 403 Forbidden');

  // Test non-existent ID
  const getNonExistentRes = await makeRequest({
    method: 'GET',
    url: '/api/handover/ho-nonexistent-999',
    token: collectorToken
  });

  assert(getNonExistentRes.status === 404, 'GET /api/handover/invalid-id returns 404 Not Found');

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n=============================================');
  console.log(`HANDOVER TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=============================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
