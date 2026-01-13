import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'; //antes Usuario era importado aqui
import { Usuario } from 'src/app/model/usuario'; //essa linha nao existia
import { Pedido, PedidoService } from 'src/app/services/pedido.service';
import { Router } from '@angular/router';
import { MenuController, NavController, ToastController } from '@ionic/angular';
import { LojaAccessService } from 'src/app/services/loja-access.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  usuarioLogado!: Usuario;
  historicoPedidos: Pedido[] = [];

  constructor(
    private authService: AuthService,
    private pedidoService: PedidoService,
    private router: Router,
    private menuCtrl: MenuController,
    private navCtrl: NavController,
    private lojaAccessService: LojaAccessService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) return;

    this.usuarioLogado = usuario;

    this.pedidoService.getPedidosPorUsuario(usuario.idUsuario).subscribe(pedidos => {
      this.historicoPedidos = (pedidos || [])
        .map(p => ({
          ...p,
          status: (p.status ?? '').toUpperCase(), // deixa padronizado
          dataPedido: p.dataPedido ?? (p as any).data ?? new Date().toISOString()
        }))
        .sort(
          (a, b) => new Date(b.dataPedido!).getTime() - new Date(a.dataPedido!).getTime()
        ); // mais recente primeiro
    });
  }





  abrirMenu() {
    this.menuCtrl.open('menuPerfil');
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }


  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
  }

  /** 🔹 Método para acessar a tela de edição de perfil */
  irEditarPerfil() {
    this.navCtrl.navigateForward('/editar-perfil');
  }

  deveMostrarPix(pedido: Pedido): boolean {
    const pagamento = (pedido.formaPagamento ?? '').toUpperCase();
    const status = (pedido.status ?? '').toUpperCase();
    return pagamento === 'PIX' && status === 'ACCEPTED' && !!pedido.chavePixLoja;
  }

  async copiarChavePix(chave?: string) {
    if (!chave) {
      await this.mostrarToast('Chave PIX indisponível', 'warning');
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(chave);
      } else {
        this.copiarFallback(chave);
      }
      await this.mostrarToast('Chave PIX copiada!', 'success');
    } catch (error) {
      this.copiarFallback(chave);
      await this.mostrarToast('Copie manualmente: ' + chave, 'medium');
    }
  }

  private copiarFallback(texto: string) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  private async mostrarToast(message: string, color: string = 'dark') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
