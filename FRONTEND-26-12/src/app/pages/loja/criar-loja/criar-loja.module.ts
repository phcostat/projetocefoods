import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriarLojaPageRoutingModule } from './criar-loja-routing.module';

import { CriarLojaPage } from './criar-loja.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriarLojaPageRoutingModule
  ],
  declarations: [CriarLojaPage]
})
export class CriarLojaPageModule {}
