import { Component, OnInit } from '@angular/core';
import { Tarefa} from 'src/app/model/tarefa';
import { TarefaService } from 'src/app/services/tarefa.service';
import { ToastController} from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tarefa',
  templateUrl: './tarefa.page.html',
  styleUrls: ['./tarefa.page.scss'],
  standalone: false
})
export class TarefaPage implements OnInit {

  tarefas: Tarefa[];
new: any;

  constructor(private tarefaService: TarefaService, private toastController: ToastController, private alertController: AlertController) { 
    this.tarefas = []
  }

  ngOnInit() {
    this.tarefas = this.tarefaService.listar();
  }

  ionViewWillEnter(){
    this.tarefas = this.tarefaService.listar();
  }

    async excluir(tarefa: Tarefa){
  
      const alert = await this.alertController.create({
        header: 'Confirma a exclusão',
        message: tarefa.descricao,
        buttons:[
          {
            text: 'Cancelar'
          },
          {
            text: 'Confirmar',
            cssClass: 'danger',
            handler: () => {
              this.tarefaService.excluir(tarefa.id);
              this.tarefas = this.tarefaService.listar();
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

    definirCor(tarefa: Tarefa): string {
      return new Date(tarefa.data) > new Date() ? 'red-text' : 'green-text';
    }
}


