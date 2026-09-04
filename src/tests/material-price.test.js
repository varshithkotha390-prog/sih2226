const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/db');
const app = require('../app');

// In-memory mock database for isolated testing
const mockDB = {
  materials: [
    {
      id: 'mat-copper-01',
      name: 'Copper Wiring & Heavy Cables',
      code: 'MAT-COP-W',
      description: 'High-purity copper wiring',
      unit: 'kg',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      prices: []
    }
  ],
  prices: [
    {
      id: 'prc-001',
      materialId: 'mat-copper-01',
      pricePerKg: 720.0,
      location: 'Delhi NCR - Mayapuri Hub',
      source: 'CPCB Benchmark',
      validFrom: new Date('2025-01-01'),
      validTo: new Date('2025-06-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'prc-002',
      materialId: 'mat-copper-01',
      pricePerKg: 750.0,
      location: 'Delhi NCR - Mayapuri Hub',
      source: 'Mayapuri Scrap Index',
      validFrom: new Date('2025-06-01'),
      validTo: null,
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01')
    }
  ],
  lots: []
};

// Mock prisma methods for material & price
prisma.material = {
  findMany: async ({ where = {}, orderBy }) => {
    let result = [...mockDB.materials];
    if (where.OR) {
      const search = where.OR[0].name.contains.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(search) ||
        (m.code && m.code.toLowerCase().includes(search))
      );
    }
    return result.map(m => ({
      ...m,
      prices: mockDB.prices.filter(p => p.materialId === m.id)
    }));
  },
  findUnique: async ({ where }) => {
    const mat = mockDB.materials.find(m => m.id === where.id);
    if (!mat) return null;
    return {
      ...mat,
      prices: mockDB.prices.filter(p => p.materialId === mat.id)
    };
  },
  findFirst: async ({ where }) => {
    return mockDB.materials.find(m => {
      if (where.id && where.id.not && m.id === where.id.not) return false;
      if (where.OR) {
        return where.OR.some(cond => {
          if (cond.name && m.name.toLowerCase() === cond.name.equals.toLowerCase()) return true;
          if (cond.code && m.code && m.code.toUpperCase() === cond.code.equals.toUpperCase()) return true;
          return false;
        });
      }
      return false;
    }) || null;
  },
  create: async ({ data }) => {
    const newMat = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      code: data.code || null,
      description: data.description || null,
      unit: data.unit || 'kg',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.materials.push(newMat);
    return newMat;
  },
  update: async ({ where, data }) => {
    const idx = mockDB.materials.findIndex(m => m.id === where.id);
    if (idx === -1) return null;
    mockDB.materials[idx] = { ...mockDB.materials[idx], ...data, updatedAt: new Date() };
    return mockDB.materials[idx];
  },
  delete: async ({ where }) => {
    const idx = mockDB.materials.findIndex(m => m.id === where.id);
    if (idx === -1) return null;
    const deleted = mockDB.materials.splice(idx, 1)[0];
    mockDB.prices = mockDB.prices.filter(p => p.materialId !== where.id);
    return deleted;
  }
};

