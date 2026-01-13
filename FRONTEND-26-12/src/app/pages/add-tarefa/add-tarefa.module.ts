import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddTarefaPageRoutingModule } from './add-tarefa-routing.module';

import { AddTarefaPage } from './add-tarefa.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddTarefaPageRoutingModule,
    ReactiveFormsModule
    
  ],
  declarations: [AddTarefaPage]
})
export class AddTarefaPageModule {}
