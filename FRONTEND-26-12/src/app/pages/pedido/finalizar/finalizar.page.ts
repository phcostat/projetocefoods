// src/app/pages/finalizar/finalizar.page.ts
/*import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/carrinho.service';
import { LojaService } from 'src/app/services/loja.service';
import { ProdutoService } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service';
import { PedidoService, Pedido, PedidoItem } from 'src/app/services/pedido.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-finalizar',
  templateUrl: './finalizar.page.html',
  styleUrls: ['./finalizar.page.scss'],
  standalone: false
})
export class FinalizarPage implements OnInit {
  itensCart: any[] = [];
  valorTotal = 0;
  formasPagamento: string[] = [];
  formaSelecionada = '';
  horarioRetirada = 'Agora';
  horariosDisponiveis: string[] = [];
  nomeUsuario = '';
  loja: any;

  constructor(
    private cart: CartService,
    private lojaService: LojaService,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private pedidoService: PedidoService,
    private router: Router,
    private alertCtrl: AlertController,
    private location: Location
  ) { }

  ngOnInit() {
    this.load();
    const u = this.authService.getUsuarioLogado();
    if (u) this.nomeUsuario = u.nome || u.login || 'Usuário';
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.itensCart = this.cart.getCart();
    this.valorTotal = this.cart.getTotal();

    const lojaId = this.cart.getLojaId();
    if (lojaId) {
      this.loja = this.lojaService.getById(lojaId);

      if (this.loja) {
        // Monta lista de formas de pagamento com base nos booleans
        this.formasPagamento = [];
        if (this.loja.aceitaPix) this.formasPagamento.push('PIX');
        if (this.loja.aceitaDinheiro) this.formasPagamento.push('Dinheiro');
        if (this.loja.aceitaCartao) this.formasPagamento.push('Cartão');

        this.formaSelecionada = this.formasPagamento.length ? this.formasPagamento[0] : '';
      }
    } else {
      this.formasPagamento = [];
      this.formaSelecionada = '';
    }

    this.buildHorarios();
  }

  buildHorarios() {
    this.horariosDisponiveis = ['Agora'];

    if (!this.loja || !this.loja.horarioFuncionamento) return;

    // Pega o dia da semana atual
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = diasSemana[new Date().getDay()];

    const funcionamentoHoje = this.loja.horarioFuncionamento[hoje];

    // Gera horários somente dentro dos turnos abertos
    if (funcionamentoHoje?.manha) {
      for (let h = 7; h < 12; h++) {
        this.addHorarios(h);
      }
    }
    if (funcionamentoHoje?.tarde) {
      for (let h = 12; h < 18; h++) {
        this.addHorarios(h);
      }
    }
    if (funcionamentoHoje?.noite) {
      for (let h = 18; h <= 22; h++) {
        this.addHorarios(h);
      }
    }
  }

  private addHorarios(hora: number) {
    for (let m of [0, 30]) {
      const hh = String(hora).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      this.horariosDisponiveis.push(`${hh}:${mm}`);
    }
  }

  async confirmarPedido() {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      await this.showAlert('Erro', 'Faça login para finalizar pedido');
      return;
    }
    if (!this.itensCart.length) {
      await this.showAlert('Erro', 'Carrinho vazio');
      return;
    }
    if (!this.formaSelecionada) {
      await this.showAlert('Erro', 'Selecione forma de pagamento');
      return;
    }

    // Verifica se horário escolhido está disponível
    if (!this.horariosDisponiveis.includes(this.horarioRetirada)) {
      await this.showAlert('Erro', 'Horário de retirada inválido ou fora do funcionamento da loja.');
      return;
    }

    const lojaId = this.cart.getLojaId()!;
    const itens: PedidoItem[] = this.itensCart.map(it => ({
      produtoId: it.produtoId,
      nome: it.nome,
      preco: it.precoUnit,
      quantidade: it.quantidade
    }));

    // Verifica estoque
    for (const it of itens) {
      const p = this.produtoService.getById(it.produtoId);
      if (!p) {
        await this.showAlert('Erro', `Produto ${it.nome} não encontrado.`);
        return;
      }
      if (p.quant < it.quantidade) {
        await this.showAlert('Erro', `Estoque insuficiente para ${it.nome}.`);
        return;
      }
    }

    // Aplica redução de estoque
    for (const it of itens) {
      const p = this.produtoService.getById(it.produtoId)!;
      p.quant -= it.quantidade;
      this.produtoService.update(p);
    }

    const pedido: Pedido = {
      id: Date.now(),
      idUsuario: usuario.idUsuario,
      idLoja: lojaId,
      nomeCliente: this.nomeUsuario,
      formaPagamento: this.formaSelecionada,
      total: Number(this.valorTotal.toFixed(2)),
      status: 'pending',
      data: new Date().toISOString(),
      horarioRetirada: this.horarioRetirada,
      itens
    };

    this.pedidoService.addPedido(pedido);
    this.cart.clearCart();

    await this.showAlert('Pedido realizado', 'Pedido enviado. Aguarde a confirmação da loja.');
    this.router.navigate(['/perfil']);
  }

  private async showAlert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
} */


  //---------------------------










