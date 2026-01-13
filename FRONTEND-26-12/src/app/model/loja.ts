// src/app/services/loja.service.ts (apenas interface atualizada)
export interface Loja {
  id: number;
  nome: string;
  descricao: string;
  formasPagamento: string[]; // ["PIX", "Dinheiro", "Cartão"]
  idUsuario: number; // dono da loja
  localizacao: string; // Ex: "Bloco B - Sala 12"
  aberta: boolean;     // true = aberta / false = fechada
  statusAdm?: string;
  foto?: string;       // imagem opcional
}

