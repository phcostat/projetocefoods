import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service';
import { LojaService } from 'src/app/services/loja.service';
import { CategoriaService, Categoria } from 'src/app/services/categoria.service';

@Component({
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.page.html',
  styleUrls: ['./cadastro-produto.page.scss'],
  standalone: false
})
export class CadastroPage implements OnInit, OnDestroy {
  produto: Produto = {
    idProduto: 0,
    nome: '',
    descricao: '',
    preco: 0,
    imagem: '',
    estoque: 0,
    estoqueMinimo: 0,
    disponivel: true,
    foto: '',
    idLoja: 0,
    idCategoria: 0,
    loja: { idLoja: 0, nomeFantasia: '', descricao: '' },
    categoria: { idCategoria: 0, nome: '', descricao: '' }
  };

  categorias: Categoria[] = [];
  editMode = false;
  imagemPreview: string | null = null;
  imagemArquivo: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private lojaService: LojaService,
    private categoriaService: CategoriaService,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe(cats => (this.categorias = cats));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.produtoService.getById(Number(idParam)).subscribe(prod => {
        if (!prod) {
          return;
        }
        this.produto = { ...prod };
        this.editMode = true;
        this.imagemPreview = this.produto.imagem || this.produto.foto || null;
      });
    } else {
      const usuario = this.authService.getUsuarioLogado();
      if (usuario) {
        this.lojaService.getByUsuario(usuario.idUsuario).subscribe(loja => {
          if (loja) {
            this.produto.idLoja = loja.idLoja;
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl(this.imagemPreview);
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      return;
    }

    this.revokeBlobUrl(this.imagemPreview);
    this.imagemArquivo = file;
    this.imagemPreview = URL.createObjectURL(file);
  }

  salvar(): void {
    if (!this.produto.nome || !this.produto.preco) {
      alert('Preencha pelo menos o nome e o preço do produto.');
      return;
    }

    const dto = {
      idLoja: this.produto.idLoja || this.produto.loja?.idLoja,
      idCategoria: this.produto.idCategoria || this.produto.categoria?.idCategoria,
      nome: this.produto.nome,
      descricao: this.produto.descricao,
      preco: this.produto.preco,
      imagem: this.produto.imagem || this.produto.foto,
      estoque: this.produto.estoque,
      estoqueMinimo: this.produto.estoqueMinimo,
      disponivel: this.produto.disponivel
    };

    if (this.editMode) {
      this.produtoService.update(this.produto.idProduto, dto).subscribe(async () => {
        await this.enviarImagemSeNecessaria(this.produto.idProduto);
        this.router.navigate(['/lista']);
      });
    } else {
      this.produtoService.create(dto).subscribe(async produtoCriado => {
        await this.enviarImagemSeNecessaria(produtoCriado.idProduto);
        this.router.navigate(['/lista']);
      });
    }
  }

  private async enviarImagemSeNecessaria(idProduto: number): Promise<void> {
    if (!this.imagemArquivo) {
      return;
    }
    try {
      const produtoAtualizado = await firstValueFrom(
        this.produtoService.uploadImagem(idProduto, this.imagemArquivo)
      );
      this.revokeBlobUrl(this.imagemPreview);
      this.produto = produtoAtualizado;
      this.imagemPreview = produtoAtualizado.imagem || null;
      this.imagemArquivo = null;
    } catch (error) {
      console.error('Erro ao enviar imagem do produto', error);
      alert('Produto salvo, mas ocorreu um erro ao enviar a imagem.');
    }
  }

  private revokeBlobUrl(url: string | null): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  voltar(): void {
    this.navCtrl.back();
  }
}

