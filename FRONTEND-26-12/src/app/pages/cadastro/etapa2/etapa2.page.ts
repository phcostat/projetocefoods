import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-etapa2',
  templateUrl: './etapa2.page.html',
  styleUrls: ['./etapa2.page.scss'],
  standalone: false
})
export class Etapa2Page {
  cpf = '';
  dataNascimento = '';
  tipoUsuario = '';
  login = '';

  tipos = [
    { value: 'aluno', label: 'Aluno', icon: 'school-outline', desc: 'Acesso como estudante' },
    { value: 'professor', label: 'Professor', icon: 'book-outline', desc: 'Acesso como docente' },
    { value: 'funcionario', label: 'Funcionário', icon: 'briefcase-outline', desc: 'Acesso como colaborador' },
    { value: 'visitante', label: 'Visitante', icon: 'person-outline', desc: 'Acesso temporário' },
  ];

  constructor(private router: Router) {}

  mascaraCpf(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    this.cpf = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  }

  selecionarTipo(valor: string) {
    this.tipoUsuario = valor;
  }

  voltar() {
    this.router.navigate(['/etapa1']);
  }

  proximo() {
    if (!this.cpf || !this.dataNascimento || !this.tipoUsuario || !this.login) {
      alert('Preencha todos os campos!');
      return;
    }

    const etapa1 = JSON.parse(localStorage.getItem('cadastroTemp') || '{}');
    const dadosEtapa2 = { cpf: this.cpf, dataNascimento: this.dataNascimento, tipoUsuario: this.tipoUsuario, login: this.login };
    localStorage.setItem('cadastroTemp', JSON.stringify({ ...etapa1, ...dadosEtapa2 }));

    this.router.navigate(['/etapa3']);
  }
}
