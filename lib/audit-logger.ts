import { prisma } from './prisma';

export interface AuditLogOptions {
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  payloadJson?: object | string;
}

export async function recordAuditLog(options: AuditLogOptions) {
  try {
    const payloadStr =
      typeof options.payloadJson === 'object'
        ? JSON.stringify(options.payloadJson)
        : options.payloadJson;

    return await prisma.auditLog.create({
      data: {
        actorId: options.actorId,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        ipAddress: options.ipAddress || '127.0.0.1',
        userAgent: options.userAgent,
        payloadJson: payloadStr,
      },
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}