// src/app/pages/finalizar/finalizar.page.ts
/*import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/carrinho.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service';
import { PedidoService, Pedido, PedidoItem } from 'src/app/services/pedido.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-finalizar',
  templateUrl: './finalizar.page.html',
  styleUrls: ['./finalizar.page.scss'],
  standalone: false
})
export class FinalizarPage implements OnInit {
  itensCart: any[] = [];
  valorTotal = 0;
  formasPagamento: string[] = [];
  formaSelecionada = '';
  horarioRetirada = 'Agora';
  horariosDisponiveis: string[] = [];
  nomeUsuario = '';
  loja?: Loja;

  constructor(
    private cart: CartService,
    private lojaService: LojaService,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private pedidoService: PedidoService,
    private router: Router,
    private alertCtrl: AlertController,
    private location: Location
  ) { }

  ngOnInit() {
    this.load();
    const u = this.authService.getUsuarioLogado();
    if (u) this.nomeUsuario = u.nome || u.login || 'Usuário';
  }

  ionViewWillEnter() {
    this.load();
  }

  async load() {
    this.itensCart = this.cart.getCart();
    this.valorTotal = this.cart.getTotal();

    const lojaId = this.cart.getLojaId();
    if (lojaId) {
      try {
        this.loja = await firstValueFrom(this.lojaService.getById(lojaId));

        if (this.loja) {
          // Formas de pagamento
          this.formasPagamento = [];
          if (this.loja.aceitaPix) this.formasPagamento.push('PIX');
          if (this.loja.aceitaDinheiro) this.formasPagamento.push('Dinheiro');
          if (this.loja.aceitaCartao) this.formasPagamento.push('Cartão');
          this.formaSelecionada = this.formasPagamento.length ? this.formasPagamento[0] : '';

          // Construir horários dinamicamente
          this.buildHorarios(this.loja.horarios || []);
        }
      } catch (err) {
        console.error('Erro ao carregar loja:', err);
        this.formasPagamento = [];
        this.formaSelecionada = '';
      }
    } else {
      this.formasPagamento = [];
      this.formaSelecionada = '';
    }
  }


  buildHorarios(horarios: { diaSemana: string; turno: string }[]) {
    this.horariosDisponiveis = ['Agora'];

    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = diasSemana[new Date().getDay()].toUpperCase(); // compatível com ENUM do banco

    // Filtra os horários só do dia atual
    const horariosHoje = horarios.filter(h => h.diaSemana === hoje);

    for (const h of horariosHoje) {
      if (h.turno === 'MANHA') {
        for (let hora = 7; hora < 12; hora++) this.addHorarios(hora);
      }
      if (h.turno === 'TARDE') {
        for (let hora = 12; hora < 18; hora++) this.addHorarios(hora);
      }
      if (h.turno === 'NOITE') {
        for (let hora = 18; hora <= 22; hora++) this.addHorarios(hora);
      }
    }
  }


  private addHorarios(hora: number) {
    for (let m of [0, 30]) {
      const hh = String(hora).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      this.horariosDisponiveis.push(`${hh}:${mm}`);
    }
  }

  async confirmarPedido() {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      await this.showAlert('Erro', 'Faça login para finalizar pedido');
      return;
    }
    if (!this.itensCart.length) {
      await this.showAlert('Erro', 'Carrinho vazio');
      return;
    }
    if (!this.formaSelecionada) {
      await this.showAlert('Erro', 'Selecione forma de pagamento');
      return;
    }
    if (!this.horariosDisponiveis.includes(this.horarioRetirada)) {
      await this.showAlert('Erro', 'Horário de retirada inválido ou fora do funcionamento da loja.');
      return;
    }

    const lojaId = this.cart.getLojaId()!;
    const itens: PedidoItem[] = [];

    // === Estoque ===
    for (const it of this.itensCart) {
      const produto: Produto = await firstValueFrom(this.produtoService.getById(it.produtoId));
      if (!produto) {
        await this.showAlert('Erro', `Produto ${it.nome} não encontrado.`);
        return;
      }
      if (produto.estoque < it.quantidade) {
        await this.showAlert('Erro', `Estoque insuficiente para ${it.nome}.`);
        return;
      }

      // Abate estoque
      produto.estoque -= it.quantidade;
      await firstValueFrom(this.produtoService.update(produto.idProduto, produto));

      itens.push({
        produtoId: produto.idProduto,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: it.quantidade
      });
    }

    // === Monta pedido ===
    const pedido: Pedido = {
      id: Date.now(),
      idUsuario: usuario.idUsuario,
      idLoja: lojaId,
      nomeCliente: this.nomeUsuario,
      formaPagamento: this.formaSelecionada,
      total: Number(this.valorTotal.toFixed(2)),
      status: 'pending',
      data: new Date().toISOString(),
      horarioRetirada: this.horarioRetirada,
      itens
    };

    this.pedidoService.addPedido(pedido);
    this.cart.clearCart();

    await this.showAlert('Pedido realizado', 'Pedido enviado. Aguarde a confirmação da loja.');
    this.router.navigate(['/perfil']);
  }

  private async showAlert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}*/




