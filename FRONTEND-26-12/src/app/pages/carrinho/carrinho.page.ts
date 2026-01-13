// src/app/pages/carrinho/carrinho.page.ts
/*import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from 'src/app/services/carrinho.service';
import { Router } from '@angular/router';
import { ProdutoService } from 'src/app/services/produto.service';
import { LojaService } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
  standalone: false
})
export class CarrinhoPage implements OnInit {
  itens: CartItem[] = [];
  total = 0;
  nomeUsuario = '';

  constructor(
    private cart: CartService,
    private router: Router,
    private produtoService: ProdutoService,
    private lojaService: LojaService,
    private authService: AuthService,
    private alertCtrl: AlertController
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
    this.itens = this.cart.getCart();
    this.total = this.cart.getTotal();
  }

  // Remove item inteiro (regra: para ajustar quantidade o usuário deve remover e re-adicionar)
  async remover(item: CartItem) {
    const a = await this.alertCtrl.create({
      header: 'Remover item',
      message: `Deseja remover "${item.nome}" do carrinho?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          handler: () => {
            this.cart.removeProduct(item.produtoId);
            this.load();
          }
        }
      ]
    });
    await a.present();
  }

  // Navegar para detalhes ou finalizar
  irFinalizar() {
    if (!this.itens.length) {
      this.alert('Carrinho vazio', 'Adicione itens antes de finalizar.');
      return;
    }
    this.router.navigate(['/finalizar']);
  }

  // quick alert util
  private async alert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  // helper para exibir nome da loja
  async nomeLoja(): Promise<string> {
    const lojaId = this.cart.getLojaId();
    if (!lojaId) return '';
    try {
      const loja = await firstValueFrom(this.lojaService.getById(lojaId));
      return loja.nomeFantasia;
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
      return '';
    }
  }
}*/

import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from 'src/app/services/carrinho.service';
import { Router } from '@angular/router';
import { LojaService } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
  standalone: false
})
export class CarrinhoPage implements OnInit {
  itens: CartItem[] = [];
  total = 0;
  nomeUsuario = '';
  lojaNome = '';


  constructor(
    private cart: CartService,
    private router: Router,
    private lojaService: LojaService,
    private authService: AuthService,
    private alertCtrl: AlertController
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
    this.itens = await this.cart.getCart();
    this.total = await this.cart.getTotal();

    if (this.itens.length) {
      const lojaId = this.itens[0].idLoja;
      try {
        const loja = await firstValueFrom(this.lojaService.getById(lojaId));
        this.lojaNome = loja?.nomeFantasia || '';
      } catch (err) {
        this.lojaNome = '';
      }
    } else {
      this.lojaNome = '';
    }
  }


  async remover(item: CartItem) {
    const a = await this.alertCtrl.create({
      header: 'Remover item',
      message: `Deseja remover "${item.nome}" do carrinho?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          handler: async () => {
            await this.cart.removeProduct(item.produtoId);
            await this.load();
          }
        }
      ]
    });
    await a.present();
  }

  irFinalizar() {
    if (!this.itens.length) {
      this.alert('Carrinho vazio', 'Adicione itens antes de finalizar.');
      return;
    }
    this.router.navigate(['/finalizar']);
  }

  private async alert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  nomeLoja(): string {
    return this.lojaNome;
  }

}


