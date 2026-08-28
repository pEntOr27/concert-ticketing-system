import { seatBookingService } from '../lib/db-wrapper';

console.log('🔄 Seat Hold Expiration Worker started...');

async function runWorkerLoop() {
  try {
    const releasedCount = await seatBookingService.releaseExpiredHolds();
    if (releasedCount > 0) {
      console.log(`[Worker] Released ${releasedCount} expired seat holds to AVAILABLE.`);
    }
  } catch (error) {
    console.error('[Worker] Error releasing expired holds:', error);
  }
}

// Run check every 5 seconds
setInterval(runWorkerLoop, 5000);
