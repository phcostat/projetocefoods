import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDataService } from '../../../services/admin-data.service';
import { AdminLoja, AdminLojaStatus, AdminLojaStatusAdm } from '../admin.types';

@Component({
  selector: 'app-admin-lojas',
  templateUrl: './admin-lojas.page.html',
  styleUrls: ['./admin-lojas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminLojasPage {
  private search$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<'todos' | AdminLojaStatus>('todos');

  readonly lojas$ = this.adminData.lojas$;
  readonly filteredLojas$ = combineLatest([this.lojas$, this.search$, this.status$]).pipe(
    map(([lojas, termo, status]) =>
      lojas.filter(loja => {
        const normalized = termo.toLowerCase();
        const matchesTermo =
          loja.nome.toLowerCase().includes(normalized) ||
          loja.responsavel.toLowerCase().includes(normalized) ||
          loja.cidade.toLowerCase().includes(normalized);
        const matchesStatus = status === 'todos' ? true : loja.status === status;
        return matchesTermo && matchesStatus;
      })
    )
  );

  selectedLoja: AdminLoja | null = null;

  constructor(private adminData: AdminDataService) {}

  atualizarBusca(ev: CustomEvent<{ value?: string | null }>): void {
    this.search$.next(ev.detail.value ?? '');
  }

  atualizarStatus(ev: CustomEvent<{ value?: string | null }>): void {
    const value = ev.detail.value as 'todos' | AdminLojaStatus;
    this.status$.next(value ?? 'todos');
  }

  abrirDetalhes(loja: AdminLoja): void {
    this.selectedLoja = { ...loja };
  }

  alternarOperacao(loja: AdminLoja): void {
    const nextStatus: AdminLojaStatus = loja.status === 'operando' ? 'fechada' : 'operando';
    this.alterarStatus(loja, nextStatus);
  }

  alterarStatus(loja: AdminLoja, status: AdminLojaStatus): void {
    this.adminData.updateLojaStatus(loja.id, status);
    if (this.selectedLoja?.id === loja.id) {
      this.selectedLoja = { ...this.selectedLoja, status };
    }
  }

  alterarStatusAdm(loja: AdminLoja, statusAdm: AdminLojaStatusAdm): void {
    this.adminData.updateLojaStatusAdm(loja.id, statusAdm);
    if (this.selectedLoja?.id === loja.id) {
      const derivedStatus: AdminLojaStatus = statusAdm === 'SUSPENSA'
        ? 'suspensa'
        : (this.selectedLoja.status === 'suspensa' ? 'fechada' : this.selectedLoja.status);
      this.selectedLoja = { ...this.selectedLoja, statusAdm, status: derivedStatus };
    }
  }

  removerLoja(loja: AdminLoja): void {
    this.adminData.removeLoja(loja.id);
    if (this.selectedLoja?.id === loja.id) {
      this.selectedLoja = null;
    }
  }

  fecharDetalhes(): void {
    this.selectedLoja = null;
  }

  trackById(_: number, loja: AdminLoja): number {
    return loja.id;
  }
}
