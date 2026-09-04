const crypto = require('crypto');
const prisma = require('../config/db');
const { HandoverStatus, TransactionStatus, LotStatus, PaymentStatus, Role } = require('@prisma/client');

/**
 * Generate a cryptographically secure, readable QR handover identifier
 * Format: QR-KC-2026-XXXXXXXX
 */
function generateHandoverCode() {
  const randomSegment = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `QR-KC-2026-${randomSegment}`;
}

/**
 * Create a new handover QR record for an accepted transaction
 */
async function createHandover({ transactionId, location, user }) {
  // 1. Fetch transaction with related records
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      lot: {
        include: { material: true }
      },
      collector: {
        select: { id: true, name: true, email: true, phone: true }
      },
      recycler: {
        select: { id: true, name: true, address: true, contactInfo: true }
      },
      handover: true
    }
  });

  if (!transaction) {
    const error = new Error('Transaction not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Authorization check: Only owner collector or Admin can initiate handover
  if (user.role !== Role.ADMIN && transaction.collectorId !== user.id) {
    const error = new Error('Forbidden: Only the collector who owns this transaction (or an admin) can initiate handover QR code generation');
    error.statusCode = 403;
    throw error;
  }

  // 3. Transaction state validation
  const allowedStatuses = [
    TransactionStatus.ACCEPTED,
    TransactionStatus.PICKUP_SCHEDULED,
    TransactionStatus.IN_PROGRESS
  ];

  if (transaction.transactionStatus === TransactionStatus.PENDING) {
    const error = new Error('Cannot generate handover QR for a PENDING transaction. The recycler must accept the transaction first.');
    error.statusCode = 400;
    throw error;
  }

  if (transaction.transactionStatus === TransactionStatus.COMPLETED) {
    const error = new Error('Cannot generate handover QR for an already COMPLETED transaction.');
    error.statusCode = 400;
    throw error;
  }

  if (
    transaction.transactionStatus === TransactionStatus.CANCELLED ||
    transaction.transactionStatus === TransactionStatus.REJECTED
  ) {
    const error = new Error(`Cannot generate handover QR for a ${transaction.transactionStatus} transaction.`);
    error.statusCode = 400;
    throw error;
  }

  if (!allowedStatuses.includes(transaction.transactionStatus)) {
    const error = new Error(`Transaction is in an invalid status (${transaction.transactionStatus}) for handover creation.`);
    error.statusCode = 400;
    throw error;
  }

  // 4. Idempotency / Existing handover check
  if (transaction.handover) {
    if (
      transaction.handover.status === HandoverStatus.VERIFIED ||
      transaction.handover.status === HandoverStatus.COMPLETED
    ) {
      const error = new Error('Handover for this transaction has already been verified and completed.');
      error.statusCode = 400;
      throw error;
    }

    // If already exists and is PENDING, return existing active handover
    return {
      handover: transaction.handover,
      qrData: {
        code: transaction.handover.qrIdentifier,
        transactionId: transaction.id,
        collectorName: transaction.collector.name,
        recyclerName: transaction.recycler.name,
        material: transaction.lot.material.name,
        lotWeight: transaction.lot.weight,
        instruction: 'Display this code or QR to the authorized recycler upon physical material inspection'
      },
      isExisting: true
    };
  }

  // 5. Generate unique QR identifier
  let qrIdentifier;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    qrIdentifier = generateHandoverCode();
    const existing = await prisma.handover.findUnique({
      where: { qrIdentifier }
    });
    if (!existing) isUnique = true;
    attempts++;
  }

  if (!isUnique) {
    const error = new Error('Failed to generate a unique handover QR identifier. Please try again.');
    error.statusCode = 500;
    throw error;
  }

  // 6. Persist Handover record
  const handover = await prisma.handover.create({
    data: {
      transactionId: transaction.id,
      lotId: transaction.lotId,
      collectorId: transaction.collectorId,
      recyclerId: transaction.recyclerId,
      qrIdentifier,
      location: location || transaction.lot.collectorLocation || 'Collector Depot',
      status: HandoverStatus.PENDING
    },
    include: {
      lot: {
        select: { id: true, lotNumber: true, weight: true, material: true }
      },
      collector: {
        select: { id: true, name: true, phone: true }
      },
      recycler: {
        select: { id: true, name: true, address: true, contactInfo: true }
      }
    }
  });

  return {
    handover,
    qrData: {
      code: handover.qrIdentifier,
      transactionId: transaction.id,
      collectorName: transaction.collector.name,
      recyclerName: transaction.recycler.name,
      material: transaction.lot.material.name,
      lotWeight: transaction.lot.weight,
      instruction: 'Display this code or QR to the authorized recycler upon physical material inspection'
    },
    isExisting: false
  };
}

/**
 * Verify a handover QR code presented to a recycler
 */
