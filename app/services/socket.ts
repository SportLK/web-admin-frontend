import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

class AdminSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket && typeof window !== 'undefined') {
      this.socket = io(WS_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Admin connected to SportLK WebSocket Gateway:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });
    }

    return this.socket as Socket;
  }

  joinMatch(matchId: string, onMatchData?: (data: any) => void) {
    const s = this.connect();
    if (s) {
      s.emit('joinMatch', { matchId });
      if (onMatchData) {
        s.off('matchData');
        s.on('matchData', onMatchData);
      }
    }
  }

  onScoreUpdated(callback: (payload: { matchId: string; score: any; timestamp: string }) => void) {
    const s = this.connect();
    if (s) {
      s.off('scoreUpdated');
      s.on('scoreUpdated', callback);
    }
  }

  onStatusChanged(callback: (payload: { matchId: string; match: any; timestamp: string }) => void) {
    const s = this.connect();
    if (s) {
      s.off('matchStatusChanged');
      s.on('matchStatusChanged', callback);
    }
  }

  broadcastScoreUpdate(matchId: string, score: any) {
    const s = this.connect();
    if (s) {
      s.emit('updateScore', { matchId, score });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const adminSocket = new AdminSocketService();
