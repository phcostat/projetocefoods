import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, ConversationSummary } from 'src/app/services/chat.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-conversas',
  templateUrl: './conversas.page.html',
  styleUrls: ['./conversas.page.scss'],
  standalone: false
})
export class ConversasPage implements OnInit {
  conversations: ConversationSummary[] = [];

  constructor(private chat: ChatService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.getUsuarioLogado();
    if (!user) return;
    this.load();
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    const user = this.auth.getUsuarioLogado();
    if (!user) return;
    this.chat.getConversations(user.idUsuario).subscribe(list => {
      this.conversations = list;
    }, err => {
      console.error('Failed to load conversations', err);
    });
  }

  open(conv: ConversationSummary) {
    // navigate to chat with otherId
    if (!conv?.otherId) {
      return;
    }
    this.router.navigate(['/chat', conv.otherId]);
  }

  irNotificacoes() {
    this.router.navigate(['/notificacao']);
  }
}
