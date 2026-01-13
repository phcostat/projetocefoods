import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const usuario = this.authService.getUsuarioLogado();
    if (usuario && this.authService.isAdmin()) {
      return true;
    }
    if (usuario) {
      return this.router.createUrlTree(['/inicio']);
    }
    return this.router.createUrlTree(['/admin/login']);
  }
}
