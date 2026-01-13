import { Component, OnInit } from '@angular/core';
import { Tarefa} from 'src/app/model/tarefa';
import { TarefaService } from 'src/app/services/tarefa.service';
import { Tipo} from 'src/app/model/tipo';
import { TipoService } from 'src/app/services/tipo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-tarefa',
  templateUrl: './add-tarefa.page.html',
  styleUrls: ['./add-tarefa.page.scss'],
  standalone: false
})
export class AddTarefaPage implements OnInit {

  tarefa: Tarefa;
  tipos: Tipo[];
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private toastController: ToastController, private activatedRoute: ActivatedRoute, private navController: NavController, private tipoService: TipoService, private tarefaService: TarefaService) { 
    this.tarefa = new Tarefa();
    this.tipos = [];
    this.formGroup = this.formBuilder.group({
      'descricao': [this.tarefa.descricao, Validators.compose([Validators.required])],
      'data': [this.tarefa.data, Validators.compose([Validators.required])],
      'tipo': [this.tarefa.tipo, Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    this.tipos = this.tipoService.listar();
    let id = parseFloat(this.activatedRoute.snapshot.params['id']);
    
    if(!isNaN(id)){
      this.tarefa = this.tarefaService.buscarPorId(id);      
      // Garante que this.tarefa.tipo seja exatamente um dos objetos em this.tipos
      let tipo  = this.tipos.find(t => t.id === this.tarefa.tipo.id);
      if (tipo) {
        this.tarefa.tipo = tipo;
      }
    }

    this.formGroup.get('descricao')?.setValue(this.tarefa.descricao);
    this.formGroup.get('data')?.setValue(this.tarefa.data);
    this.formGroup.get('tipo')?.setValue(this.tarefa.tipo);
  }

  salvar(){  
    this.tarefa.descricao = this.formGroup.value.descricao;
    this.tarefa.data = this.formGroup.value.data;
    this.tarefa.tipo = this.formGroup.value.tipo;
    this.tarefaService.salvar(this.tarefa);
    this.exibirMensagem('Registro salvo com sucesso!!!');
    this.navController.navigateBack('/tarefa');
  }

  async exibirMensagem(texto: string){
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }

}

