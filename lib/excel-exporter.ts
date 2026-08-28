import ExcelJS from 'exceljs';

export async function generateAuditLogsExcel(logs: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Audit Logs');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'Actor Email', key: 'actorEmail', width: 25 },
    { header: 'Action', key: 'action', width: 20 },
    { header: 'Resource', key: 'resource', width: 20 },
    { header: 'Resource ID', key: 'resourceId', width: 36 },
    { header: 'IP Address', key: 'ipAddress', width: 18 },
    { header: 'Created At', key: 'createdAt', width: 22 },
  ];

  logs.forEach((log) => {
    sheet.addRow({
      id: log.id,
      actorEmail: log.actor?.email || 'System/Guest',
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || '-',
      ipAddress: log.ipAddress,
      createdAt: new Date(log.createdAt).toLocaleString('th-TH'),
    });
  });

  return workbook.xlsx.writeBuffer();
}

export async function generateLoginHistoryExcel(history: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Login History');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 36 },
    { header: 'User Email', key: 'email', width: 25 },
    { header: 'IP Address', key: 'ipAddress', width: 18 },
    { header: 'Browser', key: 'browser', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Failure Reason', key: 'failureReason', width: 30 },
    { header: 'Login Time', key: 'createdAt', width: 22 },
  ];

  history.forEach((h) => {
    sheet.addRow({
      id: h.id,
      email: h.user?.email || h.emailAttempted || 'Unknown',
      ipAddress: h.ipAddress,
      browser: h.browser || 'Unknown',
      status: h.status,
      failureReason: h.failureReason || '-',
      createdAt: new Date(h.createdAt).toLocaleString('th-TH'),
    });
  });

  return workbook.xlsx.writeBuffer();
}

export async function generateBookingsExcel(bookings: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bookings');

  sheet.columns = [
    { header: 'Booking No.', key: 'bookingNumber', width: 20 },
    { header: 'Customer', key: 'customerName', width: 25 },
    { header: 'Concert', key: 'eventName', width: 30 },
    { header: 'Seats', key: 'seats', width: 25 },
    { header: 'Final Amount (THB)', key: 'finalAmount', width: 18 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 22 },
  ];

  bookings.forEach((b) => {
    const seatsStr = b.bookingItems.map((bi: any) => bi.seat.seatNumber).join(', ');
    sheet.addRow({
      bookingNumber: b.bookingNumber,
      customerName: `${b.user.firstName} ${b.user.lastName}`,
      eventName: b.event.name,
      seats: seatsStr,
      finalAmount: Number(b.finalAmount),
      status: b.status,
      createdAt: new Date(b.createdAt).toLocaleString('th-TH'),
    });
  });

  return workbook.xlsx.writeBuffer();
}
