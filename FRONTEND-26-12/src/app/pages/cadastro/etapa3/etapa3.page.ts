import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';

@Component({
  selector: 'app-etapa3',
  templateUrl: './etapa3.page.html',
  styleUrls: ['./etapa3.page.scss'],
  standalone: false
})
export class Etapa3Page {
  chavePix = '';
  fotoPreview: string | null = null;
  fotoSelecionada: File | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  selecionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      return;
    }

    if (this.fotoPreview) {
      URL.revokeObjectURL(this.fotoPreview);
    }

    this.fotoSelecionada = file;
    this.fotoPreview = URL.createObjectURL(file);
  }

  voltar() {
    this.router.navigate(['/etapa2']);
  }

  async finalizarCadastro() {
    const dados = JSON.parse(localStorage.getItem('cadastroTemp') || '{}');

    if (!dados.nome || !dados.sobrenome || !dados.email || !dados.senha ||
        !dados.cpf || !dados.dataNascimento || !dados.tipoUsuario || !dados.login) {
      alert('Dados incompletos!');
      return;
    }

    const nomeCompleto = `${dados.nome} ${dados.sobrenome}`;

    const novoUsuario: Partial<Usuario> = {
      nome: nomeCompleto,
      login: dados.login,
      email: dados.email,
      senha: dados.senha,
      telefone: dados.telefone || '',
      cpf: dados.cpf,
      dataNascimento: dados.dataNascimento,
      tipoUsuario: dados.tipoUsuario,
      tipoPerfil: 'comprador',
      possuiLoja: false,
      chavePix: this.chavePix || ''
    };

    try {
      const usuarioCriado = await this.authService.cadastrarUsuarioApi(novoUsuario);

      if (this.fotoSelecionada && usuarioCriado.idUsuario) {
        await this.authService.uploadFotoPerfil(usuarioCriado.idUsuario, this.fotoSelecionada);
        if (this.fotoPreview) {
          URL.revokeObjectURL(this.fotoPreview);
        }
        this.fotoPreview = null;
        this.fotoSelecionada = null;
      }

      localStorage.removeItem('cadastroTemp');
      alert('Cadastro concluído com sucesso!');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao cadastrar usuário via API:', error);
      alert('Erro ao cadastrar. Verifique os dados e tente novamente.');
    }
  }
}
