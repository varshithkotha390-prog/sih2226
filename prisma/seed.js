const { PrismaClient, Role, LotStatus, TransactionStatus, PaymentStatus, HandoverStatus } = require('@prisma/client');

const prisma = new PrismaClient();

// Standard bcrypt hash for "Password@123"
const DEFAULT_PASSWORD_HASH = '$2b$10$mO0bSg1kGzJq8lV3o9cWveiVdFjP3R0J2K5L7N9Q1S3U5W7Y9a.2K';

async function main() {
  console.log('🌱 Starting database seeding for Kabadiwala Connect (SIH26229)...');

  // ---------------------------------------------------------------------------
  // 0. Clean Existing Data (Reverse Dependency Order)
  // ---------------------------------------------------------------------------
  console.log('🧹 Cleaning existing tables...');
  await prisma.handover.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.price.deleteMany();
  await prisma.recycler.deleteMany();
  await prisma.material.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------------
  // 1. Create Admin and Collector Users
  // ---------------------------------------------------------------------------
  console.log('👤 Creating Admin & Collector users...');
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Central Admin',
      email: 'admin@kabadiwala.demo',
      phone: '+919800000001',
      passwordHash: DEFAULT_PASSWORD_HASH,
      role: Role.ADMIN
    }
  });

  const collectorRawData = [
    { name: 'Ramesh Kumar', email: 'ramesh.collector@kconnect.demo', phone: '+919811001001' },
    { name: 'Suresh Verma', email: 'suresh.collector@kconnect.demo', phone: '+919811001002' },
    { name: 'Anita Devi', email: 'anita.collector@kconnect.demo', phone: '+919811001003' },
    { name: 'Mohammad Arif', email: 'arif.collector@kconnect.demo', phone: '+919811001004' },
    { name: 'Vikram Singh', email: 'vikram.collector@kconnect.demo', phone: '+919811001005' },
    { name: 'Pooja Sharma', email: 'pooja.collector@kconnect.demo', phone: '+919811001006' }
  ];

  const collectors = [];
  for (const c of collectorRawData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: DEFAULT_PASSWORD_HASH,
        role: Role.COLLECTOR
      }
    });
    collectors.push(user);
  }

  // ---------------------------------------------------------------------------
  // 2. Create Recyclers (Users + Recycler Profiles) in Delhi NCR
  // ---------------------------------------------------------------------------
  console.log('🏭 Creating 25 Recyclers with geolocations and authorization profiles...');

  const recyclerSpecs = [
    { name: 'EcoGreen E-Waste Recyclers Pvt Ltd', address: 'Plot 42, Mayapuri Industrial Area Phase 1, New Delhi', lat: 28.6342, lng: 77.1265, auth: true, authId: 'CPCB/EW-REG/DL/2024/001', pickup: true, phone: '+91-11-25910001' },
    { name: 'Bharat Metal & Electronic Dismantlers', address: 'B-12, Mayapuri Phase 2, New Delhi', lat: 28.6385, lng: 77.1298, auth: true, authId: 'CPCB/EW-REG/DL/2024/002', pickup: true, phone: '+91-11-25910002' },
    { name: 'Mayapuri Circular Solutions', address: 'C-78, Mayapuri Phase 1, New Delhi', lat: 28.6310, lng: 77.1220, auth: false, authId: null, pickup: false, phone: '+91-11-25910003' },
    { name: 'GreenEarth Recovery Technologies', address: 'F-14, Okhla Industrial Area Phase 1, New Delhi', lat: 28.5355, lng: 77.2732, auth: true, authId: 'CPCB/EW-REG/DL/2024/004', pickup: true, phone: '+91-11-26810004' },
    { name: 'Apex Precious Metals Extraction', address: 'D-89, Okhla Industrial Area Phase 2, New Delhi', lat: 28.5280, lng: 77.2790, auth: true, authId: 'CPCB/EW-REG/DL/2024/005', pickup: false, phone: '+91-11-26810005' },
    { name: 'Capital Scrap & Electronic Hub', address: 'A-23, Okhla Phase 3, New Delhi', lat: 28.5410, lng: 77.2680, auth: false, authId: null, pickup: true, phone: '+91-11-26810006' },
    { name: 'Shree Balaji E-Cycle Enterprises', address: 'G-5, Anand Parbat Industrial Area, New Delhi', lat: 28.6650, lng: 77.1650, auth: true, authId: 'CPCB/EW-REG/DL/2024/007', pickup: true, phone: '+91-11-28750007' },
    { name: 'Wazirpur Electronic Scrap Processors', address: 'Plot 101, Wazirpur Industrial Area, New Delhi', lat: 28.6980, lng: 77.1680, auth: true, authId: 'CPCB/EW-REG/DL/2024/008', pickup: false, phone: '+91-11-27370008' },
    { name: 'North Delhi Copper & Board Works', address: 'Plot 19, Wazirpur Industrial Area, New Delhi', lat: 28.7015, lng: 77.1720, auth: false, authId: null, pickup: false, phone: '+91-11-27370009' },
    { name: 'East Delhi E-Waste Aggregators', address: 'Plot 55, Patparganj Industrial Area, Delhi', lat: 28.6300, lng: 77.3050, auth: true, authId: 'CPCB/EW-REG/DL/2024/010', pickup: true, phone: '+91-11-22140010' },
    { name: 'Yamuna Green Technologies', address: 'Shed 12, Patparganj Industrial Estate, Delhi', lat: 28.6275, lng: 77.3090, auth: false, authId: null, pickup: true, phone: '+91-11-22140011' },
    { name: 'South Delhi EcoProcessors', address: 'B-34, Mohan Cooperative Industrial Estate, Mathura Road, Delhi', lat: 28.5080, lng: 77.3020, auth: true, authId: 'CPCB/EW-REG/DL/2024/012', pickup: true, phone: '+91-11-26950012' },
    { name: 'Noida Green Loop Recyclers', address: 'B-16, Sector 8, Noida, Uttar Pradesh', lat: 28.5990, lng: 77.3150, auth: true, authId: 'UPPCB/EW-REG/NO/2024/013', pickup: true, phone: '+91-120-2420013' },
    { name: 'TechRecycle Noida Hub', address: 'C-45, Sector 63, Noida, Uttar Pradesh', lat: 28.6280, lng: 77.3800, auth: true, authId: 'UPPCB/EW-REG/NO/2024/014', pickup: true, phone: '+91-120-2420014' },
    { name: 'Greater Noida Sustainable Recycling', address: 'Plot 88, Ecotech 3, Greater Noida, UP', lat: 28.4700, lng: 77.5100, auth: true, authId: 'UPPCB/EW-REG/GN/2024/015', pickup: false, phone: '+91-120-2560015' },
    { name: 'Sahibabad Metal & Battery Extractors', address: 'Site 4, Sahibabad Industrial Area, Ghaziabad, UP', lat: 28.6700, lng: 77.3700, auth: true, authId: 'UPPCB/EW-REG/GZ/2024/016', pickup: true, phone: '+91-120-2890016' },
    { name: 'Ghaziabad Local Scrap Traders', address: 'Loni Road Industrial Belt, Ghaziabad, UP', lat: 28.7120, lng: 77.2950, auth: false, authId: null, pickup: false, phone: '+91-120-2890017' },
    { name: 'CyberCity E-Waste Solutions', address: 'Plot 210, Udyog Vihar Phase 1, Gurugram, Haryana', lat: 28.5050, lng: 77.0850, auth: true, authId: 'HSPCB/EW-REG/GG/2024/018', pickup: true, phone: '+91-124-4110018' },
    { name: 'Millennium City Circuit Dismantlers', address: 'Plot 76, Udyog Vihar Phase 4, Gurugram, Haryana', lat: 28.4980, lng: 77.0780, auth: true, authId: 'HSPCB/EW-REG/GG/2024/019', pickup: false, phone: '+91-124-4110019' },
    { name: 'Manesar Heavy Electronics Recycling', address: 'Sector 8, IMT Manesar, Gurugram, Haryana', lat: 28.3600, lng: 76.9300, auth: true, authId: 'HSPCB/EW-REG/MN/2024/020', pickup: true, phone: '+91-124-2290020' },
    { name: 'Aravalli Eco Recovery Park', address: 'Plot 14, Sector 7, IMT Manesar, Haryana', lat: 28.3540, lng: 76.9250, auth: false, authId: null, pickup: false, phone: '+91-124-2290021' },
    { name: 'Faridabad Industrial Metal Recovery', address: 'Plot 33, Sector 24 Industrial Area, Faridabad, Haryana', lat: 28.4089, lng: 77.3178, auth: true, authId: 'HSPCB/EW-REG/FB/2024/022', pickup: true, phone: '+91-129-2230022' },
    { name: 'Bata Morh Electronics Processing', address: 'Sector 15, Faridabad, Haryana', lat: 28.3950, lng: 77.3110, auth: false, authId: null, pickup: true, phone: '+91-129-2230023' },
    { name: 'Kapashera Dismantling Co', address: 'Near Border Toll, Kapashera, Delhi', lat: 28.5210, lng: 77.0870, auth: false, authId: null, pickup: false, phone: '+91-11-25060024' },
    { name: 'National Capital Circular E-Metals', address: 'Jahangirpuri Industrial Area, Delhi', lat: 28.7290, lng: 77.1650, auth: true, authId: 'CPCB/EW-REG/DL/2024/025', pickup: true, phone: '+91-11-27630025' }
  ];

  const recyclers = [];
  for (let i = 0; i < recyclerSpecs.length; i++) {
    const spec = recyclerSpecs[i];
    const user = await prisma.user.create({
      data: {
        name: spec.name,
        email: `recycler${i + 1}@kconnect.demo`,
        phone: `+91982200${(i + 1).toString().padStart(4, '0')}`,
        passwordHash: DEFAULT_PASSWORD_HASH,
        role: Role.RECYCLER,
        recyclerProfile: {
          create: {
            name: spec.name,
            address: spec.address,
            latitude: spec.lat,
            longitude: spec.lng,
            authorizedStatus: spec.auth,
            authorizationId: spec.authId,
            pickupAvailable: spec.pickup,
            contactInfo: `${spec.phone} | ${spec.name.toLowerCase().replace(/\s+/g, '')}@kconnect.demo`
          }
        }
      },
      include: {
        recyclerProfile: true
      }
    });
    recyclers.push(user.recyclerProfile);
  }

  // ---------------------------------------------------------------------------
  // 3. Create 12 E-Waste Materials
  // ---------------------------------------------------------------------------
  console.log('📦 Creating 12 E-Waste Material catalog items...');

  const materialCatalog = [
    { name: 'PCB Grade A (Motherboards & Servers)', code: 'MAT-PCB-A', unit: 'kg', description: 'High-grade printed circuit boards from computers, servers, and telecommunications containing gold/palladium contacts.' },
    { name: 'PCB Grade B (Consumer Electronics)', code: 'MAT-PCB-B', unit: 'kg', description: 'Single-sided circuit boards from TVs, radios, home appliances, and toys.' },
    { name: 'Copper Wiring & Heavy Cables', code: 'MAT-COP-W', unit: 'kg', description: 'Stripped and insulated high-purity copper harness cables and transformer windings.' },
    { name: 'Lithium-Ion Battery Packs', code: 'MAT-LIO-B', unit: 'kg', description: 'Rechargeable Li-ion batteries from laptops, power banks, and electric two-wheelers.' },
    { name: 'Lead-Acid Batteries (SMF/UPS)', code: 'MAT-LED-A', unit: 'kg', description: 'Sealed Maintenance Free lead-acid batteries from computer UPS and automotive systems.' },
    { name: 'RAM Memory Modules', code: 'MAT-RAM-M', unit: 'kg', description: 'DDR3, DDR4, and server RAM sticks with gold-plated contact fingers.' },
    { name: 'CPU Processors (Ceramic & Fiber)', code: 'MAT-CPU-P', unit: 'kg', description: 'High-value ceramic, fiber, and slot computer CPUs rich in precious metals.' },
    { name: 'Hard Disk Drives (HDD)', code: 'MAT-HDD-D', unit: 'kg', description: 'Whole hard disk drives with aluminum cases, neodymium actuator magnets, and controller PCBs.' },
    { name: 'SMPS Computer Power Supplies', code: 'MAT-SMP-S', unit: 'kg', description: 'Switched-mode power supply units containing transformers, aluminum heat sinks, and wiring.' },
    { name: 'Telecom & Network Switch Boards', code: 'MAT-TEL-B', unit: 'kg', description: 'Dense multi-layer base station, router, and exchange telecommunication boards.' },
    { name: 'CRT Glass & Monitor Enclosures', code: 'MAT-CRT-M', unit: 'kg', description: 'Cathode ray tubes from vintage monitors containing leaded glass funnels.' },
    { name: 'LCD / LED Display Panels', code: 'MAT-DIS-S', unit: 'kg', description: 'Flat screens from cracked monitors, laptops, and televisions with backlighting strips.' }
  ];

  const materials = [];
  for (const m of materialCatalog) {
    const mat = await prisma.material.create({
      data: m
    });
    materials.push(mat);
  }

  // ---------------------------------------------------------------------------
  // 4. Create 120+ Historical Price Records
  // ---------------------------------------------------------------------------
  console.log('📈 Generating 120+ historical price records across materials, dates & hubs...');

  // Base benchmarks per material [min, max]
  const priceBenchmarks = {
    'MAT-PCB-A': { min: 480, max: 620 },
    'MAT-PCB-B': { min: 130, max: 190 },
    'MAT-COP-W': { min: 690, max: 810 },
    'MAT-LIO-B': { min: 280, max: 370 },
    'MAT-LED-A': { min: 85, max: 110 },
    'MAT-RAM-M': { min: 1250, max: 1600 },
    'MAT-CPU-P': { min: 1900, max: 2600 },
    'MAT-HDD-D': { min: 190, max: 255 },
    'MAT-SMP-S': { min: 55, max: 80 },
    'MAT-TEL-B': { min: 580, max: 740 },
    'MAT-CRT-M': { min: 18, max: 32 },
    'MAT-DIS-S': { min: 45, max: 75 }
  };

  const locations = ['Delhi NCR - Mayapuri Hub', 'Delhi NCR - Okhla Zone', 'Noida - Sector 63 Hub', 'Gurugram - Udyog Vihar'];
  const sources = ['CPCB Official Benchmark', 'Mayapuri Scrap Association Rate', 'Delhi Recycling Board Index', 'National E-Waste MSP'];

  // 4 date checkpoints over the past year (Quarterly historical pricing)
  const priceDates = [
    { from: new Date('2025-06-01T00:00:00Z'), to: new Date('2025-08-31T23:59:59Z') },
    { from: new Date('2025-09-01T00:00:00Z'), to: new Date('2025-11-30T23:59:59Z') },
    { from: new Date('2025-12-01T00:00:00Z'), to: new Date('2026-02-28T23:59:59Z') },
    { from: new Date('2026-03-01T00:00:00Z'), to: null } // Active spot price
  ];

  let priceRecordsCount = 0;
  for (const mat of materials) {
    const range = priceBenchmarks[mat.code] || { min: 100, max: 200 };

    for (let periodIdx = 0; periodIdx < priceDates.length; periodIdx++) {
      const period = priceDates[periodIdx];

      for (let locIdx = 0; locIdx < locations.length; locIdx++) {
        // Slight variation based on location and quarter
        const variance = (periodIdx * 5.0) + (locIdx * 2.5);
        const calcPrice = (range.min + ((range.max - range.min) * ((locIdx + 1) / (locations.length + 1))) + variance).toFixed(2);

        await prisma.price.create({
          data: {
            materialId: mat.id,
            pricePerKg: parseFloat(calcPrice),
            location: locations[locIdx],
            source: sources[(locIdx + periodIdx) % sources.length],
            validFrom: period.from,
            validTo: period.to
          }
        });
        priceRecordsCount++;
      }
    }
  }
  console.log(`✓ Inserted ${priceRecordsCount} historical price records.`);

  // ---------------------------------------------------------------------------
  // 5. Create 50+ E-Waste Lots
  // ---------------------------------------------------------------------------
  console.log('📦 Creating 55 realistic e-waste lots by collectors...');

  const collectorAddresses = [
    'Seelampur E-Waste Mandi, Ward 5, Delhi',
    'Kapashera Aggregation Point, Delhi',
    'Mustafabad Collection Depot, North East Delhi',
    'Karol Bagh Electronics Hub, Delhi',
    'Shahdara Aggregator Yard, Delhi',
    'Nangloi Industrial Buffer Store, Delhi'
  ];

  const lots = [];
  const lotWeights = [15.5, 25.0, 45.0, 60.5, 85.0, 110.0, 150.0, 220.5, 340.0, 500.0, 750.0];

  for (let i = 0; i < 55; i++) {
    const collector = collectors[i % collectors.length];
    const material = materials[i % materials.length];
    const weight = lotWeights[i % lotWeights.length];
    const range = priceBenchmarks[material.code] || { min: 100, max: 200 };
    const avgRate = (range.min + range.max) / 2;
    const estimatedPrice = (weight * avgRate).toFixed(2);

    let status = LotStatus.AVAILABLE;
    if (i % 6 === 1) status = LotStatus.ASSIGNED;
    else if (i % 6 === 2) status = LotStatus.IN_TRANSIT;
    else if (i % 6 === 3 || i % 6 === 4) status = LotStatus.COMPLETED;
    else if (i % 6 === 5) status = LotStatus.CANCELLED;

    const lot = await prisma.lot.create({
      data: {
        collectorId: collector.id,
        materialId: material.id,
        weight: weight,
        estimatedPrice: parseFloat(estimatedPrice),
        status: status,
        imageUrl: `https://storage.kabadiwalaconnect.demo/lots/lot-${i + 1}.jpg`,
        collectorLocation: collectorAddresses[i % collectorAddresses.length],
        createdAt: new Date(Date.now() - (55 - i) * 86400000 * 2) // staggered over past 110 days
      }
    });
    lots.push(lot);
  }

  // ---------------------------------------------------------------------------
  // 6. Create 100+ Transactions & 7. Handover records for completed ones
  // ---------------------------------------------------------------------------
  console.log('🤝 Creating 105 realistic transactions across multiple statuses...');

  let txCount = 0;
  let handoverCount = 0;

  // We loop through lots and generate negotiations/bids/deals
  for (let i = 0; i < 105; i++) {
    const lot = lots[i % lots.length];
    const recycler = recyclers[(i * 3 + 1) % recyclers.length];
    const collectorId = lot.collectorId;

    const weightNum = parseFloat(lot.weight.toString());
    const estPriceNum = parseFloat(lot.estimatedPrice.toString());
    const baseUnitRate = estPriceNum / weightNum;

    // Offered price: slight deviation from estimated rate
    const offeredRate = (baseUnitRate * (0.95 + ((i % 10) * 0.01))).toFixed(2);
    let finalRate = null;
    let totalAmount = null;
    let txStatus = TransactionStatus.PENDING;
    let payStatus = PaymentStatus.PENDING;
    let completedAt = null;

    // Distribute transaction statuses
    const mod = i % 8;
    if (mod === 0) {
      txStatus = TransactionStatus.PENDING;
      payStatus = PaymentStatus.PENDING;
    } else if (mod === 1) {
      txStatus = TransactionStatus.REJECTED;
      payStatus = PaymentStatus.FAILED;
    } else if (mod === 2) {
      txStatus = TransactionStatus.CANCELLED;
      payStatus = PaymentStatus.PENDING;
    } else if (mod === 3) {
      txStatus = TransactionStatus.ACCEPTED;
      payStatus = PaymentStatus.ESCROWED;
      finalRate = (parseFloat(offeredRate) * 1.02).toFixed(2);
      totalAmount = (parseFloat(finalRate) * weightNum).toFixed(2);
    } else if (mod === 4) {
      txStatus = TransactionStatus.IN_PROGRESS;
      payStatus = PaymentStatus.ESCROWED;
      finalRate = (parseFloat(offeredRate) * 1.01).toFixed(2);
      totalAmount = (parseFloat(finalRate) * weightNum).toFixed(2);
    } else {
      // mod 5, 6, 7: COMPLETED transactions
      txStatus = TransactionStatus.COMPLETED;
      payStatus = PaymentStatus.PAID;
      finalRate = offeredRate;
      totalAmount = (parseFloat(finalRate) * weightNum).toFixed(2);
      completedAt = new Date(Date.now() - (105 - i) * 86400000);
    }

    const tx = await prisma.transaction.create({
      data: {
        lotId: lot.id,
        collectorId: collectorId,
        recyclerId: recycler.id,
        offeredPrice: parseFloat(offeredRate),
        finalPrice: finalRate ? parseFloat(finalRate) : null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : null,
        paymentStatus: payStatus,
        transactionStatus: txStatus,
        createdAt: new Date(Date.now() - (120 - i) * 86400000),
        completedAt: completedAt
      }
    });
    txCount++;

    // -------------------------------------------------------------------------
    // Create Handover for COMPLETED and IN_PROGRESS transactions
    // -------------------------------------------------------------------------
    if (txStatus === TransactionStatus.COMPLETED || txStatus === TransactionStatus.IN_PROGRESS) {
      const isCompleted = txStatus === TransactionStatus.COMPLETED;
      const actualHandoverWeight = (weightNum * (0.98 + (i % 5) * 0.01)).toFixed(2); // verified scale reading
      const qrCode = `QR-KC-2026-${(i + 1).toString().padStart(5, '0')}`;

      await prisma.handover.create({
        data: {
          lotId: lot.id,
          transactionId: tx.id,
          collectorId: collectorId,
          recyclerId: recycler.id,
          qrIdentifier: qrCode,
          handoverWeight: isCompleted ? parseFloat(actualHandoverWeight) : null,
          verifiedMaterialId: isCompleted ? lot.materialId : null,
          pickupTime: isCompleted ? completedAt : null,
          location: lot.collectorLocation,
          status: isCompleted ? HandoverStatus.COMPLETED : HandoverStatus.PENDING,
          createdAt: tx.createdAt
        }
      });
      handoverCount++;
    }
  }
  console.log(`✓ Inserted ${txCount} transactions.`);
  console.log(`✓ Inserted ${handoverCount} QR handover records.`);

  // ---------------------------------------------------------------------------
  // Summary & Verification
  // ---------------------------------------------------------------------------
  const [userCount, materialCount, priceCount, recyclerCount, lotCount, totalTransactions, totalHandovers] = await Promise.all([
    prisma.user.count(),
    prisma.material.count(),
    prisma.price.count(),
    prisma.recycler.count(),
    prisma.lot.count(),
    prisma.transaction.count(),
    prisma.handover.count()
  ]);

  console.log('\n=============================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('=============================================');
  console.log(`Total Users:        ${userCount} (1 Admin, ${collectors.length} Collectors, ${recyclerSpecs.length} Recyclers)`);
  console.log(`Total Recyclers:    ${recyclerCount}`);
  console.log(`Total Materials:    ${materialCount}`);
  console.log(`Total Prices:       ${priceCount}`);
  console.log(`Total Lots:         ${lotCount}`);
  console.log(`Total Transactions: ${totalTransactions}`);
  console.log(`Total Handovers:    ${totalHandovers}`);
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
