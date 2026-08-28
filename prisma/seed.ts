import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.ticketScan.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.seatHold.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.eventZone.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.event.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blockedIp.deleteMany();

  // Roles
  const roleCustomer = await prisma.role.create({ data: { name: 'customer' } });
  const roleAdmin = await prisma.role.create({ data: { name: 'admin' } });
  const roleSuperAdmin = await prisma.role.create({ data: { name: 'super_admin' } });

  // Password Hash
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Support',
      email: 'admin@concert.com',
      phone: '0812345678',
      nationality: 'THAI',
      passwordHash,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      faceVerifiedAt: new Date(),
      userRoles: {
        create: [{ roleId: roleAdmin.id }, { roleId: roleSuperAdmin.id }],
      },
    },
  });

  // Customer Users
  const customers = [];
  const customerNames = [
    { first: 'สมชาย', last: 'ใจดี', email: 'somchai@gmail.com', phone: '0891112222' },
    { first: 'วิภา', last: 'สุขเจริญ', email: 'wipa@gmail.com', phone: '0892223333' },
    { first: 'ณัฐพงษ์', last: 'วงศ์สว่าง', email: 'nattapong@gmail.com', phone: '0893334444' },
    { first: 'กานต์', last: 'เจริญทรัพย์', email: 'karn@gmail.com', phone: '0894445555' },
    { first: 'ปรียา', last: 'อัครเดช', email: 'preeya@gmail.com', phone: '0895556666' },
    { first: 'ธนกฤต', last: 'มีสุข', email: 'thanakrit@gmail.com', phone: '0896667777' },
    { first: 'ชลธิชา', last: 'มณีรัตน์', email: 'chonthicha@gmail.com', phone: '0897778888' },
    { first: 'อนุชา', last: 'มิ่งขวัญ', email: 'anucha@gmail.com', phone: '0898889999' },
    { first: 'ศิริพร', last: 'ทองไทย', email: 'siriporn@gmail.com', phone: '0899990000' },
    { first: 'ภานุพงศ์', last: 'ศรีอรุณ', email: 'panupong@gmail.com', phone: '0890001111' },
    { first: 'วรรณิภา', last: 'เกียรติวงศ์', email: 'wannipa@gmail.com', phone: '0891113333' },
  ];

  for (const c of customerNames) {
    const user = await prisma.user.create({
      data: {
        firstName: c.first,
        lastName: c.last,
        email: c.email,
        phone: c.phone,
        nationality: 'THAI',
        passwordHash: customerPasswordHash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        faceVerifiedAt: new Date(),
        userRoles: { create: [{ roleId: roleCustomer.id }] },
      },
    });
    customers.push(user);
  }

  // Promotions
  const promoSummer = await prisma.promotion.create({
    data: {
      code: 'SUMMER10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 500,
      timesUsed: 42,
      status: true,
    },
  });

  // Concert Events
  const concertsData = [
    {
      name: 'World Tour Live in Bangkok 2026',
      artist: 'Global Superstar Band',
      description: 'คอนเสิร์ตใหญ่ระดับโลกที่จะสร้างความประทับใจไม่รู้ลืม พร้อมเอฟเฟกต์สุดตระการตาและเพลงฮิตติดชาร์ต',
      venue: 'Impact Arena, Muang Thong Thani',
      eventDate: new Date('2026-10-15T19:00:00Z'),
      startTime: '19:00',
      endTime: '22:00',
      posterUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
      status: 'ON_SALE',
      capacity: 5000,
    },
    {
      name: 'Summer Music Festival 2026',
      artist: 'Various Artists',
      description: 'เทศกาลดนตรีฤดูร้อนสุดมันส์ รวมศิลปินแนวหน้าระดับประเทศกว่า 20 วง ตลอด 2 วันเต็ม',
      venue: 'BITEC Bangna Hall 98-99',
      eventDate: new Date('2026-11-20T16:00:00Z'),
      startTime: '16:00',
      endTime: '23:30',
      posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      status: 'ON_SALE',
      capacity: 3500,
    },
    {
      name: 'Acoustic Unplugged Night',
      artist: 'The Chillers',
      description: 'ค่ำคืนเพลงอะคูสติกสุดอบอุ่น บรรยากาศสุดโรแมนติก พร้อมแขกรับเชิญพิเศษ',
      venue: 'Siam Pavalai Royal Grand Theatre',
      eventDate: new Date('2026-12-05T18:30:00Z'),
      startTime: '18:30',
      endTime: '21:00',
      posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      status: 'UPCOMING',
      capacity: 1200,
    },
    {
      name: 'EDM Revolution Bangkok 2026',
      artist: 'DJ Pulse & Friends',
      description: 'งานปาร์ตี้ดนตรีอิเล็กทรอนิกส์เต้นมันส์สุดเหวี่ยง พร้อมเวที แสง สี เสียง ระดับเฟสติวัลโลก',
      venue: 'Live Park Rama 9',
      eventDate: new Date('2026-12-31T20:00:00Z'),
      startTime: '20:00',
      endTime: '03:00',
      posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      status: 'UPCOMING',
      capacity: 8000,
    },
    {
      name: 'Rock Legend Reunion Concert',
      artist: 'The Thunder Rock',
      description: 'การกลับมาเจอกันอีกครั้งของตำนานวงร็อก รวบรวมเพลงฮิตยุค 90s และ 2000s ที่ทุกคนคิดถึง',
      venue: 'Thunder Dome, Muang Thong Thani',
      eventDate: new Date('2026-09-25T19:00:00Z'),
      startTime: '19:00',
      endTime: '22:30',
      posterUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
      status: 'ON_SALE',
      capacity: 4000,
    },
    {
      name: 'K-Pop Super Concert in Thailand',
      artist: 'Star Idol Group',
      description: 'คอนเสิร์ตใหญ่เต็มรูปแบบของไอดอลชื่อดัง พร้อมโชว์เดี่ยวและโชว์พิเศษส่งตรงจากเกาหลี',
      venue: 'Rajamangala National Stadium',
      eventDate: new Date('2027-01-15T18:00:00Z'),
      startTime: '18:00',
      endTime: '21:30',
      posterUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
      status: 'UPCOMING',
      capacity: 15000,
    },
  ];

  const createdConcerts = [];
  for (const cData of concertsData) {
    const event = await prisma.event.create({ data: cData });
    createdConcerts.push(event);

    const zoneA = await prisma.eventZone.create({
      data: {
        eventId: event.id,
        name: 'Zone A (VIP)',
        price: 4500,
        capacity: 40,
        rowPattern: 'A-B',
        seatPattern: '1-20',
      },
    });

    const zoneB = await prisma.eventZone.create({
      data: {
        eventId: event.id,
        name: 'Zone B (Regular)',
        price: 2500,
        capacity: 60,
        rowPattern: 'C-E',
        seatPattern: '1-20',
      },
    });

    const rowsA = ['A', 'B'];
    for (const r of rowsA) {
      for (let i = 1; i <= 20; i++) {
        const sNum = `${r}${i < 10 ? '0' + i : i}`;
        await prisma.seat.create({
          data: {
            zoneId: zoneA.id,
            seatNumber: sNum,
            rowName: r,
            seatIndex: i,
            status: 'AVAILABLE',
          },
        });
      }
    }

    const rowsB = ['C', 'D', 'E'];
    for (const r of rowsB) {
      for (let i = 1; i <= 20; i++) {
        const sNum = `${r}${i < 10 ? '0' + i : i}`;
        await prisma.seat.create({
          data: {
            zoneId: zoneB.id,
            seatNumber: sNum,
            rowName: r,
            seatIndex: i,
            status: 'AVAILABLE',
          },
        });
      }
    }
  }

  const firstConcert = createdConcerts[0];
  const eventZones = await prisma.eventZone.findMany({ where: { eventId: firstConcert.id } });
  const zoneASeats = await prisma.seat.findMany({ where: { zoneId: eventZones[0].id } });

  for (let idx = 0; idx < 10; idx++) {
    const seat = zoneASeats[idx];
    const customer = customers[idx % customers.length];

    await prisma.seat.update({
      where: { id: seat.id },
      data: { status: 'SOLD' },
    });

    await prisma.booking.create({
      data: {
        bookingNumber: `BK2026${1000 + idx}`,
        userId: customer.id,
        eventId: firstConcert.id,
        promotionId: promoSummer.id,
        totalAmount: 4500,
        discountAmount: 450,
        finalAmount: 4050,
        status: 'PAID',
        createdAt: new Date(),
        bookingItems: {
          create: [{ seatId: seat.id, price: 4500 }],
        },
        payments: {
          create: [
            {
              paymentMethod: 'PROMPTPAY',
              amount: 4050,
              status: 'SUCCESS',
              transactionId: `TXN2026${8000 + idx}`,
              qrPayload: '00020101021229370016A000000677010111011300668911122225802TH5303764540440505908Concert6304',
            },
          ],
        },
        tickets: {
          create: [
            {
              ticketCode: `TKT-${firstConcert.id.slice(0, 4)}-${seat.seatNumber}`,
              seatId: seat.id,
              userId: customer.id,
              qrData: JSON.stringify({ ticketCode: `TKT-${seat.seatNumber}`, event: firstConcert.name, seat: seat.seatNumber }),
              barcode: `8859012${10000 + idx}`,
              status: 'ISSUED',
            },
          ],
        },
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: 'CREATE_CONCERT',
      resource: 'Event',
      resourceId: firstConcert.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      payloadJson: JSON.stringify({ concertName: firstConcert.name }),
    },
  });

  await prisma.securityEvent.create({
    data: {
      ipAddress: '103.22.180.45',
      eventType: 'RATE_LIMIT_EXCEEDED',
      reason: 'Rate Limit Exceeded (500 TPS Burst)',
      userAgent: 'HeadlessChrome/120.0.0.0',
      endpoint: '/api/bookings/hold',
    },
  });

  await prisma.blockedIp.create({
    data: {
      ipAddress: '103.22.180.45',
      reason: 'Rate Limit Exceeded / Suspicious Bot Activity',
      status: 'ACTIVE',
    },
  });

  await prisma.loginHistory.create({
    data: {
      userId: adminUser.id,
      emailAttempted: adminUser.email,
      ipAddress: '127.0.0.1',
      browser: 'Chrome 122.0',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
