import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastrarNotaPage } from './cadastrar-nota.page';

const routes: Routes = [
  {
    path: '',
    component: CadastrarNotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastrarNotaPageRoutingModule {}
