const prisma = require('../config/db');
const { TransactionStatus } = require('@prisma/client');

/**
 * Compute the date boundaries for Today, This Week (starting Monday), and This Month
 */
function getDateBoundaries(referenceDate = new Date()) {
  const now = new Date(referenceDate);

  // 1. Start of Today (00:00:00.000 local)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // 2. Start of This Week (Monday 00:00:00.000)
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);

  // 3. Start of This Month (1st of month 00:00:00.000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  return {
    now,
    startOfToday,
    startOfWeek,
    startOfMonth
  };
}

/**
 * Retrieve and compute earnings analytics for an authenticated collector
 * Directly aggregated from completed transactions
 */
async function getCollectorEarnings(collectorId, user) {
  // Fetch all COMPLETED transactions for this collector
  const transactions = await prisma.transaction.findMany({
    where: {
      collectorId: collectorId,
      transactionStatus: TransactionStatus.COMPLETED
    },
    include: {
      lot: {
        include: { material: true }
      },
      handover: true,
      recycler: {
        select: { id: true, name: true }
      }
    },
    orderBy: {
      completedAt: 'desc'
    }
  });

  const { startOfToday, startOfWeek, startOfMonth } = getDateBoundaries();

  let todayEarnings = 0;
  let weekEarnings = 0;
  let monthEarnings = 0;
  let totalEarnings = 0;
  let totalWeightSold = 0;

  const materialMap = {};

  for (const tx of transactions) {
    const amount = parseFloat(tx.totalAmount || 0);

    // Prefer verified scale weight from handover if available; otherwise fallback to lot weight
    const weight = tx.handover && tx.handover.handoverWeight !== null && tx.handover.handoverWeight !== undefined
      ? parseFloat(tx.handover.handoverWeight)
      : (tx.lot ? parseFloat(tx.lot.weight) : 0);

    totalEarnings += amount;
    totalWeightSold += weight;

    // Determine completion date (use completedAt or fallback to updatedAt/createdAt)
    const completedDate = tx.completedAt ? new Date(tx.completedAt) : new Date(tx.updatedAt || tx.createdAt);

    if (completedDate >= startOfToday) {
      todayEarnings += amount;
    }
    if (completedDate >= startOfWeek) {
      weekEarnings += amount;
    }
    if (completedDate >= startOfMonth) {
      monthEarnings += amount;
    }

    // Material breakdown aggregation
    const materialName = tx.lot?.material?.name || 'Uncategorized E-Waste';
    if (!materialMap[materialName]) {
      materialMap[materialName] = {
        materialName,
        totalEarnings: 0,
        weightSoldKg: 0,
        transactionCount: 0
      };
    }
    materialMap[materialName].totalEarnings += amount;
    materialMap[materialName].weightSoldKg += weight;
    materialMap[materialName].transactionCount += 1;
  }

  const materialBreakdown = Object.values(materialMap).map(m => ({
    materialName: m.materialName,
    totalEarnings: parseFloat(m.totalEarnings.toFixed(2)),
    weightSoldKg: parseFloat(m.weightSoldKg.toFixed(2)),
    transactionCount: m.transactionCount
  }));

  const recentTransactions = transactions.slice(0, 5).map(tx => ({
    id: tx.id,
    lotNumber: tx.lot?.lotNumber || null,
    materialName: tx.lot?.material?.name || 'E-Waste',
    weightKg: tx.handover?.handoverWeight ? parseFloat(tx.handover.handoverWeight) : parseFloat(tx.lot?.weight || 0),
    totalAmount: parseFloat(tx.totalAmount || 0),
    recyclerName: tx.recycler?.name || 'Recycler',
    completedAt: tx.completedAt || tx.createdAt
  }));

  const completedCount = transactions.length;
  const averagePerTransaction = completedCount > 0
    ? parseFloat((totalEarnings / completedCount).toFixed(2))
    : 0;
  const averagePricePerKg = totalWeightSold > 0
    ? parseFloat((totalEarnings / totalWeightSold).toFixed(2))
    : 0;

  return {
    collector: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    currency: 'INR',
    summary: {
      todayEarnings: parseFloat(todayEarnings.toFixed(2)),
      thisWeekEarnings: parseFloat(weekEarnings.toFixed(2)),
      thisMonthEarnings: parseFloat(monthEarnings.toFixed(2)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      completedTransactionsCount: completedCount,
      totalWeightSoldKg: parseFloat(totalWeightSold.toFixed(2)),
      averageEarningPerTransaction: averagePerTransaction,
      averagePricePerKg: averagePricePerKg
    },
    materialBreakdown,
    recentTransactions
  };
}

module.exports = {
  getCollectorEarnings,
  getDateBoundaries
};
