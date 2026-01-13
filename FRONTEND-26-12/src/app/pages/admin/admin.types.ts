export type AdminUsuarioPerfil = 'cliente' | 'vendedor' | 'admin';
export type AdminUsuarioStatus = 'ativo' | 'pendente' | 'inativo' | 'suspenso';
export type AdminProdutoStatus = 'ativo' | 'indisponivel' | 'rascunho';
export type AdminLojaStatus = 'operando' | 'fechada' | 'suspensa';
export type AdminLojaStatusAdm = 'ATIVA' | 'EM_ANALISE' | 'SUSPENSA';
export type AdminComentarioStatus = 'pendente' | 'aprovado' | 'oculto';
export type AdminComentarioCanal = 'app' | 'whatsapp' | 'suporte';
export type AdminActivitySeverity = 'info' | 'success' | 'alert';

export interface AdminUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: AdminUsuarioPerfil;
  status: AdminUsuarioStatus;
  ultimaAtividade: string;
  pedidosTotal: number;
  lojas?: string[];
  avatar?: string;
}

export interface AdminProduto {
  id: number;
  nome: string;
  loja: string;
  categoria: string;
  estoque: number;
  preco: number;
  status: AdminProdutoStatus;
  atualizadoEm: string;
  destaque?: boolean;
  descricao?: string;
  imagem?: string;
  foto?: string;
  lojaId?: number;
}

export interface AdminLoja {
  id: number;
  nome: string;
  categoria: string;
  responsavel: string;
  status: AdminLojaStatus;
  statusAdm: AdminLojaStatusAdm;
  pedidosHoje: number;
  avaliacaoMedia: number;
  faturamentoMes: number;
  cidade: string;
  criadoEm: string;
}

export interface AdminComentario {
  id: number;
  usuario: string;
  loja: string;
  produto: string;
  status: AdminComentarioStatus;
  nota: number;
  mensagem: string;
  criadoEm: string;
  canal: AdminComentarioCanal;
  tags: string[];
}

export interface AdminActivity {
  id: number;
  area: string;
  mensagem: string;
  timestamp: string;
  severity: AdminActivitySeverity;
}

export interface AdminSummary {
  totalUsuarios: number;
  usuariosRecentes: number;
  totalLojas: number;
  lojasPendentes: number;
  totalProdutos: number;
  produtosSemEstoque: number;
  comentariosPendentes: number;
  satisfacaoMedia: number;
}
