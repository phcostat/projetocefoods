import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService, ChatMessage } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit, OnDestroy {
  sellerId = 0;
  room = '';
  messages: ChatMessage[] = [];
  text = '';
  sub?: Subscription;

  constructor(
  private route: ActivatedRoute,
  private chat: ChatService,
  public auth: AuthService
  ) {}

  ngOnInit() {
    const seller = Number(this.route.snapshot.paramMap.get('sellerId'));
    this.sellerId = seller || 0;
    const user = this.auth.getUsuarioLogado();
    if (!user) return;
    const buyerId = user.idUsuario;
    // deterministic room id
    this.room = `chat-${Math.min(buyerId, this.sellerId)}-${Math.max(buyerId, this.sellerId)}`;

    this.chat.connect();
    this.chat.clearMessages();
    this.chat.joinRoom(this.room);
    this.sub = this.chat.onMessages().subscribe(list => {
      // filter messages for this room
      this.messages = list.filter(m => m.room === this.room);
    });
  }

  send() {
    if (!this.text || !this.room) return;
    const user = this.auth.getUsuarioLogado();
    if (!user) return;
    const msg: ChatMessage = {
      room: this.room,
      fromId: user.idUsuario,
      toId: this.sellerId,
      text: this.text.trim(),
      timestamp: new Date().toISOString()
    };
    this.chat.sendMessage(msg);
    this.text = '';
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.chat.leaveRoom(this.room);
  }
}
