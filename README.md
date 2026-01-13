# 🍽️ CEFOODS
## Plataforma digital para gestão e comercialização de alimentos em ambientes coletivos

---

## 📌 Sumário
- [📖 Sobre o Projeto](#-sobre-o-projeto)
- [❗ Problema e Motivação](#-problema-e-motivação)
- [💡 Proposta de Solução](#-proposta-de-solução)
- [🚀 Principais Funcionalidades](#-principais-funcionalidades)
- [🧩 Arquitetura do Sistema](#-arquitetura-do-sistema)
- [🛠️ Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🔐 Segurança do Sistema](#-segurança-do-sistema)
- [🌍 Escalabilidade e Aplicações](#-escalabilidade-e-aplicações)
- [🎓 Contexto Acadêmico](#-contexto-acadêmico)
- [📈 Potencial de Mercado](#-potencial-de-mercado)
- [▶️ Como Executar o Projeto](#-como-executar-o-projeto)

---

## Sobre o Projeto

O **CEFOODS** é uma plataforma digital desenvolvida para **organizar, gerenciar e otimizar a comercialização de alimentos** em ambientes coletivos, conectando vendedores e consumidores por meio de um sistema moderno, seguro e escalável.
O projeto centraliza processos que normalmente são realizados de forma informal, como pedidos, controle de estoque, comunicação entre vendedor e cliente e organização interna dos comércios.
O sistema se destaca por sua **flexibilidade**, podendo ser adaptado a diferentes contextos e modelos de negócio dentro do setor alimentício.
Em ambientes coletivos de alimentação, como escolas, universidades, food parks, eventos e praças de alimentação, são comuns problemas como:

- Filas e perda de tempo;  
- Falta de organização nos pedidos;  
- Controle ineficiente de estoque;  
- Comunicação fragmentada entre vendedor e cliente;  
- Ausência de histórico e rastreabilidade;  
- Dificuldade de gestão para pequenos comerciantes;  

Esses fatores comprometem tanto a experiência do consumidor quanto a eficiência operacional dos vendedores.

---

## Proposta de Solução

O **CEFOODS** propõe uma **plataforma digital unificada**, onde:

- 🏪 Vendedores gerenciam lojas, produtos, pedidos e anotações internas  
- 🛒 Consumidores acessam cardápios, realizam pedidos e acompanham status  
- 🔄 O sistema organiza e sincroniza todas as operações em tempo real  

Tudo isso com foco em **agilidade, controle e escalabilidade**.

---

## Principais Funcionalidades

### 👤 Usuários
- Cadastro e autenticação
- Perfis distintos (comprador e vendedor)
- Histórico de interações
- Notificações em tempo real

### 🏪 Lojas
- Cadastro e gerenciamento de lojas
- Associação de usuários à loja
- Controle de status (aberta/fechada)
- Bloco de anotações exclusivo por loja

### 📦 Produtos
- Cadastro, edição e exclusão de produtos
- Upload de imagem diretamente do dispositivo
- Controle de estoque
- Sistema de avaliações (nota média)
- Comentários por produto

### 🛒 Pedidos
- Criação e acompanhamento de pedidos
- Status dinâmico (pendente, aceito, recusado, concluído)
- Sincronização automática entre vendedor e cliente
- Reversão automática de estoque em cancelamentos

### 🔔 Notificações em Tempo Real
- Sistema via WebSocket
- Organização por tipo e status
- Atualização instantânea de eventos

### 📝 Sistema de Anotações
- Criação, edição e exclusão de notas
- Upload e download de múltiplos anexos
- Organização por data
- Uso interno para lembretes e controle

---

## Arquitetura do Sistema

O CEFOODS segue uma **arquitetura em camadas**, garantindo organização, manutenibilidade e escalabilidade:

- **Controller** → Recebe requisições HTTP
- **Service** → Regras de negócio
- **Repository (JPA)** → Persistência de dados
- **DTOs** → Transferência segura de informações
- **WebSocket Layer** → Comunicação em tempo real

---

## Tecnologias Utilizadas

### 🔙 Backend
- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring WebSocket (STOMP)
- Hibernate
- MySQL / MariaDB
- API REST
- Upload multipart/form-data

### 🔜 Frontend
- Ionic Framework
- Angular
- TypeScript
- HTML5
- SCSS
- Consumo de API REST
- WebSocket para notificações

---

## Segurança do Sistema

A segurança do CEFOODS foi construída com base em boas práticas:

- 🔒 Controle de acesso por usuário
- ✔️ Validação de dados no backend
- 🧱 Separação de responsabilidades
- 🔗 Relacionamentos bem definidos entre entidades
- 📉 Prevenção de inconsistências de estoque
- 🧾 Uso de DTOs para proteger dados sensíveis
- 🔄 Comunicação em tempo real sem exposição indevida

---

## Escalabilidade e Aplicações

O principal diferencial do CEFOODS é sua **volatilidade**, permitindo adaptação para diversos cenários:

- 🏬 Praças de alimentação de shoppings
- ✈️ Aeroportos e rodoviárias
- 🏫 Escolas (cardápio digital com controle dos pais)
- 🎓 Universidades e centros acadêmicos
- 🚚 Food trucks e food parks
- 🎪 Eventos e feiras gastronômicas
- 🏢 Comércio interno em empresas e instituições

---

## Contexto Acadêmico

O CEFOODS foi desenvolvido como **projeto de defesa de estágio** no curso técnico de **Desenvolvimento de Sistemas**, integrando conhecimentos de:

- Programação Orientada a Objetos
- Desenvolvimento Web e Mobile
- Banco de Dados
- Arquitetura de Software
- Integração Frontend e Backend
- Boas práticas de engenharia de software

---

## Potencial de Mercado

O projeto apresenta alto potencial para:

- 🚀 Plataformas SaaS
- 🤝 Soluções B2B e B2C
- 🏢 Ambientes corporativos e educacionais
- 🌱 Startups do setor alimentício

O CEFOODS não é apenas um aplicativo, mas uma **base tecnológica escalável e adaptável**.

---

## Como Executar o Projeto

### 📋 Pré-requisitos
- Java 17+
- Node.js
- Ionic CLI
- MySQL ou MariaDB
- Git

### 🔙 Backend
1. Configure o banco de dados
2. Ajuste o `application.properties`
3. Execute o projeto Spring Boot

### 🔜 Frontend
```bash
npm install
ionic serve
