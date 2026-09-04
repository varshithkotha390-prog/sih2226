const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const app = require('../app');
const { getDateBoundaries } = require('../services/earnings.service');

// Calculate controlled test dates around real dynamic boundaries
const { startOfToday, startOfWeek, startOfMonth } = getDateBoundaries();

// Helper to get safe timestamps within periods
const todayTimestamp = new Date(startOfToday.getTime() + 1000 * 60 * 60); // 1 hour after midnight today
const thisWeekTimestamp = new Date(startOfWeek.getTime() + 1000 * 60); // In this week
const thisMonthTimestamp = new Date(startOfMonth.getTime() + 1000 * 60); // In this month
const pastMonthTimestamp = new Date(startOfMonth.getTime() - 1000 * 60 * 60 * 24 * 15); // 15 days before 1st of month

// In-memory mock database for Earnings tests
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
      name: 'Pooja Zero-Earnings Collector',
      email: 'pooja@kconnect.demo',
      phone: '+919811001002',
      role: 'COLLECTOR'
    },
    {
      id: 'rec-001',
      name: 'EcoGreen Recycler Rep',
      email: 'ecogreen@kconnect.demo',
      role: 'RECYCLER'
    }
  ],

  materials: [
    { id: 'mat-pcb', name: 'PCB Motherboards', unit: 'kg' },
    { id: 'mat-copper', name: 'Copper Wiring', unit: 'kg' }
  ],

  lots: [
    { id: 'lot-01', lotNumber: 'LOT-2026-001', materialId: 'mat-pcb', weight: 10.0 },
    { id: 'lot-02', lotNumber: 'LOT-2026-002', materialId: 'mat-pcb', weight: 20.0 },
    { id: 'lot-03', lotNumber: 'LOT-2026-003', materialId: 'mat-copper', weight: 25.0 },
    { id: 'lot-04', lotNumber: 'LOT-2026-004', materialId: 'mat-copper', weight: 30.0 },
    { id: 'lot-pending', lotNumber: 'LOT-2026-005', materialId: 'mat-pcb', weight: 50.0 },
    { id: 'lot-cancelled', lotNumber: 'LOT-2026-006', materialId: 'mat-pcb', weight: 40.0 }
  ],

  handovers: [
    {
      id: 'ho-03',
      transactionId: 'tx-completed-03',
      handoverWeight: 24.5 // scale difference from lot-03's 25.0
    }
  ],

  transactions: [
    // 1. COMPLETED today (amount: 3000, weight: 10)
    {
      id: 'tx-completed-today',
      collectorId: 'col-001',
      lotId: 'lot-01',
      recyclerId: 'rec-001',
      totalAmount: 3000.0,
      transactionStatus: 'COMPLETED',
      paymentStatus: 'PAID',
      completedAt: todayTimestamp,
      createdAt: todayTimestamp
    },
    // 2. COMPLETED this week (amount: 5000, weight: 20)
    {
      id: 'tx-completed-this-week',
      collectorId: 'col-001',
      lotId: 'lot-02',
      recyclerId: 'rec-001',
      totalAmount: 5000.0,
      transactionStatus: 'COMPLETED',
      paymentStatus: 'PAID',
      completedAt: thisWeekTimestamp,
      createdAt: thisWeekTimestamp
    },
    // 3. COMPLETED this month (amount: 7000, weight: 24.5 from handover)
    {
      id: 'tx-completed-03',
      collectorId: 'col-001',
      lotId: 'lot-03',
      recyclerId: 'rec-001',
      totalAmount: 7000.0,
      transactionStatus: 'COMPLETED',
      paymentStatus: 'PAID',
      completedAt: thisMonthTimestamp,
      createdAt: thisMonthTimestamp
    },
    // 4. COMPLETED past month (amount: 10000, weight: 30)
    {
      id: 'tx-completed-past-month',
      collectorId: 'col-001',
      lotId: 'lot-04',
      recyclerId: 'rec-001',
      totalAmount: 10000.0,
      transactionStatus: 'COMPLETED',
      paymentStatus: 'PAID',
      completedAt: pastMonthTimestamp,
      createdAt: pastMonthTimestamp
    },
    // 5. PENDING transaction (should be IGNORED in earnings)
    {
      id: 'tx-pending-01',
      collectorId: 'col-001',
      lotId: 'lot-pending',
      recyclerId: 'rec-001',
      totalAmount: 9999.0,
      transactionStatus: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: todayTimestamp,
      completedAt: null
    },
    // 6. CANCELLED transaction (should be IGNORED in earnings)
    {
      id: 'tx-cancelled-01',
      collectorId: 'col-001',
      lotId: 'lot-cancelled',
      recyclerId: 'rec-001',
      totalAmount: 8888.0,
      transactionStatus: 'CANCELLED',
      paymentStatus: 'FAILED',
      createdAt: todayTimestamp,
      completedAt: null
    }
  ]
};

