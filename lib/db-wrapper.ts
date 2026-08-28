import { prisma } from './prisma';
import { broadcastSeatStateChange } from './socket-server';

export interface HoldSeatInput {
  userId: string;
  eventId: string;
  seatIds: string[];
  holdDurationMinutes?: number;
}

export class SeatBookingService {
  /**
   * Holds seats atomically inside a MySQL transaction with SELECT FOR UPDATE.
   * Ensures zero double-booking race conditions across concurrent browser sessions.
   */
  async holdSeats(input: HoldSeatInput) {
    const { userId, eventId, seatIds, holdDurationMinutes = 10 } = input;
    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      // 1. Lock candidate seats (using MySQL FOR UPDATE or SQLite Prisma transaction fallback)
      let lockedSeats: any[] = [];
      try {
        lockedSeats = await tx.$queryRawUnsafe<any[]>(
          `SELECT id, zone_id, seat_number, status FROM seats WHERE id IN (${seatIds.map(() => '?').join(',')}) FOR UPDATE`,
          ...seatIds
        );
      } catch {
        // SQLite fallback (SQLite Prisma transaction locks the database exclusively)
        const seatsFromDb = await tx.seat.findMany({
          where: { id: { in: seatIds } },
          select: { id: true, zoneId: true, seatNumber: true, status: true },
        });
        lockedSeats = seatsFromDb.map((s) => ({
          id: s.id,
          zone_id: s.zoneId,
          seat_number: s.seatNumber,
          status: s.status,
        }));
      }

      if (lockedSeats.length !== seatIds.length) {
        throw { code: 'SEAT_NOT_FOUND', status: 404, message: 'ไม่พบที่นั่งที่ระบุ' };
      }

      // 2. Verify all selected seats are strictly AVAILABLE
      for (const seat of lockedSeats) {
        if (seat.status !== 'AVAILABLE') {
          throw {
            code: 'SEAT_ALREADY_HELD',
            status: 409,
            message: `ที่นั่ง ${seat.seat_number} ถูกจองโดยผู้ใช้งานอื่นแล้ว`,
          };
        }
      }

      // 3. Update seat statuses to HELD
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'HELD' },
      });

      // 4. Calculate total amount
      const seatDetails = await tx.seat.findMany({
        where: { id: { in: seatIds } },
        include: { zone: true },
      });

      const totalAmount = seatDetails.reduce((sum, s) => sum + Number(s.zone.price), 0);

      // 5. Create Booking record in PENDING state
      const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          userId,
          eventId,
          totalAmount,
          finalAmount: totalAmount,
          status: 'HELD',
          expiresAt,
          bookingItems: {
            create: seatDetails.map((s) => ({
              seatId: s.id,
              price: s.zone.price,
            })),
          },
        },
      });

      // 6. Create SeatHold records
      for (const s of seatDetails) {
        await tx.seatHold.create({
          data: {
            seatId: s.id,
            userId,
            bookingId: booking.id,
            holdToken: `HOLD-${s.id}-${Date.now()}`,
            expiresAt,
          },
        });
      }

      // 7. Broadcast real-time Socket.IO event to all browsers
      broadcastSeatStateChange(
        seatIds.map((id) => ({ seatId: id, status: 'HELD', heldBy: userId }))
      );

      return {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        expiresAt,
        totalAmount,
        seats: seatDetails.map((s) => s.seatNumber),
      };
    });
  }

  /**
   * Releases expired holds (> 10 mins) back to AVAILABLE
   */
  async releaseExpiredHolds() {
    const now = new Date();

    const expiredHolds = await prisma.seatHold.findMany({
      where: { expiresAt: { lt: now } },
      include: { seat: true },
    });

    if (expiredHolds.length === 0) return 0;

    const seatIdsToRelease = expiredHolds.map((h) => h.seatId);
    const bookingIdsToCancel = expiredHolds.map((h) => h.bookingId).filter(Boolean) as string[];

    await prisma.$transaction(async (tx) => {
      // Set seats back to AVAILABLE
      await tx.seat.updateMany({
        where: { id: { in: seatIdsToRelease } },
        data: { status: 'AVAILABLE' },
      });

      // Delete hold records
      await tx.seatHold.deleteMany({
        where: { id: { in: expiredHolds.map((h) => h.id) } },
      });

      // Expire corresponding pending bookings
      if (bookingIdsToCancel.length > 0) {
        await tx.booking.updateMany({
          where: { id: { in: bookingIdsToCancel }, status: 'HELD' },
          data: { status: 'EXPIRED' },
        });
      }
    });

    // Broadcast update
    broadcastSeatStateChange(
      seatIdsToRelease.map((id) => ({ seatId: id, status: 'AVAILABLE' }))
    );

    return expiredHolds.length;
  }
}

export const seatBookingService = new SeatBookingService();
