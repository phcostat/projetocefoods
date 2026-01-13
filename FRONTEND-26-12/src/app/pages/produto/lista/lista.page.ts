// src/app/pages/loja/meus-produtos/meus-produtos.page.ts
/*
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service'; //antes Usuario era importado aqui
import { Usuario } from 'src/app/model/usuario'; //essa linha nao existia
import { LojaService, Loja } from 'src/app/services/loja.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  standalone: false
})
export class ListaPage implements OnInit {

  usuario?: Usuario | null;
  loja?: Loja | undefined;
  produtos: Produto[] = [];
  nomeUsuario = '';

  constructor(
    private produtoService: ProdutoService,
    private authService: AuthService,
    private lojaService: LojaService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.usuario = this.authService.getUsuarioLogado();
    if (this.usuario) {
      this.nomeUsuario = this.usuario.nome || this.usuario.login || 'Usuário';

      this.lojaService.getByUsuario(this.usuario.idUsuario).subscribe(loja => {
        this.loja = loja; // agora recebe o objeto Loja (ou undefined)

        if (this.loja) {
          this.produtos = this.produtoService.getByLoja(this.loja.idLoja);
        }
      });
    }
  }


  editarProduto(p: Produto) {
    this.router.navigate(['/cadastro-produto', p.id]);
  }

  async adicionarEstoque(produto: Produto) {
    const alert = await this.alertCtrl.create({
      header: 'Adicionar estoque',
      inputs: [
        {
          name: 'quantidade',
          type: 'number',
          placeholder: 'Quantidade a adicionar',
          min: 1
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adicionar',
          handler: (data) => {
            const qtd = parseInt(data.quantidade, 10);
            if (!isNaN(qtd) && qtd > 0) {
              produto.quant += qtd;
              this.produtoService.update(produto);
              this.carregarDados();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  alternarDisponibilidade(produto: Produto) {
    produto.disponivel = !produto.disponivel;
    this.produtoService.update(produto);
    this.carregarDados();
  }


  novoProduto() {
    this.router.navigate(['/cadastro-produto']);
  }

  async excluirProduto(produto: Produto) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar exclusão',
      message: `Deseja realmente excluir o produto "${produto.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.produtoService.delete(produto.id);
            this.carregarDados();
          }
        }
      ]
    });
    await alert.present();
  }

  irMenu() {
    this.router.navigate(['/inicio']);
  }

  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
  }

  irMinhaLoja() {
    this.router.navigate(['/minha-loja']);
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
} */

// src/app/pages/loja/meus-produtos/meus-produtos.page.ts
// src/app/pages/lista/lista.page.ts
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  standalone: false
})
export class ListaPage implements OnInit {

  usuario?: Usuario | null;
  loja?: Loja | undefined;
  produtos: Produto[] = [];
  nomeUsuario = '';

  constructor(
    private produtoService: ProdutoService,
    private authService: AuthService,
    private lojaService: LojaService,
    private alertCtrl: AlertController,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.usuario = this.authService.getUsuarioLogado();
    if (this.usuario) {
      this.nomeUsuario = this.usuario.nome || this.usuario.login || 'Usuário';

      this.lojaService.getByUsuario(this.usuario.idUsuario).subscribe(loja => {
        this.loja = loja;
        if (this.loja) {
          this.produtoService.getByLoja(this.loja.idLoja).subscribe(produtos => {
            this.produtos = produtos;
          });
        }
      });
    }
  }

  editarProduto(p: Produto) {
    this.router.navigate(['/cadastro-produto', p.idProduto]);
  }

  async adicionarEstoque(produto: Produto) {
    const alert = await this.alertCtrl.create({
      header: 'Adicionar estoque',
      inputs: [
        {
          name: 'quantidade',
          type: 'number',
          placeholder: 'Quantidade a adicionar',
          min: 1
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adicionar',
          handler: (data) => {
            const qtd = parseInt(data.quantidade, 10);
            if (!isNaN(qtd) && qtd > 0) {
              const dto = {
                idLoja: produto.loja?.idLoja || produto.idLoja,
                idCategoria: produto.categoria?.idCategoria || produto.idCategoria,
                nome: produto.nome,
                descricao: produto.descricao,
                preco: produto.preco,
                imagem: produto.imagem || produto.foto,
                estoque: (produto.estoque || 0) + qtd,
                estoqueMinimo: produto.estoqueMinimo || 0,
                disponivel: produto.disponivel
              };

              this.produtoService.update(produto.idProduto, dto).subscribe(() => {
                this.carregarDados();
              }, err => {
                console.error('Erro ao adicionar estoque', err);
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  alternarDisponibilidade(produto: Produto) {
    const dto = {
      idLoja: produto.loja?.idLoja || produto.idLoja,
      idCategoria: produto.categoria?.idCategoria || produto.idCategoria,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      imagem: produto.imagem || produto.foto,
      estoque: produto.estoque ?? 0,
      estoqueMinimo: produto.estoqueMinimo ?? 0,
      disponivel: !produto.disponivel
    };

    this.produtoService.update(produto.idProduto, dto).subscribe(() => {
      this.carregarDados();
    }, err => {
      console.error('Erro ao alternar disponibilidade', err);
    });
  }


  novoProduto() {
    this.router.navigate(['/cadastro-produto']);
  }

  async excluirProduto(produto: Produto) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar exclusão',
      message: `Deseja realmente excluir o produto "${produto.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.produtoService.delete(produto.idProduto).subscribe(() => {
              this.carregarDados();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  irMenu() {
    this.router.navigate(['/inicio']);
  }

  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
  }

  irMinhaLoja() {
    this.router.navigate(['/minha-loja']);
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}



