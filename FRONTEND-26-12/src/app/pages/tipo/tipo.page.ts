import { Component, OnInit } from '@angular/core';
import { Tipo} from 'src/app/model/tipo';
import { TipoService } from 'src/app/services/tipo.service';
import { ToastController} from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tipo',
  templateUrl: './tipo.page.html',
  styleUrls: ['./tipo.page.scss'],
  standalone: false
})
export class TipoPage implements OnInit {
  tipos: Tipo[];

  constructor(private tipoService: TipoService, private toastController: ToastController, private alertController: AlertController) { 
    this.tipos = []
  }

  ngOnInit() {
    this.tipos = this.tipoService.listar();
  }

  ionViewWillEnter(){
    this.tipos = this.tipoService.listar();
  }

  async excluir(tipo: Tipo){

    const alert = await this.alertController.create({
      header: 'Confirma a exclusão',
      message: tipo.descricao,
      buttons:[
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          cssClass: 'danger',
          handler: () => {
            this.tipoService.excluir(tipo.id);
            this.tipos = this.tipoService.listar();
            this.exibirMensagem('Registro excluído com sucesso!!!');
          }
        }
      ]
    })
    await alert.present()
  }

  async exibirMensagem(texto: string){
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}

