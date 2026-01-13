import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaNotasPageRoutingModule } from './lista-notas-routing.module';

import { ListaNotasPage } from './lista-notas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaNotasPageRoutingModule
  ],
  declarations: [ListaNotasPage]
})
export class ListaNotasPageModule {}
