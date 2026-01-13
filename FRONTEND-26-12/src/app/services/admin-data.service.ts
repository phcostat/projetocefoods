import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  AdminActivity,
  AdminActivitySeverity,
  AdminComentario,
  AdminComentarioStatus,
  AdminLoja,
  AdminLojaStatus,
  AdminLojaStatusAdm,
  AdminProduto,
  AdminProdutoStatus,
  AdminSummary,
  AdminUsuario,
  AdminUsuarioStatus
} from '../pages/admin/admin.types';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Usuario } from '../model/usuario';

interface AdminPanelResponse {
  summary?: AdminSummary;
  usuarios: AdminUsuario[];
  lojas: AdminLoja[];
  produtos: AdminProduto[];
  comentarios: AdminComentario[];
  atividades: AdminActivity[];
}

interface AdminUsuarioStatusResponseDto {
  usuarioId: number;
  status?: string | null;
  ativo?: boolean | null;
  emailVerificado?: boolean | null;
  lojasAfetadas?: Array<{
    lojaId: number;
    status?: boolean | null;
    visivel?: boolean | null;
  }>;
}

interface AdminLojaStatusResponseDto {
  idLoja: number;
  statusAdm: AdminLojaStatusAdm;
  status?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly ADMIN_PANEL_URL = `${environment.apiUrl}/api/v1/admin/panel`;
  private readonly ADMIN_USERS_URL = `${environment.apiUrl}/api/v1/admin/users`;
  private readonly ADMIN_LOJAS_URL = `${environment.apiUrl}/api/v1/admin/lojas`;
  private readonly ADMIN_COMENTARIOS_URL = `${environment.apiUrl}/api/v1/admin/comentarios`;
  private readonly API_USUARIOS_URL = `${environment.apiUrl}/usuarios`;
  private usuariosSubject = new BehaviorSubject<AdminUsuario[]>([
    {
      id: 1,
      nome: 'Marina Costa',
      email: 'marina@cefoods.com',
      perfil: 'admin',
      status: 'ativo',
      ultimaAtividade: this.daysAgo(0),
      pedidosTotal: 182,
      lojas: ['Sabor Express'],
      avatar: 'assets/admin/users/marina.png'
    },
    {
      id: 2,
      nome: 'Ricardo Lima',
      email: 'ricardo@cefoods.com',
      perfil: 'vendedor',
      status: 'pendente',
      ultimaAtividade: this.daysAgo(2),
      pedidosTotal: 74,
      lojas: ['Doce Horizonte'],
      avatar: 'assets/admin/users/ricardo.png'
    },
    {
      id: 3,
      nome: 'Joana Ribeiro',
      email: 'joana@cefoods.com',
      perfil: 'cliente',
      status: 'ativo',
      ultimaAtividade: this.daysAgo(5),
      pedidosTotal: 22
    },
    {
      id: 4,
      nome: 'Andre Gomes',
      email: 'andre@cefoods.com',
      perfil: 'vendedor',
      status: 'suspenso',
      ultimaAtividade: this.daysAgo(14),
      pedidosTotal: 210,
      lojas: ['Massa Nostra']
    },
    {
      id: 5,
      nome: 'Carolina Prado',
      email: 'carolina@cefoods.com',
      perfil: 'admin',
      status: 'ativo',
      ultimaAtividade: this.daysAgo(1),
      pedidosTotal: 45
    }
  ]);
  readonly usuarios$ = this.usuariosSubject.asObservable();

