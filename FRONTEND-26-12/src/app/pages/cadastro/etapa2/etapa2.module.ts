import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Etapa2PageRoutingModule } from './etapa2-routing.module';

import { Etapa2Page } from './etapa2.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Etapa2PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [Etapa2Page]
})
export class Etapa2PageModule {}
