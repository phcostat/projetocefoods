import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginPage } from './admin-login/admin-login.page';
import { AdminDashboardPage } from './admin-dashboard/admin-dashboard.page';
import { AdminUsuariosPage } from './admin-usuarios/admin-usuarios.page';
import { AdminProdutosPage } from './admin-produtos/admin-produtos.page';
import { AdminLojasPage } from './admin-lojas/admin-lojas.page';
import { AdminComentariosPage } from './admin-comentarios/admin-comentarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AdminRoutingModule,
    AdminLoginPage,
    AdminDashboardPage,
    AdminUsuariosPage,
    AdminProdutosPage,
    AdminLojasPage,
    AdminComentariosPage
  ]
})
export class AdminModule {}