  private produtosSubject = new BehaviorSubject<AdminProduto[]>([
    {
      id: 101,
      nome: 'Combo Executivo',
      loja: 'Sabor Express',
      categoria: 'Pratos',
      estoque: 42,
      preco: 39.9,
      status: 'ativo',
      atualizadoEm: this.daysAgo(0),
      destaque: true,
      lojaId: 201,
      descricao: 'Almoço completo com prato principal, acompanhamento e bebida.',
      imagem: 'assets/testeimagem.webp'
    },
    {
      id: 102,
      nome: 'Box Oriental',
      loja: 'Doce Horizonte',
      categoria: 'Oriental',
      estoque: 6,
      preco: 58.0,
      status: 'ativo',
      atualizadoEm: this.daysAgo(2),
      lojaId: 202,
      descricao: 'Seleção de sushis especiais preparada diariamente.',
      imagem: 'assets/testedominos.webp'
    },
    {
      id: 103,
      nome: 'Brownie Belga',
      loja: 'Massa Nostra',
      categoria: 'Sobremesas',
      estoque: 0,
      preco: 18.5,
      status: 'indisponivel',
      atualizadoEm: this.daysAgo(3),
      lojaId: 203,
      descricao: 'Brownie cremoso com chocolate meio amargo belga.',
      imagem: 'assets/testeimagem.webp'
    },
    {
      id: 104,
      nome: 'Linha Fit Semana 01',
      loja: 'Flow Natural',
      categoria: 'Fit',
      estoque: 18,
      preco: 79.9,
      status: 'ativo',
      atualizadoEm: this.daysAgo(1),
      lojaId: 204,
      descricao: 'Plano semanal com refeições balanceadas e frescas.',
      imagem: 'assets/fundo-comida.jpg'
    },
    {
      id: 105,
      nome: 'Pack Degustacao',
      loja: 'Veg&Art',
      categoria: 'Vegano',
      estoque: 8,
      preco: 65,
      status: 'rascunho',
      atualizadoEm: this.daysAgo(7),
      lojaId: 205,
      descricao: 'Degustação vegana com petiscos autorais da casa.',
      imagem: 'assets/testeimagem.webp'
    }
  ]);
  readonly produtos$ = this.produtosSubject.asObservable();

  private lojasSubject = new BehaviorSubject<AdminLoja[]>([
    {
      id: 201,
      nome: 'Sabor Express',
      categoria: 'Delivery Rapido',
      responsavel: 'Larissa Prado',
      status: 'operando',
      statusAdm: 'ATIVA',
      pedidosHoje: 54,
      avaliacaoMedia: 4.7,
      faturamentoMes: 82450,
      cidade: 'Sao Paulo',
      criadoEm: this.daysAgo(180)
    },
    {
      id: 202,
      nome: 'Doce Horizonte',
      categoria: 'Confeitaria',
      responsavel: 'Ricardo Lima',
      status: 'suspensa',
      statusAdm: 'EM_ANALISE',
      pedidosHoje: 8,
      avaliacaoMedia: 4.1,
      faturamentoMes: 18200,
      cidade: 'Belo Horizonte',
      criadoEm: this.daysAgo(32)
    },
    {
      id: 203,
      nome: 'Massa Nostra',
      categoria: 'Massas',
      responsavel: 'Andre Gomes',
      status: 'suspensa',
      statusAdm: 'SUSPENSA',
      pedidosHoje: 0,
      avaliacaoMedia: 3.2,
      faturamentoMes: 0,
      cidade: 'Curitiba',
      criadoEm: this.daysAgo(400)
    },
    {
      id: 204,
      nome: 'Flow Natural',
      categoria: 'Saudavel',
      responsavel: 'Natalia Torres',
      status: 'fechada',
      statusAdm: 'ATIVA',
      pedidosHoje: 19,
      avaliacaoMedia: 4.5,
      faturamentoMes: 45680,
      cidade: 'Rio de Janeiro',
      criadoEm: this.daysAgo(90)
    },
    {
      id: 205,
      nome: 'Veg&Art',
      categoria: 'Vegano',
      responsavel: 'Equipe Veg&Art',
      status: 'operando',
      statusAdm: 'ATIVA',
      pedidosHoje: 11,
      avaliacaoMedia: 4.3,
      faturamentoMes: 23800,
      cidade: 'Porto Alegre',
      criadoEm: this.daysAgo(210)
    }
  ]);
  readonly lojas$ = this.lojasSubject.asObservable();

