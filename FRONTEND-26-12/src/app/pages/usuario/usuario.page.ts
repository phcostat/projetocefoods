import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/model/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: false
})
export class UsuarioPage  {
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
    this.usuario = this.usuarioService.buscarAutenticacao();
    this.formGroup.get('nome')?.setValue(this.usuario.nome);
    this.formGroup.get('login')?.setValue(this.usuario.login);
    this.formGroup.get('senha')?.setValue(this.usuario.senha);
  }

  salvar() {
    this.usuario.nome = this.formGroup.value.nome;
    this.usuario.senha = this.formGroup.value.senha;

    this.usuarioService.salvar(this.usuario);
    this.exibirMensagem('Registro salvo com sucesso!!!');
    this.navController.navigateBack('/inicio');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present()
  }*/

}