// Mock Prisma implementations
prisma.user = {
  findUnique: async ({ where }) => mockDB.users.find(u => u.id === where.id) || null
};

prisma.transaction = {
  findMany: async ({ where, include, orderBy }) => {
    let results = mockDB.transactions.filter(t => {
      if (where.collectorId && t.collectorId !== where.collectorId) return false;
      if (where.transactionStatus && t.transactionStatus !== where.transactionStatus) return false;
      return true;
    });

    // Populate relations
    results = results.map(t => {
      const lot = mockDB.lots.find(l => l.id === t.lotId);
      const material = lot ? mockDB.materials.find(m => m.id === lot.materialId) : null;
      const handover = mockDB.handovers.find(h => h.transactionId === t.id) || null;
      const recycler = mockDB.users.find(u => u.id === t.recyclerId);

      return {
        ...t,
        lot: lot ? { ...lot, material } : null,
        handover,
        recycler
      };
    });

    if (orderBy && orderBy.completedAt === 'desc') {
      results.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
    }

    return results;
  }
};

// Tokens
const collectorToken = jwt.sign(
  { id: 'col-001', name: 'Ramesh Collector', email: 'ramesh@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const zeroEarningsToken = jwt.sign(
  { id: 'col-002', name: 'Pooja Zero-Earnings Collector', email: 'pooja@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const recyclerToken = jwt.sign(
  { id: 'rec-001', name: 'EcoGreen Recycler Rep', email: 'ecogreen@kconnect.demo', role: 'RECYCLER' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

// HTTP Helper
async function makeRequest({ method, url, token = null }) {
  const http = require('http');
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

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
                body: data ? JSON.parse(data) : {}
              });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );

      req.on('error', err => {
        server.close();
        reject(err);
      });

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
  console.log('🧪 Starting Collector Earnings API Integration Tests...\n');

  // ---------------------------------------------------------------------------
  // 1. Testing GET /api/earnings/me for Active Collector
  // ---------------------------------------------------------------------------
  console.log('--- 1. Testing GET /api/earnings/me for Active Collector ---');

  const res = await makeRequest({
    method: 'GET',
    url: '/api/earnings/me',
    token: collectorToken
  });

  assert(res.status === 200, 'GET /api/earnings/me returns 200 OK');
  assert(res.body.success === true, 'Response status is success');
  assert(res.body.data.collector.id === 'col-001', 'Identifies correct collector');
  assert(res.body.data.currency === 'INR', 'Specifies currency as INR');

  const summary = res.body.data.summary;
  console.log('   Calculated summary metrics:', summary);

  // Completed transactions only: Tx 1 (3000), Tx 2 (5000), Tx 3 (7000), Tx 4 (10000)
  // Non-completed: PENDING (9999) & CANCELLED (8888) MUST NOT BE INCLUDED!
  assert(summary.totalEarnings === 25000.0, 'Total earnings accurately calculated from completed transactions (25000.00)');
  assert(summary.completedTransactionsCount === 4, 'Completed transaction count is 4 (ignores PENDING and CANCELLED)');

  // Handover weight verification:
  // lot-01 (10) + lot-02 (20) + handover-03 (24.5) + lot-04 (30) = 84.5
  assert(summary.totalWeightSoldKg === 84.5, 'Total e-waste weight sold correctly calculated using scale reading (84.5 kg)');

  // Period earnings checks
  let expectedToday = 0;
  let expectedWeek = 0;
  let expectedMonth = 0;
  let expectedTotal = 0;

  for (const t of mockDB.transactions) {
    if (t.transactionStatus === 'COMPLETED' && t.collectorId === 'col-001') {
      expectedTotal += t.totalAmount;
      if (t.completedAt >= startOfToday) expectedToday += t.totalAmount;
      if (t.completedAt >= startOfWeek) expectedWeek += t.totalAmount;
      if (t.completedAt >= startOfMonth) expectedMonth += t.totalAmount;
    }
  }

  assert(summary.todayEarnings === expectedToday, `Today's earnings correctly equals expected (${expectedToday})`);
  assert(summary.thisWeekEarnings === expectedWeek, `This week's earnings correctly equals expected (${expectedWeek})`);
  assert(summary.thisMonthEarnings === expectedMonth, `This month's earnings correctly equals expected (${expectedMonth})`);
  assert(summary.totalEarnings === expectedTotal, `Total earnings correctly equals expected (${expectedTotal})`);

  // Dashboard structure
  assert(Array.isArray(res.body.data.materialBreakdown), 'Provides material breakdown array');
  assert(res.body.data.materialBreakdown.length === 2, 'Breaks down into 2 distinct materials (PCB & Copper)');
  assert(Array.isArray(res.body.data.recentTransactions), 'Provides recent transactions array');
  assert(res.body.data.recentTransactions.length <= 5, 'Limits recent transactions to top 5');

  // ---------------------------------------------------------------------------
  // 2. Testing Collector with Zero Earnings
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Testing Collector with Zero Completed Transactions ---');

  const zeroRes = await makeRequest({
    method: 'GET',
    url: '/api/earnings/me',
    token: zeroEarningsToken
  });

  assert(zeroRes.status === 200, 'GET /api/earnings/me returns 200 OK for collector with no transactions');
  assert(zeroRes.body.data.summary.totalEarnings === 0, 'Total earnings is 0');
  assert(zeroRes.body.data.summary.todayEarnings === 0, "Today's earnings is 0");
  assert(zeroRes.body.data.summary.thisWeekEarnings === 0, "This week's earnings is 0");
  assert(zeroRes.body.data.summary.thisMonthEarnings === 0, "This month's earnings is 0");
  assert(zeroRes.body.data.summary.completedTransactionsCount === 0, 'Completed count is 0');
  assert(zeroRes.body.data.summary.totalWeightSoldKg === 0, 'Total weight sold is 0');
  assert(zeroRes.body.data.materialBreakdown.length === 0, 'Material breakdown is empty array');

  // ---------------------------------------------------------------------------
  // 3. Testing Role Authorization & Access Control
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing Role Authorization & Access Control ---');

  // Recycler attempting to access collector earnings
  const recyclerRes = await makeRequest({
    method: 'GET',
    url: '/api/earnings/me',
    token: recyclerToken
  });

  assert(recyclerRes.status === 403, 'Rejects RECYCLER role with 403 Forbidden');
  assert(recyclerRes.body.success === false, 'Error response indicates failure');

  // Unauthenticated request
  const unauthRes = await makeRequest({
    method: 'GET',
    url: '/api/earnings/me'
  });

  assert(unauthRes.status === 401, 'Rejects unauthenticated request with 401 Unauthorized');

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n=============================================');
  console.log(`EARNINGS TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=============================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
