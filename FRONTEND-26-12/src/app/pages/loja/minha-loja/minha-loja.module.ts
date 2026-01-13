import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MinhaLojaPageRoutingModule } from './minha-loja-routing.module';

import { MinhaLojaPage } from './minha-loja.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MinhaLojaPageRoutingModule
  ],
  declarations: [MinhaLojaPage]
})
export class MinhaLojaPageModule {}
