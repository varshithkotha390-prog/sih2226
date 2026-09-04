const prisma = require('../config/db');
const app = require('../app');
const { calculateHaversineDistance, calculateDistanceScore } = require('../services/recommendation.service');

// Seeded test mock data
const mockDB = {
  materials: [
    {
      id: 'mat-pcb-high-grade',
      name: 'PCB Grade A (Motherboards)',
      code: 'MAT-PCB-A',
      unit: 'kg',
      prices: [
        {
          id: 'prc-01',
          pricePerKg: 520.0,
          source: 'CPCB Official Benchmark',
          validFrom: new Date('2025-01-01'),
          validTo: null
        }
      ]
    },
    {
      id: 'mat-battery-lithium',
      name: 'Lithium-Ion Battery Packs',
      code: 'MAT-LIO-B',
      unit: 'kg',
      prices: [{ pricePerKg: 320.0, validFrom: new Date(), validTo: null }]
    }
  ],

  lots: [
    {
      id: 'lot-pcb-mayapuri-01',
      lotNumber: 'LOT-2026-10101',
      collectorId: 'col-001',
      materialId: 'mat-pcb-high-grade',
      weight: 25.0,
      estimatedPrice: 13000.0, // 25 * 520
      status: 'AVAILABLE',
      latitude: 28.6340,
      longitude: 77.1260,
      collectorLocation: 'Mayapuri Industrial Yard, New Delhi'
    }
  ],

  recyclers: [
    {
      id: 'rec-ideal-01',
      name: 'EcoGreen Close & Authorized Hub',
      address: 'Plot 44, Mayapuri Phase 1, New Delhi',
      latitude: 28.6380, // Very close (~0.5 km)
      longitude: 77.1290,
      authorizedStatus: true,
      authorizationId: 'CPCB/EW-REG/DL/2024/001',
      pickupAvailable: true,
      contactInfo: '+91-11-25910001 | ecogreen@kconnect.demo',
      supportedMaterialIds: ['mat-pcb-high-grade', 'mat-battery-lithium']
    },
    {
      id: 'rec-moderate-02',
      name: 'Okhla Sustainable Metals',
      address: 'F-14, Okhla Phase 1, New Delhi',
      latitude: 28.5355, // Moderate distance (~18 km)
      longitude: 77.2732,
      authorizedStatus: true,
      authorizationId: 'CPCB/EW-REG/DL/2024/004',
      pickupAvailable: false,
      contactInfo: '+91-11-26810004',
      supportedMaterialIds: ['mat-pcb-high-grade']
    },
    {
      id: 'rec-incompatible-far-03',
      name: 'Far & Incompatible Dismantler',
      address: 'Sector 8, IMT Manesar, Haryana',
      latitude: 28.3600, // Far (~40 km), unauthorized, no pickup, incompatible material
      longitude: 76.9300,
      authorizedStatus: false,
      authorizationId: null,
      pickupAvailable: false,
      contactInfo: '+91-124-2290020',
      supportedMaterialIds: ['mat-battery-lithium'] // does NOT accept mat-pcb-high-grade
    }
  ],

  transactions: [
    {
      id: 'tx-01',
      lotId: 'lot-pcb-mayapuri-01',
      recyclerId: 'rec-ideal-01',
      offeredPrice: 540.0, // generous offer (+3.8% above reference 520)
      transactionStatus: 'PENDING'
    }
  ]
};

// Mock prisma queries
prisma.lot = {
  findUnique: async ({ where }) => {
    const lot = mockDB.lots.find(l => l.id === where.id);
    if (!lot) return null;
    const material = mockDB.materials.find(m => m.id === lot.materialId);
    const transactions = mockDB.transactions.filter(t => t.lotId === lot.id);
    return {
      ...lot,
      material,
      transactions
    };
  }
};

prisma.recycler = {
  findMany: async () => {
    return mockDB.recyclers.map(r => {
      const supportedMaterials = mockDB.materials.filter(m => r.supportedMaterialIds.includes(m.id));
      return {
        ...r,
        supportedMaterials,
        user: { id: `usr-${r.id}`, name: r.name, email: `${r.id}@demo.com` }
      };
    });
  }
};

