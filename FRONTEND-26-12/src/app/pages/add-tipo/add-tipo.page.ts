import { Component, OnInit } from '@angular/core';
import { Tipo} from 'src/app/model/tipo';
import { TipoService } from 'src/app/services/tipo.service';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-tipo',
  templateUrl: './add-tipo.page.html',
  styleUrls: ['./add-tipo.page.scss'],
  standalone: false
})
export class AddTipoPage implements OnInit {

  tipo: Tipo;
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private toastController: ToastController, private activatedRoute: ActivatedRoute, private navController: NavController, private tipoService: TipoService) { 
    this.tipo = new Tipo();
    this.formGroup = this.formBuilder.group({
      'descricao': [this.tipo.descricao, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    let id = parseFloat(this.activatedRoute.snapshot.params['id']);
    if(!isNaN(id)){
      this.tipo = this.tipoService.buscarPorId(id);      
    }
    this.formGroup.get('descricao')?.setValue(this.tipo.descricao);
  }

  salvar(){
    this.tipo.descricao = this.formGroup.value.descricao;
    this.tipoService.salvar(this.tipo);
    this.exibirMensagem('Registro salvo com sucesso!!!');
    this.navController.navigateBack('/tipo');
  }

  async exibirMensagem(texto: string){
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }
}


