// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { VendedorGuard } from './guards/vendedor.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full'
  },
  // Páginas públicas / pré-login
  {
    path: 'index',
    loadChildren: () => import('./pages/index/index.module').then( m => m.IndexPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
  },
  // Cadastro em 3 etapas (públicas)
  {
    path: 'etapa1',
    loadChildren: () => import('./pages/cadastro/etapa1/etapa1.module').then( m => m.Etapa1PageModule)
  },
  {
    path: 'etapa2',
    loadChildren: () => import('./pages/cadastro/etapa2/etapa2.module').then( m => m.Etapa2PageModule)
  },
  {
    path: 'etapa3',
    loadChildren: () => import('./pages/cadastro/etapa3/etapa3.module').then( m => m.Etapa3PageModule)
  },

  // Páginas que exigem autenticação
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tipo',
    loadChildren: () => import('./pages/tipo/tipo.module').then( m => m.TipoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-tipo',
    loadChildren: () => import('./pages/add-tipo/add-tipo.module').then( m => m.AddTipoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tarefa',
    loadChildren: () => import('./pages/tarefa/tarefa.module').then( m => m.TarefaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-tarefa',
    loadChildren: () => import('./pages/add-tarefa/add-tarefa.module').then( m => m.AddTarefaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-tipo/:id',
    loadChildren: () => import('./pages/add-tipo/add-tipo.module').then( m => m.AddTipoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-tarefa/:id',
    loadChildren: () => import('./pages/add-tarefa/add-tarefa.module').then( m => m.AddTarefaPageModule),
    canActivate: [AuthGuard]
  },

  // Usuários (lista / adicionar) - exige login (pode ser admin no futuro)
  {
    path: 'add-usuario',
    loadChildren: () => import('./pages/add-usuario/add-usuario.module').then( m => m.AddUsuarioPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario',
    loadChildren: () => import('./pages/usuario/usuario.module').then( m => m.UsuarioPageModule),
    canActivate: [AuthGuard]
  },

  // Lojas e produtos
  // criar-loja: usuário precisa estar logado (criar a loja transforma perfil em vendedor)
  {
    path: 'criar-loja',
    loadChildren: () => import('./pages/loja/criar-loja/criar-loja.module').then( m => m.CriarLojaPageModule),
    canActivate: [AuthGuard]
  },
  // minha-loja: somente vendedor
  {
    path: 'minha-loja',
    loadChildren: () => import('./pages/loja/minha-loja/minha-loja.module').then( m => m.MinhaLojaPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },

  // Produtos (visualização e listagem exigem login)
  {
    path: 'detalhes/:id',
    loadChildren: () => import('./pages/produto/detalhes/detalhes.module').then( m => m.DetalhesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'lista',
    loadChildren: () => import('./pages/produto/lista/lista.module').then( m => m.ListaPageModule),
    canActivate: [AuthGuard]
  },
  // cadastro de produto: somente vendedor
  {
    path: 'cadastro-produto',
    loadChildren: () => import('./pages/produto/cadastro-produto/cadastro-produto.module').then( m => m.CadastroPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },
  {
    path: 'cadastro-produto/:id',
    loadChildren: () => import('./pages/produto/cadastro-produto/cadastro-produto.module').then( m => m.CadastroPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },

  // Carrinho / Pedidos (comprador)
  {
    path: 'carrinho',
    loadChildren: () => import('./pages/carrinho/carrinho.module').then( m => m.CarrinhoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'finalizar',
    loadChildren: () => import('./pages/pedido/finalizar/finalizar.module').then( m => m.FinalizarPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'meus-pedidos',
    loadChildren: () => import('./pages/pedido/meus-pedidos/meus-pedidos.module').then( m => m.MeusPedidosPageModule),
    canActivate: [AuthGuard]
  },

  // Pedidos recebidos (somente vendedor)
  {
    path: 'recebidos',
    loadChildren: () => import('./pages/pedido/recebidos/recebidos.module').then( m => m.RecebidosPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },

  // Financeiro (somente vendedor)
  {
    path: 'financeiro',
    loadChildren: () => import('./pages/financeiro/financeiro.module').then( m => m.FinanceiroPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },
  {
    path: 'financeiro/:id',
    loadChildren: () => import('./pages/financeiro/financeiro.module').then( m => m.FinanceiroPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./pages/relatorios/relatorios.module').then( m => m.RelatoriosPageModule),
    canActivate: [AuthGuard, VendedorGuard]
  },

  // Pesquisa e perfil (usuário autenticado)
  {
    path: 'pesquisa',
    loadChildren: () => import('./pages/pesquisa/pesquisa.module').then( m => m.PesquisaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./pages/editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule)
  },
  {
    path: 'notificacao',
    loadChildren: () => import('./pages/notificacao/notificacao.module').then( m => m.NotificacaoPageModule)
  },
  {
    path: 'lista-notas',
    loadChildren: () => import('./pages/notas/lista-notas/lista-notas.module').then( m => m.ListaNotasPageModule)
  },
  
 {
  path: 'cadastrar-nota',
  loadChildren: () => import('./pages/notas/cadastrar-nota/cadastrar-nota.module').then(m => m.CadastrarNotaPageModule)
},
{
  path: 'cadastrar-nota/:id',
  loadChildren: () => import('./pages/notas/cadastrar-nota/cadastrar-nota.module').then(m => m.CadastrarNotaPageModule)
},

  {
    path: 'anotacao',
    loadChildren: () => import('./pages/notas/anotacao/anotacao.module').then( m => m.AnotacaoPageModule)
  },
  {
    path: 'anotacao/:id',
    loadChildren: () => import('./pages/notas/anotacao/anotacao.module').then( m => m.AnotacaoPageModule)
  },
  {
    path: 'perfil-loja',
    loadChildren: () => import('./pages/loja/perfil-loja/perfil-loja.module').then( m => m.PerfilLojaPageModule)
  },
  {
    path: 'perfil-loja',
    loadChildren: () => import('./pages/loja/perfil-loja/perfil-loja.module').then( m => m.PerfilLojaPageModule)
  },
  {
  path: 'perfil-loja/:idLoja',
  loadChildren: () => import('./pages/loja/perfil-loja/perfil-loja.module').then(m => m.PerfilLojaPageModule)
}

  ,{
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule)
  }
  ,{
    path: 'conversas',
    loadChildren: () => import('./pages/conversas/conversas.module').then(m => m.ConversasPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
