import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class AdminLoginPage {
  email = '';
  senha = '';
  rememberDevice = true;
  erro = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminDataService: AdminDataService
  ) {}

  async entrar(): Promise<void> {
    this.erro = '';
    const identificador = this.email.trim();
    const senha = this.senha.trim();

    if (!identificador || !senha) {
      this.erro = 'Informe e-mail (ou login) e senha válidos.';
      return;
    }

    this.isLoading = true;
    try {
      const usuario = await this.authService.login(identificador, senha);
      if (!usuario) {
        this.erro = 'Credenciais inválidas ou usuário não encontrado.';
        return;
      }
      if (!this.authService.isAdmin()) {
        this.erro = 'Apenas contas com tipoPerfil ADMIN podem acessar o console.';
        this.authService.logout();
        return;
      }

      this.adminDataService.refreshFromBackend();
      this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      this.erro = this.resolveErro(error);
    } finally {
      this.isLoading = false;
    }
  }

  voltarParaLogin(): void {
    this.router.navigate(['/login']);
  }

  private resolveErro(error: unknown): string {
    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }
    if (error instanceof Error) {
      if (error.message === 'LOGIN_CREDENTIALS_REQUIRED') {
        return 'Informe e-mail (ou login) e senha válidos.';
      }
      if (error.message === 'USUARIO_SUSPENSO') {
        return 'Sua conta está suspensa. Procure o suporte.';
      }
      if (error.message && error.message.length > 0) {
        return error.message;
      }
    }
    return 'Não foi possível autenticar. Tente novamente em instantes.';
  }
}

