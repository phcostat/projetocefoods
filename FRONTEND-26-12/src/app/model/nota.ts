export interface Anexo {
  idAnexo: number;
  nomeArquivo: string;
  tipo: string;
  tamanho?: number;
}

export interface Nota {
  idNota: number;
  titulo: string;
  texto?: string;
  dataCriacao?: string;
  idUsuario?: number;
  idLoja?: number;
  anexos?: Anexo[];
}
