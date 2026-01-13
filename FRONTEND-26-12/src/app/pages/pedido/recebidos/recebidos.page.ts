import { Component, OnInit } from '@angular/core';
import { Pedido, PedidoService } from 'src/app/services/pedido.service';
import { AuthService } from 'src/app/services/auth.service';
import { LojaService } from 'src/app/services/loja.service';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LojaAccessService } from 'src/app/services/loja-access.service';

@Component({
  selector: 'app-recebidos',
  templateUrl: './recebidos.page.html',
  styleUrls: ['./recebidos.page.scss'],
  standalone: false
})
export class RecebidosPage implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];

  nomeUsuario = "";

  filtroData: 'recente' | 'antigo' = 'recente';
  filtroStatus: 'todos' | 'pending' | 'accepted' | 'completed' | 'cancelled' = 'todos';

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private lojaService: LojaService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
    private lojaAccessService: LojaAccessService
  ) { }

  ngOnInit() {
    this.carregarPedidos();
  }

  ionViewWillEnter() {
    this.carregarPedidos();
  }

  carregarPedidos() {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) return;

    this.nomeUsuario = usuario.nome;

    this.lojaService.getByUsuario(usuario.idUsuario).subscribe(loja => {
      if (!loja) return;

      this.pedidoService.getPedidosPorLoja(loja.idLoja).subscribe(pedidos => {
        this.pedidos = (pedidos || []).map(p => ({
          ...p,
          status: (p.status ?? '').toUpperCase(),  // mantém em maiúsculo
          dataPedido: p.dataPedido ?? new Date().toISOString()
        }));
        this.aplicarFiltros();
      });

    });
  }






  aplicarFiltros() {
    let lista = [...this.pedidos];

    // 🔹 Filtro por status
    if (this.filtroStatus !== 'todos') {
      lista = lista.filter(
        p => (p.status ?? '').toLowerCase() === this.filtroStatus.toLowerCase()
      );
    }

    // 🔹 Filtro por data (garantindo que nunca passe undefined)
    lista.sort((a, b) => {
      const dataA = a.dataPedido ? new Date(a.dataPedido).getTime() : 0;
      const dataB = b.dataPedido ? new Date(b.dataPedido).getTime() : 0;
      return this.filtroData === 'recente' ? dataB - dataA : dataA - dataB;
    });

    this.pedidosFiltrados = lista;
  }






  async recusarPedido(pedido: Pedido) {
    const alert = await this.alertCtrl.create({
      header: 'Recusar Pedido',
      message: 'Tem certeza que deseja recusar este pedido?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sim, recusar',
          handler: async () => {
            try {
              await this.pedidoService.cancelarPedido(pedido);
              // feedback ao usuário
              const a = await this.alertCtrl.create({
                header: 'Pedido recusado',
                message: 'O pedido foi recusado e o estoque será atualizado.',
                buttons: ['OK']
              });
              await a.present();
              this.carregarPedidos(); // recarrega lista
            } catch (err) {
              console.error('Erro ao recusar pedido', err);
              const a = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Não foi possível recusar o pedido. Tente novamente.',
                buttons: ['OK']
              });
              await a.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }


  async aceitarPedido(pedido: Pedido) {
    try {
      await firstValueFrom(this.pedidoService.aceitarPedido(pedido));
      this.carregarPedidos(); // recarrega para refletir os botões e status
    } catch (err) {
      console.error('Erro ao aceitar pedido:', err);
    }
  }

  async concluirPedido(pedido: Pedido) {
    try {
      await firstValueFrom(this.pedidoService.concluirPedido(pedido));
      this.carregarPedidos();
    } catch (err) {
      console.error('Erro ao concluir pedido:', err);
    }
  }



  irMenu() { this.router.navigate(['/inicio']); }
  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }

  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }

}
