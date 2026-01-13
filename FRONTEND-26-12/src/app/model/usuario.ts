/*export interface Usuario {
  id: number;
  nome: string;
  //sobrenome?: string;
  login: string; // @identificador único
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  tipoUsuario: 'aluno' | 'professor' | 'funcionario' | 'visitante';
  tipoPerfil: 'comprador' | 'vendedor' | 'admin';
  //possuiLoja?: boolean;
  chavePix?: string;
  fotoPerfil?: string;
  dataCadastro: string;
  ativo: boolean;
  ultimoAcesso?: string;
  emailVerificado: boolean;
  tokenRecuperacao?: string;
}*/
export type TipoUsuario = 'aluno' | 'professor' | 'funcionario' | 'visitante' | 'cliente';
export type TipoPerfil = 'comprador' | 'vendedor' | 'admin';

export interface Usuario {
  idUsuario: number;
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
  possuiLoja?: boolean | number | string;
  chavePix?: string;
  fotoPerfil?: string;
  dataCadastro?: string;
  ativo?: boolean;
  ultimoAcesso?: string;
  emailVerificado?: boolean;
  tokenRecuperacao?: string | null;
}

