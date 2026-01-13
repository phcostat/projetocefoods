import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/model/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add-usuario',
  templateUrl: './add-usuario.page.html',
  styleUrls: ['./add-usuario.page.scss'],
  standalone: false
})
export class AddUsuarioPage  {
/*
  usuario: Usuario;
  formGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private toastController: ToastController, private navController: NavController, private usuarioService: UsuarioService) {
    this.usuario = new Usuario();
    this.formGroup = this.formBuilder.group({
      'nome': [this.usuario.nome, Validators.compose([Validators.required])],
      'login': [this.usuario.login, Validators.compose([Validators.required])],
      'senha': [this.usuario.senha, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
  }

  salvar() {
    this.usuario.nome = this.formGroup.value.nome;
    this.usuario.login = this.formGroup.value.login;
    this.usuario.senha = this.formGroup.value.senha;

    if (this.usuarioService.verificarLogin(this.usuario.login)) {
      this.exibirMensagem('O login informado já existe.');
    } else {
      this.usuarioService.salvar(this.usuario);
      this.exibirMensagem('Registro salvo com sucesso!!!');
      this.navController.navigateBack('/login');
    }
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }*/

}
