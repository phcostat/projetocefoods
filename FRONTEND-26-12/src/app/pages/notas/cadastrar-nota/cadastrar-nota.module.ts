import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastrarNotaPageRoutingModule } from './cadastrar-nota-routing.module';

import { CadastrarNotaPage } from './cadastrar-nota.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastrarNotaPageRoutingModule
  ],
  declarations: [CadastrarNotaPage]
})
export class CadastrarNotaPageModule {}