async function runRecommendationTests() {
  console.log('🧪 Starting Recycler Recommendation Engine Integration Tests...\n');

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
    // 1. Test Haversine Distance & Distance Normalization Unit Functions
    // -------------------------------------------------------------------------
    console.log('--- 1. Testing Haversine Formula & Distance Decay Function ---');
    const distNear = calculateHaversineDistance(28.6340, 77.1260, 28.6380, 77.1290);
    assert(distNear > 0 && distNear < 1.0, `Calculates near distance accurately (${distNear} km)`);
    assert(calculateDistanceScore(distNear) === 100, 'Distances <= 2 km score 100');
    assert(calculateDistanceScore(55) === 0, 'Distances >= 50 km score 0');
    assert(calculateDistanceScore(26) > 40 && calculateDistanceScore(26) < 60, 'Mid-range distances scale linearly (~50 score)');

    // -------------------------------------------------------------------------
    // 2. Test GET /api/recyclers/recommended?lotId=...
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing GET /api/recyclers/recommended?lotId=... ---');
    const resRec = await fetch(`${baseUrl}/recyclers/recommended?lotId=lot-pcb-mayapuri-01`);
    const dataRec = await resRec.json();

    assert(resRec.status === 200, 'GET /recyclers/recommended returns 200 OK');
    assert(dataRec.success === true, 'Response indicates success');
    assert(Array.isArray(dataRec.data.recommendations) && dataRec.data.recommendations.length === 3, 'Returns all evaluated recyclers');

    const topRecycler = dataRec.data.recommendations[0];
    const middleRecycler = dataRec.data.recommendations[1];
    const bottomRecycler = dataRec.data.recommendations[2];

    // Verify top ranked recycler is rec-ideal-01
    assert(topRecycler.recycler_id === 'rec-ideal-01', 'Best fit recycler (close, authorized, pickup, compatible) ranks #1');
    assert(topRecycler.match_score >= 90, `Top recycler gets high match score (${topRecycler.match_score} >= 90)`);
    assert(topRecycler.material_compatible === true, 'Top recycler is material compatible');
    assert(topRecycler.authorized === true, 'Top recycler is authorized');
    assert(topRecycler.pickup_available === true, 'Top recycler has pickup available');
    assert(topRecycler.distance_km < 2.0, 'Top recycler is nearby (< 2 km)');

    // Verify bottom ranked recycler is rec-incompatible-far-03
    assert(bottomRecycler.recycler_id === 'rec-incompatible-far-03', 'Far & incompatible recycler ranks lowest');
    assert(bottomRecycler.match_score < 40, `Low fit recycler receives low match score (${bottomRecycler.match_score} < 40)`);
    assert(bottomRecycler.material_compatible === false, 'Bottom recycler is not material compatible');

    // Verify strictly descending order
    assert(
      topRecycler.match_score >= middleRecycler.match_score &&
      middleRecycler.match_score >= bottomRecycler.match_score,
      'Recommendations are strictly sorted by match_score descending'
    );

    // -------------------------------------------------------------------------
    // 3. Mathematical Verification of 5-Factor Scoring Formula
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Verifying Scoring Weights & Mathematical Accuracy ---');
    const breakdown = topRecycler.score_breakdown;
    const computedExpected = parseFloat((
      (breakdown.price_score * 0.30) +
      (breakdown.distance_score * 0.25) +
      (breakdown.material_score * 0.20) +
      (breakdown.authorization_score * 0.15) +
      (breakdown.pickup_score * 0.10)
    ).toFixed(2));

    assert(
      Math.abs(topRecycler.match_score - computedExpected) < 0.05,
      `Calculated match_score (${topRecycler.match_score}) precisely matches weighted formula (${computedExpected})`
    );
    assert(dataRec.data.scoring_weights.price === '30%', 'Specifies 30% price weight');
    assert(dataRec.data.scoring_weights.distance === '25%', 'Specifies 25% distance weight');
    assert(dataRec.data.scoring_weights.material_compatibility === '20%', 'Specifies 20% material weight');
    assert(dataRec.data.scoring_weights.authorization === '15%', 'Specifies 15% authorization weight');
    assert(dataRec.data.scoring_weights.pickup_availability === '10%', 'Specifies 10% pickup weight');

    // -------------------------------------------------------------------------
    // 4. Edge Cases: Missing and Invalid lotId
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Edge Cases (Missing / Non-Existent lotId) ---');
    // Missing lotId
    const resNoLot = await fetch(`${baseUrl}/recyclers/recommended`);
    const dataNoLot = await resNoLot.json();
    assert(resNoLot.status === 400, 'Missing lotId returns 400 Bad Request');
    assert(dataNoLot.success === false, 'Indicates error on missing query param');

    // Non-existent lotId
    const resBadLot = await fetch(`${baseUrl}/recyclers/recommended?lotId=non-existent-lot-999`);
    const dataBadLot = await resBadLot.json();
    assert(resBadLot.status === 404, 'Non-existent lotId returns 404 Not Found');
    assert(dataBadLot.success === false, 'Indicates error on non-existent lot');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================');
  console.log(`RECOMMENDATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRecommendationTests();
