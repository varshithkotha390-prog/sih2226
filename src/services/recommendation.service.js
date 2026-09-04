const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 * @param {number} lat1 - Collector Latitude
 * @param {number} lon1 - Collector Longitude
 * @param {number} lat2 - Recycler Latitude
 * @param {number} lon2 - Recycler Longitude
 * @returns {number} Distance in km rounded to 2 decimal places
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
};

/**
 * Score distance on a 0-100 scale:
 * <= 2 km: 100
 * >= 50 km: 0
 * Linear interpolation between 2 km and 50 km
 */
const calculateDistanceScore = (distanceKm) => {
  const maxDistance = 50.0;
  if (distanceKm <= 2.0) return 100;
  if (distanceKm >= maxDistance) return 0;
  const score = 100 * (1 - (distanceKm - 2.0) / (maxDistance - 2.0));
  return parseFloat(Math.max(0, Math.min(100, score)).toFixed(2));
};

/**
 * Score price / valuation competitiveness on a 0-100 scale
 * Considers recycler's active bid/offer on the lot relative to reference rate
 */
const calculatePriceScore = (recyclerTransaction, referencePricePerKg) => {
  if (!recyclerTransaction || !recyclerTransaction.offeredPrice) {
    // Neutral market baseline score when recycler has not yet placed a direct bid
    return 70.0;
  }

  const offered = parseFloat(recyclerTransaction.offeredPrice.toString());
  const ref = parseFloat(referencePricePerKg.toString());

  if (ref <= 0) return 70.0;

  // If offered price equals reference rate -> 80 points
  // If offered price exceeds reference by 15% -> 100 points
  // If offered price is below reference -> scales down
  const ratio = offered / ref;
  let score = 80.0 + (ratio - 1.0) * 133.33;

  return parseFloat(Math.max(0, Math.min(100, score)).toFixed(2));
};

/**
 * Transparent, deterministic recycler recommendation scoring engine
 * Weights:
 * - Price Score:              30% (0.30)
 * - Distance Score:           25% (0.25)
 * - Material Compatibility:   20% (0.20)
 * - Authorization Status:     15% (0.15)
 * - Pickup Availability:      10% (0.10)
 */
const recommendRecyclersForLot = async (lotId, { limit = 10 } = {}) => {
  // 1. Fetch lot details with material and existing transactions/bids
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      material: {
        include: {
          prices: {
            orderBy: { validFrom: 'desc' },
            take: 1
          }
        }
      },
      transactions: {
        select: {
          id: true,
          recyclerId: true,
          offeredPrice: true,
          transactionStatus: true
        }
      }
    }
  });

  if (!lot) {
    throw new ApiError(404, `Lot with ID '${lotId}' not found`);
  }

  const collectorLat = lot.latitude || 28.6650; // Fallback to central region if unpinned
  const collectorLng = lot.longitude || 77.1650;

  const latestPriceRecord = lot.material.prices && lot.material.prices.length > 0 ? lot.material.prices[0] : null;
  const referencePrice = latestPriceRecord ? parseFloat(latestPriceRecord.pricePerKg.toString()) : 100.0;

  // 2. Fetch all recyclers with supported materials and user accounts
  const recyclers = await prisma.recycler.findMany({
    include: {
      supportedMaterials: {
        select: { id: true, name: true, code: true }
      },
      user: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  // 3. Score each recycler deterministically
  const scoredRecyclers = recyclers.map(recycler => {
    // A. Material Compatibility (20%)
    const isMaterialCompatible = recycler.supportedMaterials.some(m => m.id === lot.materialId);
    const materialScore = isMaterialCompatible ? 100.0 : 0.0;

    // B. Authorization Status (15%)
    const isAuthorized = Boolean(recycler.authorizedStatus);
    const authorizationScore = isAuthorized ? 100.0 : 0.0;

    // C. Pickup Availability (10%)
    const hasPickup = Boolean(recycler.pickupAvailable);
    const pickupScore = hasPickup ? 100.0 : 0.0;

    // D. Distance Score (25%)
    const distanceKm = calculateHaversineDistance(
      collectorLat,
      collectorLng,
      recycler.latitude,
      recycler.longitude
    );
    const distanceScore = calculateDistanceScore(distanceKm);

    // E. Price Score (30%)
    const directTx = lot.transactions.find(tx => tx.recyclerId === recycler.id);
    const priceScore = calculatePriceScore(directTx, referencePrice);

    // Final Weighted Score (0 to 100)
    const finalScore = parseFloat((
      (priceScore * 0.30) +
      (distanceScore * 0.25) +
      (materialScore * 0.20) +
      (authorizationScore * 0.15) +
      (pickupScore * 0.10)
    ).toFixed(2));

    return {
      recycler: recycler.name,
      recycler_id: recycler.id,
      match_score: finalScore,
      distance_km: distanceKm,
      authorized: isAuthorized,
      pickup_available: hasPickup,
      material_compatible: isMaterialCompatible,
      address: recycler.address,
      contact_info: recycler.contactInfo,
      coordinates: {
        latitude: recycler.latitude,
        longitude: recycler.longitude
      },
      score_breakdown: {
        price_score: priceScore,
        distance_score: distanceScore,
        material_score: materialScore,
        authorization_score: authorizationScore,
        pickup_score: pickupScore
      }
    };
  });

  // 4. Sort strictly descending by match_score
  scoredRecyclers.sort((a, b) => b.match_score - a.match_score);

  const topResults = scoredRecyclers.slice(0, parseInt(limit, 10) || 10);

  return {
    lot: {
      id: lot.id,
      lotNumber: lot.lotNumber,
      material: lot.material.name,
      material_id: lot.material.id,
      weight: parseFloat(lot.weight.toString()),
      estimated_price: parseFloat(lot.estimatedPrice.toString()),
      collector_location: lot.collectorLocation
    },
    scoring_weights: {
      price: '30%',
      distance: '25%',
      material_compatibility: '20%',
      authorization: '15%',
      pickup_availability: '10%'
    },
    total_matches: scoredRecyclers.length,
    recommendations: topResults
  };
};

module.exports = {
  recommendRecyclersForLot,
  calculateHaversineDistance,
  calculateDistanceScore,
  calculatePriceScore
};
