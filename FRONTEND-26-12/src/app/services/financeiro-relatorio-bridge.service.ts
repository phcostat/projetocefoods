import { Injectable } from '@angular/core';

export interface SnapshotProduto {
  nome: string;
  total: number;
  quantidade: number;
}

export interface SnapshotReceitaDia {
  iso: string;
  label: string;
  total: number;
}

export interface FinanceiroSnapshot {
  lojaId: number;
  lojaNome?: string;
  receitaTotal: number;
  ticketMedio: number;
  pedidosRecebidos: number;
  pedidosAceitos: number;
  pedidosRecusados: number;
  itensVendidos: number;
  taxaConversao: number;
  atualizadoEm: string;
  periodoReferencia?: { inicio: string; fim: string };
  topProdutos: SnapshotProduto[];
  receitaDiaria: SnapshotReceitaDia[];
}

@Injectable({ providedIn: 'root' })
export class FinanceiroRelatorioBridgeService {
  private readonly storageKey = 'cefoods_finance_snapshots';
  private cache: Record<string, FinanceiroSnapshot> = this.loadFromStorage();

  setSnapshot(snapshot: FinanceiroSnapshot): void {
    if (!snapshot?.lojaId) {
      return;
    }
    this.cache[snapshot.lojaId.toString()] = snapshot;
    this.persist();
  }

  getSnapshot(lojaId?: number | null): FinanceiroSnapshot | null {
    if (!lojaId) {
      return null;
    }
    return this.cache[lojaId.toString()] ?? null;
  }

  clearSnapshot(lojaId: number): void {
    delete this.cache[lojaId.toString()];
    this.persist();
  }

  private loadFromStorage(): Record<string, FinanceiroSnapshot> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as Record<string, FinanceiroSnapshot>) : {};
    } catch (error) {
      console.warn('Não foi possível carregar snapshots financeiros salvos.', error);
      return {};
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Não foi possível salvar snapshot financeiro.', error);
    }
  }
}
