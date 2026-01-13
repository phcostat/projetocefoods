import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { IndexPageRoutingModule } from './index-routing.module';
import { IndexPage } from './index.page';

@NgModule({
  imports: [CommonModule, IonicModule, IndexPageRoutingModule],
  declarations: [IndexPage]
})
export class IndexPageModule {}
