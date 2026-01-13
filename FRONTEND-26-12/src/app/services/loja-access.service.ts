import { Injectable } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LojaAccessService {
  constructor(
    private readonly authService: AuthService,
    private readonly navCtrl: NavController,
    private readonly alertCtrl: AlertController
  ) {}

  async abrirMinhaLojaOuPerguntar(): Promise<void> {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    const atualizado = await this.authService.refreshUsuarioLogadoFromApi();
    const usuarioAtual = atualizado ?? usuario;

    if (this.authService.usuarioPossuiLoja(usuarioAtual)) {
      this.navCtrl.navigateRoot('/minha-loja');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Você não possui loja',
      message: 'Você ainda não possui uma loja. Deseja criar uma agora?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Criar loja', handler: () => this.navCtrl.navigateForward('/criar-loja') }
      ]
    });
    await alert.present();
  }
}
