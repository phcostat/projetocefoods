import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Etapa3PageRoutingModule } from './etapa3-routing.module';

import { Etapa3Page } from './etapa3.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Etapa3PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [Etapa3Page]
})
export class Etapa3PageModule {}
