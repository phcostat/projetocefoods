import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CriarLojaPage } from './criar-loja.page';

const routes: Routes = [
  {
    path: '',
    component: CriarLojaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CriarLojaPageRoutingModule {}
