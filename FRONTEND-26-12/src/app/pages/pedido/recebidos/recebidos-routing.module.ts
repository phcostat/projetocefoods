import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecebidosPage } from './recebidos.page';

const routes: Routes = [
  {
    path: '',
    component: RecebidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecebidosPageRoutingModule {}
