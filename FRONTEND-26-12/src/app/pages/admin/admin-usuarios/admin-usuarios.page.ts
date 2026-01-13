import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDataService } from '../../../services/admin-data.service';
import {
  AdminUsuario,
  AdminUsuarioPerfil,
  AdminUsuarioStatus
} from '../admin.types';
import { Usuario } from '../../../model/usuario';

interface Option {
  label: string;
  value: string;
}

interface UsuarioDetalhesView {
  id: number;
  nome: string;
  email: string;
  perfil: AdminUsuarioPerfil | string;
  tipoUsuario?: string | null;
  status: AdminUsuarioStatus;
  pedidosTotal: number;
  login?: string | null;
  sobrenome?: string | null;
  dataNascimento?: string | null;
  telefone?: string | null;
  cpf?: string | null;
  chavePix?: string | null;
  possuiLoja: boolean;
  emailVerificado?: boolean | null;
  ativo?: boolean;
  ultimoAcesso?: string | null;
  dataCadastro?: string | null;
  lojas: string[];
}

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.page.html',
  styleUrls: ['./admin-usuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminUsuariosPage {
  private search$ = new BehaviorSubject<string>('');
  private status$ = new BehaviorSubject<'todos' | AdminUsuarioStatus>('todos');
  private perfil$ = new BehaviorSubject<'todos' | AdminUsuarioPerfil>('todos');

  readonly usuarios$ = this.adminData.usuarios$;
  readonly filteredUsuarios$ = combineLatest([
    this.usuarios$,
    this.search$,
    this.status$,
    this.perfil$
  ]).pipe(
    map(([usuarios, termo, status, perfil]) =>
      usuarios.filter(usuario => {
        const matchesTermo = usuario.nome.toLowerCase().includes(termo.toLowerCase()) ||
          usuario.email.toLowerCase().includes(termo.toLowerCase());
        const matchesStatus = status === 'todos' ? true : usuario.status === status;
        const matchesPerfil = perfil === 'todos' ? true : usuario.perfil === perfil;
        return matchesTermo && matchesStatus && matchesPerfil;
      })
    )
  );

  readonly statusOptions: Option[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativo' },
    { label: 'Pendentes', value: 'pendente' },
    { label: 'Inativos', value: 'inativo' },
    { label: 'Suspensos', value: 'suspenso' }
  ];

  readonly perfilOptions: Option[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Clientes', value: 'cliente' },
    { label: 'Vendedores', value: 'vendedor' },
    { label: 'Administradores', value: 'admin' }
  ];

  selectedUsuario: AdminUsuario | null = null;
  detalhesUsuario: Usuario | null = null;
  detalhesView: UsuarioDetalhesView | null = null;
  detalhesCarregando = false;
  detalhesErro = '';

  constructor(private adminData: AdminDataService) {}

  atualizarPesquisa(ev: CustomEvent<{ value?: string | null }>): void {
    this.search$.next(ev.detail.value ?? '');
  }

  atualizarStatus(ev: CustomEvent<{ value?: string | null }>): void {
    const value = ev.detail.value as 'todos' | AdminUsuarioStatus;
    this.status$.next(value ?? 'todos');
  }

  atualizarPerfil(ev: CustomEvent<{ value?: string | null }>): void {
    const value = ev.detail.value as 'todos' | AdminUsuarioPerfil;
    this.perfil$.next(value ?? 'todos');
  }

  async verDetalhes(usuario: AdminUsuario): Promise<void> {
    const baseUsuario = { ...usuario };
    this.selectedUsuario = baseUsuario;
    this.detalhesUsuario = null;
    this.detalhesView = this.composeDetalhesView(baseUsuario);
    this.detalhesErro = '';
    this.detalhesCarregando = true;
    try {
      const detalhes = await this.adminData.fetchUsuarioDetalhes(usuario.id);
      this.detalhesUsuario = detalhes ?? null;
      this.detalhesView = this.composeDetalhesView(baseUsuario, detalhes ?? undefined);
    } catch (error) {
      console.error('Falha ao detalhar usuário', error);
      this.detalhesErro = 'Não foi possível carregar os dados completos do usuário.';
      this.detalhesView = this.composeDetalhesView(baseUsuario);
    } finally {
      this.detalhesCarregando = false;
    }
  }

  fecharDetalhes(): void {
    this.selectedUsuario = null;
    this.detalhesUsuario = null;
    this.detalhesView = null;
    this.detalhesErro = '';
    this.detalhesCarregando = false;
  }

  alterarStatus(usuario: AdminUsuario, status: AdminUsuarioStatus): void {
    this.adminData.updateUsuarioStatus(usuario.id, status);
    if (this.selectedUsuario?.id === usuario.id) {
      this.selectedUsuario = { ...this.selectedUsuario, status };
      if (this.detalhesUsuario) {
        this.detalhesUsuario = { ...this.detalhesUsuario, ativo: status === 'ativo' };
      }
      if (this.detalhesView) {
        this.detalhesView = {
          ...this.detalhesView,
          status,
          ativo: status === 'ativo'
        };
      }
    }
  }

  removerUsuario(usuario: AdminUsuario): void {
    this.adminData.removeUsuario(usuario.id);
    if (this.selectedUsuario?.id === usuario.id) {
      this.fecharDetalhes();
    }
  }

  trackById(_: number, usuario: AdminUsuario): number {
    return usuario.id;
  }

  private composeDetalhesView(base: AdminUsuario, detalhes?: Usuario): UsuarioDetalhesView {
    const possuiLojaDetalhe = detalhes?.possuiLoja;
    const possuiLoja = typeof possuiLojaDetalhe === 'boolean'
      ? possuiLojaDetalhe
      : typeof possuiLojaDetalhe === 'string'
        ? possuiLojaDetalhe.toLowerCase() === 'true'
        : typeof possuiLojaDetalhe === 'number'
          ? possuiLojaDetalhe > 0
          : Boolean(base.lojas?.length);

    return {
      id: detalhes?.idUsuario ?? base.id,
      nome: detalhes?.nome ?? base.nome,
      email: detalhes?.email ?? base.email,
      perfil: detalhes?.tipoPerfil ?? base.perfil,
      tipoUsuario: detalhes?.tipoUsuario ?? null,
      status: base.status,
      pedidosTotal: base.pedidosTotal,
      login: detalhes?.login ?? null,
      sobrenome: detalhes?.sobrenome ?? null,
      dataNascimento: detalhes?.dataNascimento ?? null,
      telefone: detalhes?.telefone ?? null,
      cpf: detalhes?.cpf ?? null,
      chavePix: detalhes?.chavePix ?? null,
      possuiLoja,
      emailVerificado: detalhes?.emailVerificado ?? null,
      ativo: detalhes?.ativo ?? (base.status === 'ativo'),
      ultimoAcesso: detalhes?.ultimoAcesso ?? base.ultimaAtividade ?? null,
      dataCadastro: detalhes?.dataCadastro ?? null,
      lojas: base.lojas ?? []
    };
  }
}
