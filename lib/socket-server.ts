import { Server as SocketIOServer } from 'socket.io';

let ioServer: SocketIOServer | null = null;

export function initSocketServer(httpServer: any) {
  if (ioServer) return ioServer;

  ioServer = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioServer.on('connection', (socket) => {
    socket.on('join_event_room', (eventId: string) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave_event_room', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });
  });

  return ioServer;
}

export function broadcastSeatStateChange(
  updates: { seatId: string; status: string; heldBy?: string }[],
  eventId?: string
) {
  if (!ioServer) return;
  if (eventId) {
    ioServer.to(`event:${eventId}`).emit('seat_state_update', updates);
  } else {
    ioServer.emit('seat_state_update', updates);
  }
}

export function broadcastConcertUpdate() {
  if (!ioServer) return;
  ioServer.emit('concert_updated');
}

export function broadcastUserUpdate() {
  if (!ioServer) return;
  ioServer.emit('user_updated');
}
