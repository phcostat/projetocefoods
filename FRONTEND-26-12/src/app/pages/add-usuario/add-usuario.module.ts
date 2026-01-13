import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddUsuarioPageRoutingModule } from './add-usuario-routing.module';

import { AddUsuarioPage } from './add-usuario.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddUsuarioPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddUsuarioPage]
})
export class AddUsuarioPageModule {}
