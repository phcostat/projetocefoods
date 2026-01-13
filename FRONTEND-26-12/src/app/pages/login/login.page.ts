import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  emailOrLogin = '';
  senha = '';
  erro = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  /*entrar() {
    const user = this.auth.login(this.emailOrLogin, this.senha);
    if (user) {
      this.router.navigate(['/inicio']);
    } else {
      this.erro = 'E-mail/login ou senha inválidos';
    }
  }*/
  async entrar() {
    this.erro = '';
    try {
      await this.auth.login(this.emailOrLogin, this.senha);
      const user = this.auth.getUsuarioLogado();
      if (user) {
        this.router.navigate(['/inicio']);
      } else {
        this.erro = 'E-mail/login ou senha inválidos';
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'USUARIO_SUSPENSO') {
        await this.presentSuspendedAlert();
        this.erro = 'Conta suspensa por um administrador.';
        return;
      }
      this.erro = 'Não foi possível autenticar. Tente novamente.';
    }
  }


  irCadastro() {
    this.router.navigate(['/etapa1']);
  }

  irAdminLogin(): void {
    this.router.navigate(['/admin/login']);
  }

  private async presentSuspendedAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Conta suspensa',
      message: 'Sua conta foi suspensa por um administrador. Entre em contato com o suporte para mais informações.',
      buttons: ['Entendi']
    });
    await alert.present();
  }
}
