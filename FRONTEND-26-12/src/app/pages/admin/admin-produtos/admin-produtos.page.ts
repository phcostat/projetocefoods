import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDataService } from '../../../services/admin-data.service';
import { AdminProduto, AdminProdutoStatus } from '../admin.types';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-produtos',
  templateUrl: './admin-produtos.page.html',
  styleUrls: ['./admin-produtos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminProdutosPage {
  private search$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<'todos' | AdminProdutoStatus>('todos');
  private estoqueCritico$ = new BehaviorSubject<boolean>(false);
  private lojaFiltro$ = new BehaviorSubject<'todas' | number>('todas');
  private readonly apiBase = environment.apiUrl.replace(/\/$/, '');

  readonly produtos$ = this.adminData.produtos$;
  readonly lojas$ = this.adminData.lojas$;

  readonly filteredProdutos$ = combineLatest([
    this.produtos$,
    this.search$,
    this.status$,
    this.estoqueCritico$,
    this.lojaFiltro$,
    this.lojas$
  ]).pipe(
    map(([produtos, termo, status, somenteCriticos, lojaFiltro, lojas]) => {
      const lojasPorId = new Map(lojas.map(loja => [loja.id, loja.nome]));
      const lojaFiltroId = lojaFiltro === 'todas' ? null : lojaFiltro;

      return produtos.filter(produto => {
        const matchesSearch = produto.nome.toLowerCase().includes(termo.toLowerCase()) ||
          produto.loja.toLowerCase().includes(termo.toLowerCase());
        const matchesStatus = status === 'todos' ? true : produto.status === status;
        const matchesCritico = somenteCriticos ? produto.estoque <= 10 : true;
        const matchesLoja = lojaFiltroId === null
          ? true
          : (produto.lojaId ? produto.lojaId === lojaFiltroId : produto.loja === (lojasPorId.get(lojaFiltroId) ?? ''));
        return matchesSearch && matchesStatus && matchesCritico && matchesLoja;
      });
    })
  );

  selectedProduto: AdminProduto | null = null;

  constructor(private adminData: AdminDataService) {}

  atualizarBusca(ev: CustomEvent<{ value?: string | null }>): void {
    this.search$.next(ev.detail.value ?? '');
  }

  atualizarStatus(ev: CustomEvent<{ value?: string | null }>): void {
    const value = ev.detail.value as 'todos' | AdminProdutoStatus;
    this.status$.next(value ?? 'todos');
  }

  alternarCritico(ev: CustomEvent): void {
    this.estoqueCritico$.next((ev?.detail?.checked ?? false) as boolean);
  }

  atualizarLojaFiltro(ev: CustomEvent<{ value?: string | number | null }>): void {
    const value = ev.detail.value;
    if (value === null || value === undefined || value === 'todas') {
      this.lojaFiltro$.next('todas');
      return;
    }
    const numericValue = typeof value === 'number' ? value : Number(value);
    this.lojaFiltro$.next(Number.isFinite(numericValue) ? numericValue : 'todas');
  }

  abrirDetalhes(produto: AdminProduto): void {
    this.selectedProduto = { ...produto };
  }

  atualizarStatusProduto(produto: AdminProduto, status: AdminProdutoStatus): void {
    this.adminData.updateProdutoStatus(produto.id, status);
    if (this.selectedProduto?.id === produto.id) {
      this.selectedProduto = { ...this.selectedProduto, status };
    }
  }

  ocultarProduto(produto: AdminProduto): void {
    this.atualizarStatusProduto(produto, 'indisponivel');
  }

  reativarProduto(produto: AdminProduto): void {
    this.atualizarStatusProduto(produto, 'ativo');
  }

  removerProduto(produto: AdminProduto): void {
    this.adminData.removeProduto(produto.id);
    if (this.selectedProduto?.id === produto.id) {
      this.selectedProduto = null;
    }
  }

  fecharDetalhes(): void {
    this.selectedProduto = null;
  }

  trackById(_: number, produto: AdminProduto): number {
    return produto.id;
  }

  resolveImagem(produto: AdminProduto | null | undefined): string {
    if (!produto) {
      return 'assets/imagem-produto.png';
    }
    const raw = produto.imagem || produto.foto || '';
    if (!raw) {
      return 'assets/imagem-produto.png';
    }
    if (/^(?:https?:|data:|assets\/|blob:)/i.test(raw)) {
      return raw;
    }
    if (raw.startsWith('/')) {
      return `${this.apiBase}${raw}`;
    }
    return `${this.apiBase}/${raw}`;
  }
}
