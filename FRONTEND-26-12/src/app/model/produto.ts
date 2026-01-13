// src/app/services/produto.service.ts (model dentro do service)
// src/app/model/produto.ts
export interface Produto {
  idProduto: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  estoque: number;
  estoqueMinimo: number;
  disponivel: boolean;

  // 🔗 Relações com outras entidades
  loja: {
    idLoja: number;
    nomeFantasia: string;
    descricao: string;
  };

  categoria: {
    idCategoria: number;
    nome: string;
    descricao: string;
  };
}


