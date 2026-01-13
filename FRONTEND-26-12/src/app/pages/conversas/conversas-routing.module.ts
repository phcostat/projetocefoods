import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversasPage } from './conversas.page';

const routes: Routes = [
  { path: '', component: ConversasPage }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ConversasPageRoutingModule {}