async function verifyHandover({ code, verifiedWeight, verifiedMaterialId, notes, user }) {
  // 1. Handover existence check
  const handover = await prisma.handover.findUnique({
    where: { qrIdentifier: code },
    include: {
      transaction: true,
      lot: {
        include: { material: true }
      },
      recycler: true,
      collector: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  if (!handover) {
    const error = new Error('Invalid handover code. No handover record found for this identifier.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Transaction existence & completion check
  if (!handover.transaction) {
    const error = new Error('Associated transaction not found for this handover.');
    error.statusCode = 404;
    throw error;
  }

  if (handover.transaction.transactionStatus === TransactionStatus.COMPLETED) {
    const error = new Error('Transaction is already completed. Duplicate verification is rejected.');
    error.statusCode = 400;
    throw error;
  }

  if (
    handover.transaction.transactionStatus === TransactionStatus.CANCELLED ||
    handover.transaction.transactionStatus === TransactionStatus.REJECTED
  ) {
    const error = new Error(`Cannot verify handover for a ${handover.transaction.transactionStatus} transaction.`);
    error.statusCode = 400;
    throw error;
  }

  // 3. Prevent duplicate scan / verification
  if (
    handover.status === HandoverStatus.VERIFIED ||
    handover.status === HandoverStatus.COMPLETED
  ) {
    const error = new Error('Handover has already been verified and processed. Repeated scans are prevented.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Recycler authorization check
  if (user.role === Role.RECYCLER) {
    const recyclerProfile = await prisma.recycler.findUnique({
      where: { userId: user.id }
    });

    if (!recyclerProfile || recyclerProfile.id !== handover.recyclerId) {
      const error = new Error(
        `Forbidden: You are not the designated recycler for this handover. Only ${handover.recycler?.name || 'the assigned recycler'} can verify this handover.`
      );
      error.statusCode = 403;
      throw error;
    }
  } else if (user.role !== Role.ADMIN) {
    const error = new Error('Forbidden: Only authorized recyclers or central admins can verify physical handovers.');
    error.statusCode = 403;
    throw error;
  }

  // 5. Lot validity check
  if (!handover.lot) {
    const error = new Error('Associated e-waste lot is invalid or missing.');
    error.statusCode = 400;
    throw error;
  }

  // 6. Weight & Material verification
  const finalWeight = verifiedWeight !== undefined ? parseFloat(verifiedWeight) : parseFloat(handover.lot.weight);
  if (finalWeight <= 0) {
    const error = new Error('Verified weight must be a positive number greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  let finalMaterialId = handover.lot.materialId;
  if (verifiedMaterialId) {
    const mat = await prisma.material.findUnique({ where: { id: verifiedMaterialId } });
    if (!mat) {
      const error = new Error(`Verified material with ID '${verifiedMaterialId}' does not exist.`);
      error.statusCode = 400;
      throw error;
    }
    finalMaterialId = mat.id;
  }

  // Calculate final total amount based on verified weight & agreed price per kg
  const offeredPrice = parseFloat(handover.transaction.offeredPrice);
  const finalTotalAmount = parseFloat((finalWeight * offeredPrice).toFixed(2));
  const verificationTime = new Date();

  // 7. Update Handover, Transaction, and Lot atomically / sequentially
  const updatedHandover = await prisma.handover.update({
    where: { id: handover.id },
    data: {
      status: HandoverStatus.VERIFIED,
      handoverWeight: finalWeight,
      verifiedMaterialId: finalMaterialId,
      notes: notes || null,
      pickupTime: verificationTime
    },
    include: {
      lot: {
        select: { id: true, lotNumber: true, weight: true }
      },
      collector: {
        select: { id: true, name: true, phone: true }
      },
      recycler: {
        select: { id: true, name: true, address: true }
      },
      verifiedMaterial: {
        select: { id: true, name: true, unit: true }
      }
    }
  });

  const updatedTransaction = await prisma.transaction.update({
    where: { id: handover.transactionId },
    data: {
      transactionStatus: TransactionStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      finalPrice: offeredPrice,
      totalAmount: finalTotalAmount,
      completedAt: verificationTime
    }
  });

  const updatedLot = await prisma.lot.update({
    where: { id: handover.lotId },
    data: {
      status: LotStatus.COMPLETED
    }
  });

  // 8. Return comprehensive audit trail
  return {
    verified: true,
    message: 'Handover successfully verified and transaction completed.',
    auditTrail: {
      handoverId: updatedHandover.id,
      qrIdentifier: updatedHandover.qrIdentifier,
      handoverStatus: updatedHandover.status,
      pickupTime: updatedHandover.pickupTime,
      verifiedWeight: finalWeight,
      verifiedMaterial: updatedHandover.verifiedMaterial,
      notes: updatedHandover.notes,
      transaction: {
        id: updatedTransaction.id,
        transactionStatus: updatedTransaction.transactionStatus,
        paymentStatus: updatedTransaction.paymentStatus,
        offeredPrice: parseFloat(updatedTransaction.offeredPrice),
        finalPrice: parseFloat(updatedTransaction.finalPrice),
        totalAmount: parseFloat(updatedTransaction.totalAmount),
        completedAt: updatedTransaction.completedAt
      },
      lot: {
        id: updatedLot.id,
        lotNumber: handover.lot.lotNumber,
        status: updatedLot.status
      },
      collector: updatedHandover.collector,
      recycler: updatedHandover.recycler
    }
  };
}

/**
 * Retrieve handover details by ID or QR Identifier
 */
async function getHandoverById({ id, user }) {
  const handover = await prisma.handover.findFirst({
    where: {
      OR: [
        { id: id },
        { qrIdentifier: id }
      ]
    },
    include: {
      transaction: true,
      lot: {
        include: { material: true }
      },
      collector: {
        select: { id: true, name: true, email: true, phone: true }
      },
      recycler: {
        select: { id: true, userId: true, name: true, address: true, contactInfo: true }
      },
      verifiedMaterial: true
    }
  });

  if (!handover) {
    const error = new Error('Handover record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check
  if (user.role !== Role.ADMIN) {
    const isCollectorParticipant = user.role === Role.COLLECTOR && handover.collectorId === user.id;
    const isRecyclerParticipant = user.role === Role.RECYCLER && handover.recycler.userId === user.id;

    if (!isCollectorParticipant && !isRecyclerParticipant) {
      const error = new Error('Forbidden: You are not authorized to view this handover record.');
      error.statusCode = 403;
      throw error;
    }
  }

  return handover;
}

module.exports = {
  createHandover,
  verifyHandover,
  getHandoverById,
  generateHandoverCode
};
