import { Component, OnInit } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';
import { LojaService } from './services/loja.service';
import { NotificationService } from './services/notificacao.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  usuarioLogado?: Usuario | null;
  possuiLoja = false; // <-- propriedade usada para mostrar/ocultar botão

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private authService: AuthService,
    private lojaService: LojaService,
    private alertCtrl: AlertController,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.menuCtrl.swipeGesture(false, 'menuPerfil');
    this.refreshUser();
    this.updateMenuGestureForRoute(this.router.url);

    // Atualiza ao navegar entre páginas
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.refreshUser();
        this.updateMenuGestureForRoute(event.urlAfterRedirects);
      });
  }


  private updateMenuGestureForRoute(url: string) {
    const normalized = (url || '').split('?')[0];
    const allowMenu = normalized === '/perfil';
    this.menuCtrl.swipeGesture(allowMenu, 'menuPerfil');

    if (!allowMenu) {
      this.menuCtrl.close('menuPerfil');
    }
  }

  async refreshUser() {
    const usuario = this.authService.getUsuarioLogado();
    this.usuarioLogado = usuario;

    if (usuario) {
      try {
        const loja = await firstValueFrom(this.lojaService.getByUsuario(usuario.idUsuario));
        this.possuiLoja = !!loja;
      } catch {
        this.possuiLoja = false;
      }
    } else {
      this.possuiLoja = false;
    }

    if (usuario) {
      try {
        this.notificationService.connect(usuario.idUsuario);
      } catch (err) {
        console.warn('Notification connect failed', err);
      }
      // também carregue notificações históricas com tratamento de erro
      this.notificationService.listarPorUsuario(usuario.idUsuario).subscribe(lista => {
        this.notificationService.replaceNotifications(lista || []);
      }, err => {
        console.warn('Failed to load notifications', err);
      });
    }
  }

  async logout() {
    await this.menuCtrl.close('menuPerfil');
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async excluirLoja() {
    await this.menuCtrl.close('menuPerfil');

    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    try {
      const loja = await firstValueFrom(this.lojaService.getByUsuario(usuario.idUsuario));

      if (!loja) {
        const info = await this.alertCtrl.create({
          header: 'Informação',
          message: 'Você não possui loja para excluir.',
          buttons: ['OK']
        });
        await info.present();
        return;
      }

      const confirm = await this.alertCtrl.create({
        header: 'Excluir Loja',
        message: 'Tem certeza que deseja excluir sua loja? Essa ação não poderá ser desfeita.',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: async () => {
              try {
                await firstValueFrom(this.lojaService.delete(loja.idLoja));

                const atualizado: Usuario = {
                  ...usuario,
                  possuiLoja: false,
                  tipoPerfil: 'comprador'
                };

                await this.authService.updateUsuario(atualizado);
                this.usuarioLogado = atualizado;
                this.possuiLoja = false; // <-- Atualiza o menu lateral

                const alertaSucesso = await this.alertCtrl.create({
                  header: 'Sucesso',
                  message: 'Sua loja foi excluída e seu perfil voltou a ser de comprador.',
                  buttons: ['OK']
                });
                await alertaSucesso.present();

                this.router.navigateByUrl('/perfil');
              } catch (error) {
                console.error('Erro ao excluir loja:', error);
                const alertaErro = await this.alertCtrl.create({
                  header: 'Erro',
                  message: 'Não foi possível excluir sua loja. Tente novamente mais tarde.',
                  buttons: ['OK']
                });
                await alertaErro.present();
              }
            }
          }
        ]
      });

      await confirm.present();
    } catch (error) {
      console.error('Erro ao verificar loja:', error);
      const alertaErro = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Erro ao verificar a existência da loja. Tente novamente mais tarde.',
        buttons: ['OK']
      });
      await alertaErro.present();
    }
  }

}
