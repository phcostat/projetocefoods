import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaNotasPage } from './lista-notas.page';

const routes: Routes = [
  {
    path: '',
    component: ListaNotasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaNotasPageRoutingModule {}
