import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Client as StompClient, IMessage, IFrame, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  id?: string | number;
  room: string; // room id like `chat-{buyerId}-{sellerId}`
  fromId: number;
  toId: number;
  text: string;
  timestamp?: string;
}

export interface ConversationSummary {
  room: string;
  otherId: number | null;
  otherName?: string | null;
  lojaNome?: string | null;
  avatarUrl?: string | null;
  lastMessage: string | null;
  lastAt: string | null;
  unread?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket?: Socket;
  private stomp?: StompClient;
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private connected = false;
  private stompSubscriptions = new Map<string, StompSubscription>();
  private pendingRooms = new Set<string>();

  constructor(private auth: AuthService, private http: HttpClient) {}

  connect(): void {
    if (this.connected) return;
    // Prefer STOMP/SockJS to connect to Spring Boot WebSocket if configured
    const wsUrl = (environment as any).wsUrl;
    if (wsUrl) {
      this.stomp = new StompClient({
        brokerURL: undefined as any, // we use webSocketFactory instead
        webSocketFactory: () => new SockJS(wsUrl) as any,
        reconnectDelay: 5000,
        onConnect: (frame: IFrame) => {
          this.connected = true;
          console.log('STOMP connected', frame.headers);
          this.pendingRooms.forEach(room => this.subscribeRoom(room));
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame);
        }
      });
      this.stomp.activate();
      return;
    }

    // fallback to socket.io server (chatUrl or apiUrl)
    const url = (environment as any).chatUrl || environment.apiUrl;
    this.socket = io(url, { transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Chat socket connected', this.socket?.id);
      const user = this.auth.getUsuarioLogado();
      if (user) {
        // inform server about user id for presence
        this.socket?.emit('identify', { userId: user.idUsuario });
      }
    });

    this.socket.on('message', (msg: ChatMessage) => {
      try {
        const list = this.messages$.value.slice();
        list.push(msg);
        this.messages$.next(list);
      } catch (e) {
        console.error('Failed to push incoming message', e);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Chat socket disconnected');
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.connected = false;
  }

  joinRoom(room: string) {
    if (!room) return;
    const user = this.auth.getUsuarioLogado();
    const viewerParam = user ? `?viewerId=${user.idUsuario}` : '';
    const historyUrl = `${environment.apiUrl}/api/mensagens/sala/${encodeURIComponent(room)}${viewerParam}`;
    // subscribe via STOMP if available
    if (this.stomp) {
      if (this.stomp.connected) {
        this.subscribeRoom(room);
      } else {
        this.pendingRooms.add(room);
      }
      this.loadHistory(room, historyUrl);
      return;
    }

  // fallback socket.io path
    if (!this.socket) this.connect();
    this.socket?.emit('join', { room });
    // load history from REST endpoint (chat server or api)
    this.loadHistory(room, historyUrl);
  }

  leaveRoom(room: string) {
    if (room) {
      this.stompSubscriptions.get(room)?.unsubscribe();
      this.stompSubscriptions.delete(room);
      this.pendingRooms.delete(room);
    }
    this.socket?.emit('leave', { room });
  }

  async sendMessage(msg: ChatMessage) {
    try {
      const payload = {
        sala: msg.room,
        idUsuarioEnviada: msg.fromId,
        idUsuarioRecebida: msg.toId,
        mensagem: msg.text,
        anexos: (msg as any).anexos || null
      };

      // If STOMP configured, send to /app/chat.sendMessage (Spring @MessageMapping)
      if (this.stomp && this.stomp.active) {
        // build MensagemDTO-like payload
        const dto = {
          sala: payload.sala,
          idUsuarioEnviada: payload.idUsuarioEnviada,
          idUsuarioRecebida: payload.idUsuarioRecebida,
          mensagem: payload.mensagem,
          anexos: payload.anexos
        };
        this.stomp.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(dto) });
        return Promise.resolve(dto);
      }

      // fallback: POST to messages endpoint (existing chat server or API)
      const stored = await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/api/mensagens`, payload));
      this.pushMessage(this.mapPayloadToChatMessage(stored, msg.room));
      // also emit via socket.io so others receive immediately (if connected)
      if (!this.socket) this.connect();
      this.socket?.emit('message', { room: msg.room, fromId: msg.fromId, toId: msg.toId, text: msg.text, anexos: (msg as any).anexos || null });
      return stored;
    } catch (err) {
      console.error('Failed to send/persist message', err);
      throw err;
    }
  }

  onMessages(): Observable<ChatMessage[]> {
    return this.messages$.asObservable();
  }

  clearMessages() { this.messages$.next([]); }

  getConversations(userId: number) {
  // Prefer Spring API: adjust path if your backend uses a different URL
    const apiUrl = `${environment.apiUrl}/api/mensagens/conversas/${userId}`;
    const fallback = `${(environment as any).chatUrl || environment.apiUrl}/conversations/${userId}`;
    // try Spring API first, fallback to chat server if API returns error
    return this.http.get<ConversationSummary[]>(apiUrl).pipe(
      catchError(err => {
        console.warn('conversations api failed, falling back', err);
        return this.http.get<ConversationSummary[]>(fallback).pipe(catchError(() => of([])));
      })
    );
  }

  private mapPayloadToChatMessage(payload: any, fallbackRoom: string): ChatMessage {
    if (!payload) {
      return {
        room: fallbackRoom,
        fromId: 0,
        toId: 0,
        text: '',
        timestamp: new Date().toISOString()
      };
    }
    return {
      id: payload.idMensagem || payload.id || undefined,
      room: payload.sala || fallbackRoom,
      fromId: payload.idUsuarioEnviada || payload.idUsuarioEnviou || payload.fromId,
      toId: payload.idUsuarioRecebida || payload.idUsuarioRecebeu || payload.toId,
      text: payload.mensagem || payload.text,
      timestamp: payload.enviadoEm || payload.timestamp
    };
  }

  private pushMessage(msg: ChatMessage) {
    if (!msg || !msg.room) {
      return;
    }
    const list = this.messages$.value.slice();
    const exists = list.findIndex(existing => {
      if (msg.id && existing.id && msg.id === existing.id) {
        return true;
      }
      return existing.room === msg.room && existing.timestamp === msg.timestamp && existing.fromId === msg.fromId && existing.text === msg.text;
    });
    if (exists === -1) {
      list.push(msg);
      this.messages$.next(list);
    }
  }

  private subscribeRoom(room: string) {
    if (!room || !this.stomp || !this.stomp.connected) {
      return;
    }
    this.stompSubscriptions.get(room)?.unsubscribe();
    const sub = this.stomp.subscribe(`/topic/chat.${room}`, (m: IMessage) => {
      try {
        const payload = JSON.parse(m.body);
        this.pushMessage(this.mapPayloadToChatMessage(payload, room));
      } catch (e) {
        console.warn('invalid stomp message', e);
      }
    });
    this.stompSubscriptions.set(room, sub);
    this.pendingRooms.delete(room);
  }

  private loadHistory(room: string, historyUrl: string) {
    this.http.get<any[]>(historyUrl).subscribe(list => {
      const mapped = (list || []).map(item => this.mapPayloadToChatMessage(item, room));
      this.messages$.next(mapped);
    }, err => console.warn('Failed to load history via API', err));
  }
}
