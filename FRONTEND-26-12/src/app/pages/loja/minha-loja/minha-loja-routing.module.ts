import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MinhaLojaPage } from './minha-loja.page';

const routes: Routes = [
  {
    path: '',
    component: MinhaLojaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MinhaLojaPageRoutingModule {}
