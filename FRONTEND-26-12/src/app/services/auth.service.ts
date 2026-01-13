/*import { Injectable } from '@angular/core';

export type TipoUsuario = 'aluno' | 'professor' | 'funcionario' | 'visitante';
export type TipoPerfil = 'comprador' | 'vendedor' | 'admin';

export interface Usuario {
  id: number;
  nome: string;
  sobrenome?: string;
  login: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  tipoUsuario?: TipoUsuario;
  tipoPerfil: TipoPerfil;
  possuiLoja?: boolean;
  chavePix?: string;
  fotoPerfil?: string;
  dataCadastro?: string;
  ativo?: boolean;
  ultimoAcesso?: string;
  emailVerificado?: boolean;
  tokenRecuperacao?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'cefoods_users';
  private readonly SESSION_KEY = 'cefoods_session';

  constructor() {}

  // ===== utilitários base =====
  private readAll(): Usuario[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAll(users: Usuario[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getAll(): Usuario[] {
    return this.readAll();
  }

  // ===== CRUD =====
  addUser(partial: Partial<Usuario>): Usuario {
    const users = this.readAll();
    const now = new Date().toISOString();
    const newUser: Usuario = {
      id: Date.now(),
      nome: partial.nome || '',
      sobrenome: partial.sobrenome || '',
      login: partial.login || '',
      email: partial.email || '',
      senha: partial.senha || '',
      telefone: partial.telefone || '',
      cpf: partial.cpf || '',
      dataNascimento: partial.dataNascimento || '',
      tipoUsuario: partial.tipoUsuario || 'aluno',
      tipoPerfil: partial.tipoPerfil || 'comprador',
      possuiLoja: partial.possuiLoja || false,
      chavePix: partial.chavePix || '',
      fotoPerfil: partial.fotoPerfil || '',
      dataCadastro: now,
      ativo: true,
      ultimoAcesso: now,
      emailVerificado: false,
      tokenRecuperacao: null
    };
    users.push(newUser);
    this.saveAll(users);
    return newUser;
  }

  updateUsuario(updated: Usuario): Usuario {
    const users = this.readAll();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      this.saveAll(users);

      // se for o usuário logado, atualiza a sessão também
      const sess = this.getUsuarioLogado();
      if (sess && sess.id === updated.id) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(users[idx]));
      }
      return users[idx];
    }
    throw new Error('Usuário não encontrado');
  }

  deleteUsuario(id: number): void {
    const users = this.readAll().filter(u => u.id !== id);
    this.saveAll(users);
    const sess = this.getUsuarioLogado();
    if (sess && sess.id === id) {
      this.logout();
    }
  }

  /** login aceita email ou login (@username) 
  login(identificador: string, senha: string): Usuario | null {
    const users = this.readAll();
    const user = users.find(
      u => (u.email === identificador || u.login === identificador) && u.senha === senha
    );
    if (!user) return null;

    user.ultimoAcesso = new Date().toISOString();
    this.saveAll(users);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    // corrigido: removendo a chave correta da sessão
    localStorage.removeItem(this.SESSION_KEY);
  }

  setUsuarioLogado(u: Usuario): void {
    const normalizado: Usuario = {
      ...u,
      possuiLoja: this.normalizePossuiLoja(u.possuiLoja)
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(normalizado));
  }

  getUsuarioLogado(): Usuario | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) {
      return null;
    }
    const usuario = JSON.parse(raw) as Usuario;
    usuario.possuiLoja = this.normalizePossuiLoja(usuario.possuiLoja);
    return usuario;
  }

  isAuthenticated(): boolean {
    return !!this.getUsuarioLogado();
  }

  getById(id: number): Usuario | undefined {
    return this.readAll().find(u => u.id === id);
  }
}*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Usuario, TipoPerfil, TipoUsuario } from '../model/usuario';

interface LoginResponseDto {
  token: string;
  tokenExpiracao?: string | null;
  idUsuario: number;
  nome?: string | null;
  sobrenome?: string | null;
  login: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  dataNascimento?: string | null;
  tipoUsuario?: string | null;
  tipoPerfil?: string | null;
  possuiLoja?: boolean | number | string | null;
  chavePix?: string | null;
  fotoPerfil?: string | null;
  dataCadastro?: string | null;
  ativo?: boolean | null;
  ultimoAcesso?: string | null;
  emailVerificado?: boolean | null;
  tokenRecuperacao?: string | null;
}

interface AuthSession {
  token: string;
  tokenExpiracao?: string | null;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'cefoods_users';
  private readonly SESSION_KEY = 'cefoods_session';
  private readonly API_LOGIN_URL = `${environment.apiUrl}/auth/login`;
  private readonly API_USUARIOS_URL = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  private readAll(): Usuario[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAll(users: Usuario[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getAll(): Usuario[] {
    return this.readAll();
  }

  getById(id: number): Usuario | undefined {
    return this.readAll().find(u => u.idUsuario === id);
  }

  addUser(partial: Partial<Usuario>): Usuario {
    const users = this.readAll();
    const now = new Date().toISOString();
    const newUser: Usuario = {
      idUsuario: Date.now(),
      nome: partial.nome || '',
      sobrenome: partial.sobrenome || '',
      login: partial.login || '',
      email: partial.email || '',
      senha: partial.senha || '',
      telefone: partial.telefone || '',
      cpf: partial.cpf || '',
      dataNascimento: partial.dataNascimento || '',
      tipoUsuario: partial.tipoUsuario || 'aluno',
      tipoPerfil: partial.tipoPerfil || 'comprador',
      possuiLoja: partial.possuiLoja || false,
      chavePix: partial.chavePix || '',
      fotoPerfil: partial.fotoPerfil || '',
      dataCadastro: now,
      ativo: true,
      ultimoAcesso: now,
      emailVerificado: false,
      tokenRecuperacao: null
    };
    users.push(newUser);
    this.saveAll(users);
    return newUser;
  }

  async login(identificador: string, senha: string): Promise<Usuario | null> {
    const normalizedIdentificador = (identificador ?? '').trim();
    const normalizedSenha = (senha ?? '').trim();

    if (!normalizedIdentificador || !normalizedSenha) {
      return Promise.reject(new Error('LOGIN_CREDENTIALS_REQUIRED'));
    }

    try {
      const payload = await firstValueFrom(
        this.http.post<LoginResponseDto>(this.API_LOGIN_URL, {
          login: normalizedIdentificador,
          senha: normalizedSenha
        })
      );

      if (!payload?.idUsuario || !payload.token) {
        throw new Error('Resposta de login inválida.');
      }

      const usuario = this.mapUsuarioFromLoginResponse(payload);
      usuario.ultimoAcesso = new Date().toISOString();

      this.writeSession({
        token: payload.token,
        tokenExpiracao: payload.tokenExpiracao ?? null,
        usuario
      });
      return usuario;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 423) {
          throw new Error('USUARIO_SUSPENSO');
        }
        if (err.status && err.status !== 0) {
          return null;
        }
      }
      console.warn('Erro na API, tentando login local...', err);
    }

    const lowerIdentificador = normalizedIdentificador.toLowerCase();
    const users = this.readAll();
    const user = users.find(
      u =>
        this.matchesIdentificador(u, normalizedIdentificador, lowerIdentificador) &&
        this.normalizePassword(u.senha) === normalizedSenha
    );
    if (!user || this.isSuspendedFlag(user.ativo)) {
      return null;
    }

    user.ultimoAcesso = new Date().toISOString();
    this.saveAll(users);
    this.writeSession({ token: '', tokenExpiracao: null, usuario: user });
    return user;
  }

  logout(): void {
    this.writeSession(null);
  }

  setUsuarioLogado(usuario: Usuario): void {
    const session = this.getSession();
    const token = session?.token ?? '';
    const tokenExpiracao = session?.tokenExpiracao ?? null;
    this.writeSession({ token, tokenExpiracao, usuario: { ...usuario } });
  }

  getUsuarioLogado(): Usuario | null {
    const session = this.getSession();
    if (!session) {
      return null;
    }
    return { ...session.usuario };
  }

  isAuthenticated(): boolean {
    return !!this.getSession()?.usuario;
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  isAdmin(): boolean {
    const perfil = this.getUsuarioLogado()?.tipoPerfil;
    return perfil ? perfil.toLowerCase() === 'admin' : false;
  }

  async updateUsuario(updated: Usuario): Promise<Usuario> {
    try {
      const res = await this.atualizarUsuarioApi(updated);
      this.setUsuarioLogado(res);
      return res;
    } catch (e) {
      console.warn('API falhou, atualizando localmente.', e);
      const users = this.readAll();
      const idx = users.findIndex(u => u.idUsuario === updated.idUsuario);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updated };
        this.saveAll(users);
        this.setUsuarioLogado(users[idx]);
        return users[idx];
      }
      throw new Error('Usuário não encontrado localmente');
    }
  }

  async atualizarUsuarioApi(usuario: Usuario): Promise<Usuario> {
    const url = `${this.API_USUARIOS_URL}/${usuario.idUsuario}`;
    return await firstValueFrom(this.http.put<Usuario>(url, usuario));
  }

  async deleteUsuario(idUsuario: number): Promise<void> {
    try {
      await this.deletarUsuarioApi(idUsuario);
    } catch (e) {
      console.warn('Falha ao excluir via API, tentando localmente', e);
    }

    const users = this.readAll().filter(u => u.idUsuario !== idUsuario);
    this.saveAll(users);

    const sess = this.getUsuarioLogado();
    if (sess && sess.idUsuario === idUsuario) {
      this.logout();
    }
  }

  async deletarUsuarioApi(id: number): Promise<void> {
    const url = `${this.API_USUARIOS_URL}/${id}`;
    await firstValueFrom(this.http.delete<void>(url));
  }

  usuarioPossuiLoja(usuario?: Usuario | null): boolean {
    return this.normalizePossuiLoja(usuario?.possuiLoja);
  }

  async refreshUsuarioLogadoFromApi(): Promise<Usuario | null> {
    const atual = this.getUsuarioLogado();
    if (!atual?.idUsuario) {
      return null;
    }

    const atualizado = await this.fetchUsuarioFromApi(atual.idUsuario);
    if (atualizado) {
      this.setUsuarioLogado(atualizado);
      return this.getUsuarioLogado();
    }

    return null;
  }

  private async fetchUsuarioFromApi(idUsuario: number): Promise<Usuario | null> {
    try {
      return await firstValueFrom(this.http.get<Usuario>(`${this.API_USUARIOS_URL}/${idUsuario}`));
    } catch (error) {
      console.warn('Não foi possível carregar o usuário no backend.', error);
      return null;
    }
  }

  private normalizePossuiLoja(flag: unknown): boolean {
    if (flag === true) return true;
    if (flag === false || flag === undefined || flag === null) return false;
    if (typeof flag === 'number') return flag === 1;
    if (typeof flag === 'string') {
      const value = flag.trim().toLowerCase();
      if (value === '1') return true;
      if (value === '0' || value === '') return false;
      if (value === 'true' || value === 'sim' || value === 'yes') return true;
      if (value === 'false' || value === 'nao' || value === 'não' || value === 'no') return false;
    }
    return Boolean(flag);
  }

  async cadastrarUsuarioApi(novoUsuario: Partial<Usuario>): Promise<Usuario> {
    return await firstValueFrom(this.http.post<Usuario>(this.API_USUARIOS_URL, novoUsuario));
  }

  async uploadFotoPerfil(idUsuario: number, arquivo: File): Promise<Usuario> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    const atualizado = await firstValueFrom(
      this.http.post<Usuario>(`${this.API_USUARIOS_URL}/${idUsuario}/foto`, formData)
    );
    this.setUsuarioLogado(atualizado);
    return atualizado;
  }

  private getSession(): AuthSession | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.usuario) {
        parsed.usuario = {
          ...parsed.usuario,
          possuiLoja: this.normalizePossuiLoja(parsed.usuario.possuiLoja)
        };
      }
      return parsed;
    } catch (error) {
      console.warn('Sessão inválida encontrada, removendo registro.', error);
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  private writeSession(session: AuthSession | null): void {
    if (!session) {
      localStorage.removeItem(this.SESSION_KEY);
      return;
    }
    const payload: AuthSession = {
      token: session.token,
      tokenExpiracao: session.tokenExpiracao ?? null,
      usuario: {
        ...session.usuario,
        possuiLoja: this.normalizePossuiLoja(session.usuario.possuiLoja)
      }
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(payload));
  }

  private mapUsuarioFromLoginResponse(payload: LoginResponseDto): Usuario {
    return {
      idUsuario: payload.idUsuario,
      nome: payload.nome ?? '',
      sobrenome: payload.sobrenome ?? undefined,
      login: payload.login ?? '',
      email: payload.email ?? '',
      senha: '',
      telefone: payload.telefone ?? undefined,
      cpf: payload.cpf ?? undefined,
      dataNascimento: payload.dataNascimento ?? undefined,
      tipoUsuario: this.normalizeTipoUsuarioValue(payload.tipoUsuario),
      tipoPerfil: this.normalizeTipoPerfil(payload.tipoPerfil),
      possuiLoja: this.normalizePossuiLoja(payload.possuiLoja),
      chavePix: payload.chavePix ?? undefined,
      fotoPerfil: payload.fotoPerfil ?? undefined,
      dataCadastro: payload.dataCadastro ?? undefined,
      ativo: payload.ativo ?? undefined,
      ultimoAcesso: payload.ultimoAcesso ?? undefined,
      emailVerificado: payload.emailVerificado ?? undefined,
      tokenRecuperacao: payload.tokenRecuperacao ?? undefined
    };
  }

  private normalizeTipoPerfil(value?: string | null): TipoPerfil {
    const normalized = (value ?? 'comprador').trim().toLowerCase();
    if (normalized === 'admin') {
      return 'admin';
    }
    if (normalized === 'vendedor') {
      return 'vendedor';
    }
    return 'comprador';
  }

  private normalizeTipoUsuarioValue(value?: string | null): TipoUsuario {
    const normalized = (value ?? 'cliente').trim().toLowerCase();
    switch (normalized) {
      case 'aluno':
      case 'professor':
      case 'funcionario':
      case 'visitante':
        return normalized as TipoUsuario;
      default:
        return 'cliente';
    }
  }

  private isSuspendedFlag(flag: unknown): boolean {
    if (flag === false) {
      return true;
    }
    if (typeof flag === 'string') {
      const normalized = flag.trim().toLowerCase();
      return normalized === 'false' || normalized === '0' || normalized === 'suspenso';
    }
    return false;
  }

  private matchesIdentificador(usuario: Usuario, original: string, lower: string): boolean {
    const email = (usuario.email ?? '').trim().toLowerCase();
    const login = (usuario.login ?? '').trim().toLowerCase();
    return (!!email && email === lower) || (!!login && login === lower) || usuario.login === original;
  }

  private normalizePassword(value?: string): string {
    return (value ?? '').trim();
  }
}
