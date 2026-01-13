// src/app/pages/loja/minha-loja/minha-loja.page.ts
/*import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service'; //antes Usuario era importado aqui
import { Usuario } from 'src/app/model/usuario'; //essa linha nao existia
import { Router } from '@angular/router';

@Component({
  selector: 'app-minha-loja',
  templateUrl: './minha-loja.page.html',
  styleUrls: ['./minha-loja.page.scss'],
  standalone: false
})
export class MinhaLojaPage implements OnInit {
  loja?: Loja;
  usuario?: Usuario | null;
  nomeUsuario = "";

  constructor(
    private lojaService: LojaService,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.carregar();
    const u = this.authService.getUsuarioLogado();
    if (u) {
      this.nomeUsuario = u.nome || u.login || 'Usuário';
    }
  }

  ionViewWillEnter() {
    this.carregar();
  }

  carregar() {
    this.usuario = this.authService.getUsuarioLogado();
    if (!this.usuario) {
      this.loja = undefined;
      return;
    }

    const lojaEncontrada = this.lojaService.getByUsuario(this.usuario.idUsuario);
    if (!lojaEncontrada) {
      this.loja = undefined;
      return;
    }

    this.loja = lojaEncontrada;

    // Garantir que status seja boolean (caso venha faltando/antigo do storage)
    if (typeof this.loja.status !== 'boolean') {
      this.loja.status = false; // fechado por padrão
      try {
        this.lojaService.update(this.loja);
      } catch {
        // se não conseguir salvar agora, segue a vida (evita quebrar a tela)
      }
    }
  }

  // Alterna entre aberta (true) e fechada (false)
  alternarStatus() {
    if (!this.loja) return;
    this.loja.status = !this.loja.status;
    this.lojaService.update(this.loja);
  }

  async excluirLoja() {
    if (!this.loja) return;
    const a = await this.alertCtrl.create({
      header: 'Confirmar',
      message: 'Tem certeza que deseja excluir sua loja?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.lojaService.delete(this.loja!.id);
            if (this.usuario) {
              this.usuario.possuiLoja = false;
              this.usuario.tipoPerfil = 'comprador';
              this.authService.updateUsuario(this.usuario);
            }
            this.navCtrl.navigateRoot('/inicio');
          }
        }
      ]
    });
    await a.present();
    obterRotuloStatusAdm(status?: LojaStatusAdministrativo): string {
      switch (status) {
        case 'SUSPENSA':
          return 'Suspensa pelo administrador';
        case 'EM_ANALISE':
          return 'Em análise administrativa';
        case 'ATIVA':
        default:
          return 'Liberada para operar';
      }
    }

  }

  editarLoja() {
    if (!this.loja) return;
    this.router.navigate(['/criar-loja'], { queryParams: { id: this.loja.id } });
  }


  irPedidos() {
    this.router.navigate(['/recebidos']);
  }

  irMeusProdutos() {
    this.router.navigate(['/lista']);
  }

  irFinancas() {
    if (this.loja) {
      this.navCtrl.navigateForward(['/financeiro', this.loja.id]);
    }
  }

  irRelatorio() {
    this.router.navigate(['/relatorios']);
  }

  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
  }

  irMenu() {
    this.router.navigate(['/inicio']);
  }
}*/

// src/app/pages/minha-loja/minha-loja.page.ts
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LojaService, Loja, LojaStatusAdministrativo } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-minha-loja',
  templateUrl: './minha-loja.page.html',
  styleUrls: ['./minha-loja.page.scss'],
  standalone: false
})
export class MinhaLojaPage implements OnInit {
  loja?: Loja;
  nomeUsuario = '';
  lojaSuspensa = false;
  private ultimaAlertaStatusAdm?: LojaStatusAdministrativo;

  constructor(
    private lojaService: LojaService,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadLoja();
  }

  ionViewWillEnter() {
    this.loadLoja();
  }

