import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginPage } from './admin-login/admin-login.page';
import { AdminDashboardPage } from './admin-dashboard/admin-dashboard.page';
import { AdminUsuariosPage } from './admin-usuarios/admin-usuarios.page';
import { AdminProdutosPage } from './admin-produtos/admin-produtos.page';
import { AdminLojasPage } from './admin-lojas/admin-lojas.page';
import { AdminComentariosPage } from './admin-comentarios/admin-comentarios.page';
import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AdminLoginPage
  },
  {
    path: 'dashboard',
    component: AdminDashboardPage,
    canActivate: [AdminGuard]
  },
  {
    path: 'usuarios',
    component: AdminUsuariosPage,
    canActivate: [AdminGuard]
  },
  {
    path: 'produtos',
    component: AdminProdutosPage,
    canActivate: [AdminGuard]
  },
  {
    path: 'lojas',
    component: AdminLojasPage,
    canActivate: [AdminGuard]
  },
  {
    path: 'comentarios',
    component: AdminComentariosPage,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
