import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-etapa1',
  templateUrl: './etapa1.page.html',
  styleUrls: ['./etapa1.page.scss'],
  standalone: false
})
export class Etapa1Page {
  nome = '';
  sobrenome = '';
  email = '';
  telefone = '';
  senha = '';

  constructor(private router: Router, private navCtrl: NavController) {}

  // Máscara de telefone: (99) 99999-9999
  mascaraTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);

    if (valor.length <= 10) {
      this.telefone = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      this.telefone = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  }

  proximo() {
    if (!this.nome || !this.sobrenome || !this.email || !this.senha || !this.telefone) {
      alert('Preencha todos os campos!');
      return;
    }

    const dadosEtapa1 = {
      nome: this.nome,
      sobrenome: this.sobrenome,
      email: this.email,
      telefone: this.telefone,
      senha: this.senha
    };
    localStorage.setItem('cadastroTemp', JSON.stringify(dadosEtapa1));

    this.router.navigate(['/etapa2']);
  }

  voltarLogin() {
  this.navCtrl.navigateBack('/login'); // ajuste a rota se necessário
}
}
