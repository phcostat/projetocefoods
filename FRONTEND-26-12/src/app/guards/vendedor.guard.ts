import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendedorGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) {
      return this.router.createUrlTree(['/login']);
    }

    const atualizado = await this.auth.refreshUsuarioLogadoFromApi();
    const usuarioAtual = atualizado ?? usuario;

    if (this.auth.usuarioPossuiLoja(usuarioAtual)) {
      return true;
    }

    return this.router.createUrlTree(['/criar-loja']);
  }
}
