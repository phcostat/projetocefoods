import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private API = `${environment.apiUrl}/notificacoes`;
  private stompClient?: Client;
  private wsConnected = false;
  private notifications$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}

  connect(userId: number) {
    if (this.wsConnected) return;
    try {
      const socket = new SockJS(`${environment.apiUrl}/ws`);
      this.stompClient = new Client({
        webSocketFactory: () => socket as any,
        debug: () => {},
        reconnectDelay: 2000
      });

      this.stompClient.onConnect = () => {
        this.wsConnected = true;
        const topic = `/topic/notifications/user-${userId}`;
        try {
          this.stompClient?.subscribe(topic, (msg: Message) => {
            try {
              const payload = JSON.parse(msg.body);
              this.pushRealtime(payload);
            } catch (err) {
              console.error('Invalid notification payload', err);
            }
          });
        } catch (err) {
          console.warn('Failed to subscribe to notifications topic', err);
        }
      };

      this.stompClient.activate();
    } catch (err) {
      console.warn('WebSocket/STOMP connect failed', err);
    }
  }

  disconnect() {
    this.stompClient?.deactivate();
    this.wsConnected = false;
  }

  pushRealtime(n: any) {
    // pega lista atual e adiciona no topo
    const list = this.notifications$.value.slice();
    list.unshift(n);
    this.notifications$.next(list);
  }

  onNotifications(): Observable<any[]> {
    return this.notifications$.asObservable();
  }

  listarPorUsuario(idUsuario: number) {
    return this.http.get<any[]>(`${this.API}/usuario/${idUsuario}`).pipe(
      catchError(err => {
        console.error('NotificationService.listarPorUsuario failed', err);
        return of([]);
      })
    );
  }

  // replace current notifications list (safe public API)
  replaceNotifications(list: any[]) {
    this.notifications$.next(list || []);
  }

  marcarLida(id: number) {
    return this.http.put<any>(`${this.API}/${id}/lida`, {});
  }
}