  private comentariosSubject = new BehaviorSubject<AdminComentario[]>([
    {
      id: 501,
      usuario: 'Joana Ribeiro',
      loja: 'Sabor Express',
      produto: 'Combo Executivo',
      status: 'pendente',
      nota: 4,
      mensagem: 'Entrega rapida, mas embalagem poderia ser reforcada.',
      criadoEm: this.daysAgo(0),
      canal: 'app',
      tags: ['logistica']
    },
    {
      id: 502,
      usuario: 'Carolina Prado',
      loja: 'Doce Horizonte',
      produto: 'Box Oriental',
      status: 'aprovado',
      nota: 5,
      mensagem: 'Experiencia impecavel, sabores equilibrados.',
      criadoEm: this.daysAgo(3),
      canal: 'app',
      tags: ['produto']
    },
    {
      id: 503,
      usuario: 'Carlos Teixeira',
      loja: 'Massa Nostra',
      produto: 'Brownie Belga',
      status: 'oculto',
      nota: 2,
      mensagem: 'Pedido nunca chegou. Solicitei estorno.',
      criadoEm: this.daysAgo(6),
      canal: 'suporte',
      tags: ['suporte','logistica']
    },
    {
      id: 504,
      usuario: 'Maria Fernanda',
      loja: 'Flow Natural',
      produto: 'Linha Fit Semana 01',
      status: 'pendente',
      nota: 5,
      mensagem: 'Planos incriveis, gostaria de citar ajustes nutricionais.',
      criadoEm: this.daysAgo(1),
      canal: 'whatsapp',
      tags: ['produto','nutricao']
    }
  ]);
  readonly comentarios$ = this.comentariosSubject.asObservable();

  private activitiesSubject = new BehaviorSubject<AdminActivity[]>([
    {
      id: 9001,
      area: 'Usuarios',
      mensagem: 'Marina elevou permissoes do operador Ricardo.',
      timestamp: this.daysAgo(0),
      severity: 'success'
    },
    {
      id: 9002,
      area: 'Produtos',
      mensagem: 'Brownie Belga ficou sem estoque ha 3 dias.',
      timestamp: this.daysAgo(3),
      severity: 'alert'
    },
    {
      id: 9003,
      area: 'Comentarios',
      mensagem: '2 avaliacoes aguardam revisao manual.',
      timestamp: this.daysAgo(1),
      severity: 'info'
    }
  ]);
  readonly activities$ = this.activitiesSubject.asObservable();

  private summarySubject = new BehaviorSubject<AdminSummary>(
    this.composeSummary(
      this.usuariosSubject.value,
      this.lojasSubject.value,
      this.produtosSubject.value,
      this.comentariosSubject.value
    )
  );
  readonly summary$ = this.summarySubject.asObservable();

