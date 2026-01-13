import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PesquisaPageRoutingModule } from './pesquisa-routing.module';
//import { SwiperModule } from 'swiper/angular';
import { PesquisaPage } from './pesquisa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PesquisaPageRoutingModule,
    //SwiperModule
  ],
  declarations: [PesquisaPage]
})
export class PesquisaPageModule {}
