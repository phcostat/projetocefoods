import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/services/notificacao.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LojaAccessService } from 'src/app/services/loja-access.service';

@Component({
  selector: 'app-notificacao',
  templateUrl: './notificacao.page.html',
  styleUrls: ['./notificacao.page.scss'],
  standalone:false
})
export class NotificacaoPage implements OnInit, OnDestroy {
  lista: any[] = [];
  gruposPorData: { data: string; items: any[] }[] = [];
  subs: Subscription[] = [];
  usuario: any;

  constructor(
    private notifService: NotificationService,
    private auth: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private lojaAccessService: LojaAccessService
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuarioLogado();
    if (!this.usuario) return;

    this.subs.push(this.notifService.onNotifications().subscribe(arr => {
      this.lista = this.ordenarPorData(arr);
      this.gruposPorData = this.agruparPorData(this.lista);
    }));

    this.notifService.listarPorUsuario(this.usuario.idUsuario).subscribe(arr => {
      const ordenadas = this.ordenarPorData(arr);
      this.lista = ordenadas;
      this.gruposPorData = this.agruparPorData(ordenadas);
      this.notifService['notifications$'].next(ordenadas);
    });
  }

  async toggleMarkAsRead(n: any) {
    if (n.lida) return;
    await this.notifService.marcarLida(n.id).toPromise();
    n.lida = true;
  }

  private ordenarPorData(arr: any[]): any[] {
    return [...(arr || [])].sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  }

  private agruparPorData(notificacoes: any[]): { data: string; items: any[] }[] {
    const grupos = new Map<string, any[]>();

    notificacoes.forEach(n => {
      const dataChave = new Date(n.dataCriacao).toLocaleDateString('pt-BR');
      if (!grupos.has(dataChave)) {
        grupos.set(dataChave, []);
      }
      grupos.get(dataChave)!.push(n);
    });

    return Array.from(grupos.entries()).map(([data, items]) => ({ data, items }));
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  getIcon(tipo: string) {
    if (!tipo) return 'notifications-outline';
    if (tipo === 'ORDER_RECEIVED') return 'notifications-circle';
    if (tipo === 'LOW_STOCK') return 'alert-circle';
    if (tipo === 'COMMENT') return 'chatbubbles';
    if (tipo.startsWith('ORDER_')) return 'cart-outline';
    return 'notifications-outline';
  }

  getCardClass(tipo: string): string {
    if (tipo === 'ORDER_RECEIVED') return 'border-blue';
    if (tipo === 'LOW_STOCK' || tipo === 'ORDER_DECLINED') return 'border-red';
    if (tipo === 'COMMENT') return 'border-purple';
    if (tipo === 'ORDER_PENDING') return 'border-yellow';
    if (tipo === 'ORDER_COMPLETED') return 'border-green';
    return '';
  }

  getColor(tipo: string): string {
    if (tipo === 'ORDER_RECEIVED') return '#2f86eb';
    if (tipo === 'LOW_STOCK' || tipo === 'ORDER_DECLINED') return '#e53935';
    if (tipo === 'COMMENT') return '#8e44ad';
    if (tipo === 'ORDER_PENDING') return '#f4b400';
    if (tipo === 'ORDER_COMPLETED') return '#2ecc71';
    return '#ccc';
  }

  voltar() {
    this.navCtrl.back();
  }

  // Métodos do footer
  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
  }

  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }
}
