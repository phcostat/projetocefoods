import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, SegmentCustomEvent } from '@ionic/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDataService } from '../../../services/admin-data.service';
import {
  AdminComentario,
  AdminComentarioCanal,
  AdminComentarioStatus
} from '../admin.types';

@Component({
  selector: 'app-admin-comentarios',
  templateUrl: './admin-comentarios.page.html',
  styleUrls: ['./admin-comentarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminComentariosPage {
  private search$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<'todos' | AdminComentarioStatus>('todos');
  private canal$ = new BehaviorSubject<'todos' | AdminComentarioCanal>('todos');

  readonly comentarios$ = this.adminData.comentarios$;
  readonly filteredComentarios$ = combineLatest([
    this.comentarios$,
    this.search$,
    this.status$,
    this.canal$
  ]).pipe(
    map(([comentarios, termo, status, canal]) =>
      comentarios.filter(comentario => {
        const normalized = termo.toLowerCase();
        const matchesTermo =
          comentario.mensagem.toLowerCase().includes(normalized) ||
          comentario.usuario.toLowerCase().includes(normalized) ||
          comentario.loja.toLowerCase().includes(normalized);
        const matchesStatus = status === 'todos' ? true : comentario.status === status;
        const matchesCanal = canal === 'todos' ? true : comentario.canal === canal;
        return matchesTermo && matchesStatus && matchesCanal;
      })
    )
  );

  selectedComentario: AdminComentario | null = null;

  constructor(private adminData: AdminDataService) {}

  atualizarBusca(ev: CustomEvent<{ value?: string | null }>): void {
    this.search$.next(ev.detail.value ?? '');
  }

  atualizarStatus(ev: SegmentCustomEvent): void {
    const value = ev.detail.value as 'todos' | AdminComentarioStatus;
    this.status$.next(value ?? 'todos');
  }

  atualizarCanal(ev: CustomEvent<{ value?: string | null }>): void {
    const value = ev.detail.value as 'todos' | AdminComentarioCanal;
    this.canal$.next(value ?? 'todos');
  }

  selecionar(comentario: AdminComentario): void {
    this.selectedComentario = { ...comentario };
  }

  limparSelecao(): void {
    this.selectedComentario = null;
  }

  atualizarStatusComentario(status: AdminComentarioStatus, comentario?: AdminComentario): void {
    const target = comentario ?? this.selectedComentario;
    if (!target) {
      return;
    }
    this.adminData.updateComentarioStatus(target.id, status);
    if (!comentario && this.selectedComentario?.id === target.id) {
      this.selectedComentario = { ...this.selectedComentario, status };
    }
    if (!comentario) {
      this.limparSelecao();
    }
  }

  removerComentario(comentario?: AdminComentario): void {
    const target = comentario ?? this.selectedComentario;
    if (!target) {
      return;
    }
    this.adminData.removeComentario(target.id);
    if (!comentario) {
      this.limparSelecao();
    }
  }

  trackById(_: number, comentario: AdminComentario): number {
    return comentario.id;
  }
}