prisma.price = {
  findMany: async ({ where = {} }) => {
    let result = mockDB.prices.filter(p => p.materialId === where.materialId);
    if (where.location) {
      const loc = where.location.contains.toLowerCase();
      result = result.filter(p => p.location.toLowerCase().includes(loc));
    }
    return result.map(p => {
      const mat = mockDB.materials.find(m => m.id === p.materialId);
      return { ...p, material: mat };
    });
  },
  findUnique: async ({ where }) => {
    const prc = mockDB.prices.find(p => p.id === where.id);
    if (!prc) return null;
    const mat = mockDB.materials.find(m => m.id === prc.materialId);
    return { ...prc, material: mat };
  },
  create: async ({ data }) => {
    const newPrice = {
      id: `prc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      materialId: data.materialId,
      pricePerKg: data.pricePerKg,
      location: data.location,
      source: data.source,
      validFrom: data.validFrom || new Date(),
      validTo: data.validTo || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDB.prices.push(newPrice);
    const mat = mockDB.materials.find(m => m.id === data.materialId);
    return { ...newPrice, material: mat };
  },
  updateMany: async ({ where, data }) => {
    let count = 0;
    mockDB.prices.forEach(p => {
      if (p.materialId === where.materialId && p.location === where.location && p.validTo === null) {
        p.validTo = data.validTo;
        count++;
      }
    });
    return { count };
  },
  update: async ({ where, data }) => {
    const idx = mockDB.prices.findIndex(p => p.id === where.id);
    if (idx === -1) return null;
    mockDB.prices[idx] = { ...mockDB.prices[idx], ...data, updatedAt: new Date() };
    const mat = mockDB.materials.find(m => m.id === mockDB.prices[idx].materialId);
    return { ...mockDB.prices[idx], material: mat };
  }
};

prisma.lot = {
  count: async ({ where }) => {
    return mockDB.lots.filter(l => l.materialId === where.materialId).length;
  }
};

// Generate valid tokens
const adminToken = jwt.sign(
  { id: 'admin-001', email: 'admin@kabadiwala.demo', role: 'ADMIN' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

const collectorToken = jwt.sign(
  { id: 'collector-001', email: 'ramesh@kconnect.demo', role: 'COLLECTOR' },
  config.jwtSecret,
  { expiresIn: '1h' }
);

prisma.user = {
  findUnique: async ({ where }) => {
    if (where.id === 'admin-001') {
      return { id: 'admin-001', name: 'Admin', email: 'admin@kabadiwala.demo', role: 'ADMIN' };
    }
    if (where.id === 'collector-001') {
      return { id: 'collector-001', name: 'Ramesh', email: 'ramesh@kconnect.demo', role: 'COLLECTOR' };
    }
    return null;
  }
};

async function runTests() {
  console.log('🧪 Starting Material & Price API Integration Tests...\n');

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
    // Start server on ephemeral port
    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;

    // -------------------------------------------------------------------------
    // 1. Test GET /api/materials (Public)
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing GET /api/materials ---');
    const resList = await fetch(`${baseUrl}/materials`);
    const dataList = await resList.json();
    assert(resList.status === 200, 'GET /materials returns 200 OK');
    assert(dataList.success === true, 'Response indicates success');
    assert(Array.isArray(dataList.data) && dataList.data.length > 0, 'Returns list of materials');
    assert(dataList.data[0].currentPricePerKg !== null, 'Includes current price rate');

    // -------------------------------------------------------------------------
    // 2. Test GET /api/materials/:id (Public)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing GET /api/materials/:id ---');
    const resGet = await fetch(`${baseUrl}/materials/mat-copper-01`);
    const dataGet = await resGet.json();
    assert(resGet.status === 200, 'GET /materials/:id returns 200 OK');
    assert(dataGet.data.name === 'Copper Wiring & Heavy Cables', 'Returns matching material name');
    assert(Array.isArray(dataGet.data.recentPrices), 'Includes price history array');

    // -------------------------------------------------------------------------
    // 3. Test Invalid Material IDs
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Invalid Material IDs ---');
    const resNotFound = await fetch(`${baseUrl}/materials/non-existent-id-999`);
    const dataNotFound = await resNotFound.json();
    assert(resNotFound.status === 404, 'GET /materials/non-existent-id returns 404 Not Found');
    assert(dataNotFound.success === false, 'Indicates failure for non-existent material');

    // -------------------------------------------------------------------------
    // 4. Test Unauthorized Requests
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Unauthorized & Forbidden Access ---');
    // POST /materials without token
    const resNoToken = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Lithium Cells', code: 'MAT-LIO' })
    });
    assert(resNoToken.status === 401, 'POST /materials without token returns 401 Unauthorized');

    // POST /materials with collector token (role mismatch)
    const resCollectorToken = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({ name: 'Lithium Cells', code: 'MAT-LIO' })
    });
    assert(resCollectorToken.status === 403, 'POST /materials with COLLECTOR token returns 403 Forbidden');

    // POST /prices with collector token
    const resPriceForbidden = await fetch(`${baseUrl}/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${collectorToken}`
      },
      body: JSON.stringify({ materialId: 'mat-copper-01', pricePerKg: 800, location: 'Delhi', source: 'CPCB' })
    });
    assert(resPriceForbidden.status === 403, 'POST /prices with COLLECTOR token returns 403 Forbidden');

    // -------------------------------------------------------------------------
    // 5. Test Admin Requests: Create, Update, Delete Material
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Admin Material Operations ---');
    let createdMaterialId;

    // Create Material
    const resCreate = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Lithium-Ion Battery Packs',
        code: 'MAT-LIO-B',
        description: 'Batteries from laptops and EVs',
        unit: 'kg'
      })
    });
    const dataCreate = await resCreate.json();
    assert(resCreate.status === 201, 'POST /materials with ADMIN token returns 201 Created');
    assert(dataCreate.data.name === 'Lithium-Ion Battery Packs', 'Material successfully created');
    createdMaterialId = dataCreate.data.id;

    // Duplicate Material Rejection
    const resDuplicate = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Lithium-Ion Battery Packs',
        code: 'MAT-LIO-B'
      })
    });
    assert(resDuplicate.status === 409, 'Duplicate material name/code returns 409 Conflict');

    // Update Material
    const resUpdate = await fetch(`${baseUrl}/materials/${createdMaterialId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        description: 'Updated: High grade rechargeable lithium battery packs'
      })
    });
    const dataUpdate = await resUpdate.json();
    assert(resUpdate.status === 200, 'PATCH /materials/:id returns 200 OK');
    assert(dataUpdate.data.description.startsWith('Updated:'), 'Description updated successfully');

    // -------------------------------------------------------------------------
    // 6. Test Price Operations: Create Price, Get Historical Prices, Update Price
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Price Operations & Historical Ledger ---');
    let createdPriceId;

    // Create New Price
    const resCreatePrice = await fetch(`${baseUrl}/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        materialId: createdMaterialId,
        pricePerKg: 320.50,
        location: 'Delhi NCR - Okhla Zone',
        source: 'CPCB Official Benchmark'
      })
    });
    const dataCreatePrice = await resCreatePrice.json();
    assert(resCreatePrice.status === 201, 'POST /prices with ADMIN returns 201 Created');
    assert(dataCreatePrice.data.pricePerKg === 320.50, 'Price stored accurately');
    createdPriceId = dataCreatePrice.data.id;

    // Add a second price for historical record
    await fetch(`${baseUrl}/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        materialId: createdMaterialId,
        pricePerKg: 345.00,
        location: 'Delhi NCR - Okhla Zone',
        source: 'Mayapuri Market Index'
      })
    });

    // Query Prices for Material
    const resPrices = await fetch(`${baseUrl}/prices/${createdMaterialId}`);
    const dataPrices = await resPrices.json();
    assert(resPrices.status === 200, 'GET /prices/:materialId returns 200 OK');
    assert(Array.isArray(dataPrices.data) && dataPrices.data.length >= 2, 'Historical price records preserved and returned');

    // Update Price Record
    const resUpdatePrice = await fetch(`${baseUrl}/prices/${createdPriceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        pricePerKg: 330.00
      })
    });
    const dataUpdatePrice = await resUpdatePrice.json();
    assert(resUpdatePrice.status === 200, 'PATCH /prices/:id returns 200 OK');
    assert(dataUpdatePrice.data.pricePerKg === 330.00, 'Price value updated successfully');

    // -------------------------------------------------------------------------
    // 7. Test Delete Material
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing DELETE /api/materials/:id ---');
    const resDelete = await fetch(`${baseUrl}/materials/${createdMaterialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const dataDelete = await resDelete.json();
    assert(resDelete.status === 200, 'DELETE /materials/:id returns 200 OK');
    assert(dataDelete.data.deleted === true, 'Material deleted confirmation');

    // Verify it is gone
    const resVerifyGone = await fetch(`${baseUrl}/materials/${createdMaterialId}`);
    assert(resVerifyGone.status === 404, 'Subsequent GET returns 404 Not Found');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================');
  console.log(`MATERIAL & PRICE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