  private isSyncing = false;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.lojasSubject.next(this.lojasSubject.value.map(loja => this.normalizeAdminLoja(loja)));
    if (this.authService.isAdmin()) {
      this.refreshFromBackend();
    }
  }

  refreshFromBackend(): void {
    if (this.isSyncing || !this.authService.isAdmin()) {
      return;
    }
    const headers = this.buildAuthHeaders();
    if (!headers) {
      return;
    }
    this.isSyncing = true;
    this.http
      .get<AdminPanelResponse>(this.ADMIN_PANEL_URL, { headers })
      .pipe(finalize(() => (this.isSyncing = false)))
      .subscribe({
        next: payload => {
          if (payload.usuarios) {
            this.usuariosSubject.next(payload.usuarios);
          }
          if (payload.lojas) {
            this.lojasSubject.next(payload.lojas.map(loja => this.normalizeAdminLoja(loja)));
          }
          if (payload.produtos) {
            this.produtosSubject.next(payload.produtos);
          }
          if (payload.comentarios) {
            this.comentariosSubject.next(payload.comentarios);
          }
          if (payload.atividades) {
            this.activitiesSubject.next(payload.atividades);
          }
          this.publishSummaryFromPayload(payload.summary);
        },
        error: err => console.error('Falha ao sincronizar painel administrativo.', err)
      });
  }

  updateUsuarioStatus(id: number, status: AdminUsuarioStatus): void {
    const shouldPersist = this.shouldPersistStatus(status);

    if (shouldPersist && this.authService.isAdmin()) {
      const headers = this.buildAuthHeaders();
      if (headers) {
        const url = `${this.ADMIN_USERS_URL}/${id}/status`;
        this.http
          .patch<AdminUsuarioStatusResponseDto>(url, { ativo: status === 'ativo' }, { headers })
          .subscribe({
            next: response => {
              const resolved = response?.status ? this.normalizeAdminStatus(response.status) : status;
              this.applyUsuarioStatus(id, resolved);
            },
            error: err => {
              console.error('Falha ao sincronizar status do usuario com o backend.', err);
              this.applyUsuarioStatus(id, status);
            }
          });
        return;
      }
    }

    this.applyUsuarioStatus(id, status);
  }

  removeUsuario(id: number): void {
    const remaining = this.usuariosSubject.value.filter(user => user.id !== id);
    this.usuariosSubject.next(remaining);
    this.logActivity('Usuarios', `Usuario #${id} removido do painel`, 'alert');
    this.publishSummary();
  }

  updateProdutoStatus(id: number, status: AdminProdutoStatus): void {
    const mutated = this.produtosSubject.value.map(prod =>
      prod.id === id ? { ...prod, status, atualizadoEm: this.nowIso() } : prod
    );
    this.produtosSubject.next(mutated);
    this.logActivity('Produtos', `Produto #${id} marcado como ${status}`, status === 'indisponivel' ? 'alert' : 'info');
    this.publishSummary();
  }

  removeProduto(id: number): void {
    const remaining = this.produtosSubject.value.filter(prod => prod.id !== id);
    this.produtosSubject.next(remaining);
    this.logActivity('Produtos', `Produto #${id} removido do catalogo administrativo`, 'alert');
    this.publishSummary();
  }

  updateLojaStatus(id: number, status: AdminLojaStatus): void {
    if (status === 'suspensa') {
      this.updateLojaStatusAdm(id, 'SUSPENSA');
      return;
    }

    const shouldPersist = this.authService.isAdmin();

    if (shouldPersist) {
      const headers = this.buildAuthHeaders();
      if (headers) {
        const body = { status: status === 'operando', manualOverride: true };
        const url = `${this.ADMIN_LOJAS_URL}/${id}/status`;
        this.http.patch<AdminLojaStatusResponseDto>(url, body, { headers }).subscribe({
          next: response => this.applyLojaStatusFromResponse(response),
          error: err => {
            console.error('Falha ao atualizar status operacional da loja.', err);
            this.applyLojaStatus(id, status);
          }
        });
        return;
      }
    }

    this.applyLojaStatus(id, status);
  }

  updateLojaStatusAdm(id: number, statusAdm: AdminLojaStatusAdm): void {
    if (!this.authService.isAdmin()) {
      const fallback = statusAdm === 'SUSPENSA' ? 'suspensa' : 'operando';
      this.applyLojaStatus(id, fallback, statusAdm);
      return;
    }

    const headers = this.buildAuthHeaders();
    if (!headers) {
      const fallback = statusAdm === 'SUSPENSA' ? 'suspensa' : 'operando';
      this.applyLojaStatus(id, fallback, statusAdm);
      return;
    }

    const url = `${this.ADMIN_LOJAS_URL}/${id}/status-adm`;
    this.http.patch<AdminLojaStatusResponseDto>(url, { statusAdm }, { headers }).subscribe({
      next: response => this.applyLojaStatusFromResponse(response),
      error: err => {
        console.error('Falha ao atualizar status administrativo da loja.', err);
        const fallback = statusAdm === 'SUSPENSA' ? 'suspensa' : 'operando';
        this.applyLojaStatus(id, fallback, statusAdm);
      }
    });
  }

  removeLoja(id: number): void {
    const remaining = this.lojasSubject.value.filter(store => store.id !== id);
    this.lojasSubject.next(remaining);
    this.logActivity('Lojas', `Loja #${id} removida da visibilidade administrativa`, 'alert');
    this.publishSummary();
  }

  updateComentarioStatus(id: number, status: AdminComentarioStatus): void {
    const applyLocal = () => this.applyComentarioStatusLocal(id, status);

    if (this.authService.isAdmin()) {
      const headers = this.buildAuthHeaders();
      if (headers) {
        this.http
          .patch(`${this.ADMIN_COMENTARIOS_URL}/${id}/status`, { status: status.toUpperCase() }, { headers })
          .subscribe({
            next: () => applyLocal(),
            error: err => console.error('Falha ao atualizar status do comentário no backend.', err)
          });
        return;
      }
    }

    applyLocal();
  }

  removeComentario(id: number): void {
    const applyLocal = () => this.applyComentarioRemocaoLocal(id);

    if (this.authService.isAdmin()) {
      const headers = this.buildAuthHeaders();
      if (headers) {
        this.http
          .delete(`${this.ADMIN_COMENTARIOS_URL}/${id}`, { headers })
          .subscribe({
            next: () => applyLocal(),
            error: err => console.error('Falha ao remover comentário no backend.', err)
          });
        return;
      }
    }

    applyLocal();
  }

  private applyComentarioStatusLocal(id: number, status: AdminComentarioStatus): void {
    const mutated = this.comentariosSubject.value.map(comentario =>
      comentario.id === id ? { ...comentario, status } : comentario
    );
    this.comentariosSubject.next(mutated);
    this.logActivity('Comentarios', `Comentario #${id} marcado como ${status}`, status === 'oculto' ? 'alert' : 'info');
    this.publishSummary();
  }

  private applyComentarioRemocaoLocal(id: number): void {
    const remaining = this.comentariosSubject.value.filter(comentario => comentario.id !== id);
    this.comentariosSubject.next(remaining);
    this.logActivity('Comentarios', `Comentario #${id} excluido`, 'alert');
    this.publishSummary();
  }

  registerActivity(area: string, mensagem: string, severity: AdminActivitySeverity = 'info'): void {
    this.logActivity(area, mensagem, severity);
  }

  async fetchUsuarioDetalhes(idUsuario: number): Promise<Usuario | null> {
    const headers = this.buildAuthHeaders();
    if (!headers) {
      return null;
    }
    try {
      return await firstValueFrom(
        this.http.get<Usuario>(`${this.API_USUARIOS_URL}/${idUsuario}`, { headers })
      );
    } catch (error) {
      console.error(`Falha ao carregar detalhes do usuario #${idUsuario}`, error);
      throw error;
    }
  }

  private applyUsuarioStatus(id: number, status: AdminUsuarioStatus): void {
    const mutated = this.usuariosSubject.value.map(user =>
      user.id === id ? { ...user, status, ultimaAtividade: this.nowIso() } : user
    );
    this.usuariosSubject.next(mutated);
    const severity: AdminActivitySeverity = status === 'suspenso' ? 'alert' : 'info';
    this.logActivity('Usuarios', `Status do usuario #${id} definido como ${status}`, severity);
    this.publishSummary();
  }

  private applyLojaStatus(id: number, status: AdminLojaStatus, statusAdm?: AdminLojaStatusAdm): void {
    const mutated = this.lojasSubject.value.map(store =>
      store.id === id
        ? { ...store, status, statusAdm: statusAdm ?? store.statusAdm }
        : store
    );
    this.lojasSubject.next(mutated);
    const severity: AdminActivitySeverity = status === 'suspensa' ? 'alert' : 'info';
    this.logActivity('Lojas', `Loja #${id} marcada como ${status}`, severity);
    this.publishSummary();
  }

  private applyLojaStatusFromResponse(response: AdminLojaStatusResponseDto): void {
    const current = this.lojasSubject.value.find(store => store.id === response.idLoja);
    let statusOperacional: AdminLojaStatus;

    if (response.statusAdm === 'SUSPENSA') {
      statusOperacional = 'suspensa';
    } else if (response.status === undefined || response.status === null) {
      statusOperacional = current?.status ?? 'fechada';
    } else {
      statusOperacional = response.status ? 'operando' : 'fechada';
    }

    this.applyLojaStatus(response.idLoja, statusOperacional, response.statusAdm);
  }

  private shouldPersistStatus(status: AdminUsuarioStatus): boolean {
    return status === 'ativo' || status === 'suspenso';
  }

  private normalizeAdminStatus(value?: string | null): AdminUsuarioStatus {
    const normalized = (value ?? '').trim().toLowerCase();
    if (normalized === 'suspenso') {
      return 'suspenso';
    }
    if (normalized === 'pendente') {
      return 'pendente';
    }
    if (normalized === 'inativo') {
      return 'inativo';
    }
    return 'ativo';
  }

  private normalizeAdminLoja(loja: AdminLoja): AdminLoja {
    return {
      ...loja,
      status: this.normalizeLojaStatus(loja.status),
      statusAdm: this.normalizeLojaStatusAdm(loja.statusAdm)
    };
  }

  private normalizeLojaStatus(status?: string | null): AdminLojaStatus {
    const normalized = (status ?? '').toString().toLowerCase();
    if (normalized === 'suspensa') {
      return 'suspensa';
    }
    if (normalized === 'fechada') {
      return 'fechada';
    }
    if (normalized === 'pendente') {
      return 'fechada';
    }
    return 'operando';
  }

  private normalizeLojaStatusAdm(status?: string | null): AdminLojaStatusAdm {
    const normalized = (status ?? '').toString().toUpperCase();
    if (normalized === 'EM_ANALISE') {
      return 'EM_ANALISE';
    }
    if (normalized === 'SUSPENSA') {
      return 'SUSPENSA';
    }
    return 'ATIVA';
  }

  private buildAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) {
      return null;
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private publishSummaryFromPayload(summary?: AdminSummary): void {
    if (summary) {
      this.summarySubject.next(summary);
      return;
    }
    this.publishSummary();
  }

  private publishSummary(): void {
    const summary = this.composeSummary(
      this.usuariosSubject.value,
      this.lojasSubject.value,
      this.produtosSubject.value,
      this.comentariosSubject.value
    );
    this.summarySubject.next(summary);
  }

  private composeSummary(
    usuarios: AdminUsuario[],
    lojas: AdminLoja[],
    produtos: AdminProduto[],
    comentarios: AdminComentario[]
  ): AdminSummary {
    const now = Date.now();
    const usuariosRecentes = usuarios.filter(usuario => this.diffDays(now, usuario.ultimaAtividade) <= 7).length;
    const lojasPendentes = lojas.filter(loja => loja.statusAdm === 'EM_ANALISE').length;
    const produtosSemEstoque = produtos.filter(produto => produto.estoque === 0).length;
    const comentariosPendentes = comentarios.filter(comentario => comentario.status === 'pendente').length;
    const satisfacaoMedia = comentarios.length
      ? comentarios.reduce((acc, item) => acc + item.nota, 0) / comentarios.length
      : 0;

    return {
      totalUsuarios: usuarios.length,
      usuariosRecentes,
      totalLojas: lojas.length,
      lojasPendentes,
      totalProdutos: produtos.length,
      produtosSemEstoque,
      comentariosPendentes,
      satisfacaoMedia: Number(satisfacaoMedia.toFixed(1))
    };
  }

  private logActivity(area: string, mensagem: string, severity: AdminActivitySeverity = 'info'): void {
    const entry: AdminActivity = {
      id: Date.now(),
      area,
      mensagem,
      timestamp: this.nowIso(),
      severity
    };
    const buffer = [entry, ...this.activitiesSubject.value].slice(0, 8);
    this.activitiesSubject.next(buffer);
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }

  private diffDays(reference: number, iso: string): number {
    const target = new Date(iso).getTime();
    const delta = reference - target;
    return Math.floor(delta / (1000 * 60 * 60 * 24));
  }
}