//------------------------




import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/carrinho.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-finalizar',
  templateUrl: './finalizar.page.html',
  styleUrls: ['./finalizar.page.scss'],
  standalone: false
})
export class FinalizarPage implements OnInit {
  itensCart: any[] = [];
  valorTotal = 0;
  formasPagamento: string[] = [];
  formaSelecionada = '';
  horarioRetirada = 'Agora';
  horariosDisponiveis: string[] = [];
  nomeUsuario = '';
  loja?: Loja;

  constructor(
    private cart: CartService,
    private lojaService: LojaService,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private location: Location
  ) { }

  ngOnInit() {
    this.load();
    const u = this.authService.getUsuarioLogado();
    if (u) this.nomeUsuario = u.nome || u.login || 'Usuário';
  }

  ionViewWillEnter() {
    this.load();
  }

  async load() {
    this.itensCart = await this.cart.getCart();
    this.valorTotal = await this.cart.getTotal();

    const lojaId = this.itensCart.length ? this.itensCart[0].idLoja : null;
    if (lojaId) {
      try {
        this.loja = await this.lojaService.getById(lojaId).toPromise();
        if (this.loja) {
          // Formas de pagamento
          this.formasPagamento = [];
          if (this.loja.aceitaPix) this.formasPagamento.push('PIX');
          if (this.loja.aceitaDinheiro) this.formasPagamento.push('Dinheiro');
          if (this.loja.aceitaCartao) this.formasPagamento.push('Cartão');
          this.formaSelecionada = this.formasPagamento.length ? this.formasPagamento[0] : '';

          // Construir horários dinamicamente
          this.buildHorarios(this.loja.horarios || []);
        }
      } catch (err) {
        console.error('Erro ao carregar loja:', err);
        this.formasPagamento = [];
        this.formaSelecionada = '';
      }
    } else {
      this.formasPagamento = [];
      this.formaSelecionada = '';
    }
  }

  buildHorarios(horarios: { diaSemana: string; turno: string }[]) {
    this.horariosDisponiveis = ['Agora'];
    const diasSemana = ['DOMINGO','SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO'];
    const hoje = diasSemana[new Date().getDay()];
    const horariosHoje = horarios.filter(h => h.diaSemana === hoje);
    for (const h of horariosHoje) {
      if (h.turno === 'MANHA') {
        for (let hora = 7; hora < 12; hora++) this.addHorarios(hora);
      }
      if (h.turno === 'TARDE') {
        for (let hora = 12; hora < 18; hora++) this.addHorarios(hora);
      }
      if (h.turno === 'NOITE') {
        for (let hora = 18; hora <= 22; hora++) this.addHorarios(hora);
      }
    }
  }
  private addHorarios(hora: number) {
    for (let m of [0,30]) {
      const hh = String(hora).padStart(2,'0');
      const mm = String(m).padStart(2,'0');
      this.horariosDisponiveis.push(`${hh}:${mm}`);
    }
  }

  async confirmarPedido() {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      await this.showAlert('Erro', 'Faça login para finalizar pedido');
      return;
    }
    if (!this.itensCart.length) {
      await this.showAlert('Erro', 'Carrinho vazio');
      return;
    }
    if (!this.formaSelecionada) {
      await this.showAlert('Erro', 'Selecione forma de pagamento');
      return;
    }
    if (!this.horariosDisponiveis.includes(this.horarioRetirada)) {
      await this.showAlert('Erro', 'Horário de retirada inválido ou fora do funcionamento da loja.');
      return;
    }

    try {
      const resp = await this.cart.checkout(this.formaSelecionada, this.horarioRetirada);
      if (resp.success) {
        await this.showAlert('Pedido realizado', 'Pedido enviado. Número: ' + resp.idPedido);
        this.router.navigate(['/perfil']);
      } else {
        await this.showAlert('Erro', resp.message || 'Erro ao finalizar pedido');
      }
    } catch (err: any) {
      console.error('Erro ao finalizar pedido', err);
      await this.showAlert('Erro', err?.message || 'Erro desconhecido');
    }
  }

  private async showAlert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}