  private loadLoja() {
    const user = this.authService.getUsuarioLogado();
    if (!user) {
      this.navCtrl.navigateRoot('/login');
      return;
    }
    this.nomeUsuario = user.nome || user.login || '';
    this.lojaService.getByUsuario(user.idUsuario).subscribe(loja => {
      if (!loja) {
        this.navCtrl.navigateRoot('/criar-loja');
      } else {
        this.loja = loja;
        this.verificarStatusAdministrativo(loja);
      }
    });

  }

  async excluirLoja() {
    if (!this.loja) return;
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: 'Tem certeza que deseja excluir sua loja?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.lojaService.delete(this.loja!.idLoja).subscribe(() => {
              this.navCtrl.navigateRoot('/inicio');
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Alterna entre aberta (true) e fechada (false)
  alternarStatus(forcedValue?: boolean) {
    if (!this.loja) return;

    if (this.lojaSuspensa) {
      this.verificarStatusAdministrativo(this.loja, true);
      return;
    }

    const novoStatus = typeof forcedValue === 'boolean' ? forcedValue : !this.loja.status;
    if (novoStatus === this.loja.status) {
      return;
    }

    const dto = { status: novoStatus, manualOverride: true };

    this.lojaService.updateStatus(this.loja.idLoja, dto).subscribe({
      next: lojaAtualizada => {
        this.loja = lojaAtualizada;
        this.verificarStatusAdministrativo(lojaAtualizada);
      },
      error: err => {
        console.error('Erro ao atualizar status da loja', err);
      }
    });
  }

  onToggleStatus(event: CustomEvent<{ checked: boolean }>): void {
    if (!this.loja) {
      return;
    }
    if (this.lojaSuspensa) {
      event.preventDefault();
      this.verificarStatusAdministrativo(this.loja, true);
      return;
    }
    const desired = !!event.detail.checked;
    this.alternarStatus(desired);
  }

  private verificarStatusAdministrativo(loja: Loja, reforcarAlerta = false): void {
    const statusAdm = loja.statusAdm || 'ATIVA';
    const suspensa = statusAdm !== 'ATIVA';
    this.lojaSuspensa = suspensa;

    if (!suspensa) {
      this.ultimaAlertaStatusAdm = undefined;
      return;
    }

    if (reforcarAlerta || this.ultimaAlertaStatusAdm !== statusAdm) {
      this.ultimaAlertaStatusAdm = statusAdm;
      this.exibirSuspensaoAlert(statusAdm);
    }
  }

  private async exibirSuspensaoAlert(statusAdm: LojaStatusAdministrativo): Promise<void> {
    const header = statusAdm === 'SUSPENSA' ? 'Loja suspensa' : 'Loja em análise';
    const message = statusAdm === 'SUSPENSA'
      ? 'Seu estabelecimento foi suspenso pelo time administrativo e está oculto para os clientes até regularização.'
      : 'Seu estabelecimento está em revisão administrativa e ficará indisponível ao público até nova liberação.';

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Entendi']
    });
    await alert.present();
  }

  obterRotuloStatusAdm(status?: LojaStatusAdministrativo): string {
    switch (status) {
      case 'SUSPENSA':
        return 'Suspensa pelo administrativo';
      case 'EM_ANALISE':
        return 'Em análise administrativa';
      case 'ATIVA':
      default:
        return 'Liberada para operar';
    }
  }





  editarLoja() {
    if (this.loja) {
      this.router.navigate(['/criar-loja'], { queryParams: { id: this.loja.idLoja } });
    }
  }

  irPedidos() {
    this.router.navigate(['/recebidos']);
  }

  irMeusProdutos() {
    this.router.navigate(['/lista']);
  }

  irFinancas() {
    if (this.loja) this.router.navigate(['/financeiro', this.loja.idLoja]);
  }

  irRelatorio() {
    this.router.navigate(['/relatorios']);
  }

  irNotas() {
    this.router.navigate(['/lista-notas']);
  }

  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
  }

  irMenu() {
    this.router.navigate(['/inicio']);
  }
}

