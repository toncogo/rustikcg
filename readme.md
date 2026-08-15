# 🌿 RustikCG

Sistema web para **gerenciamento e locação de espaço para festas e eventos**, desenvolvido com uma arquitetura baseada em serviços separados para frontend, backend e banco de dados.

O projeto tem como objetivo disponibilizar uma plataforma onde usuários possam criar uma conta, gerenciar seus dados, consultar disponibilidade, realizar locações e acompanhar todo o histórico relacionado aos eventos.

> 🚧 **Status do projeto:** Em desenvolvimento.

---

## 📋 Sobre o projeto

O **RustikCG** é uma aplicação web voltada à administração de um espaço para festas e eventos com identidade visual rústica.

O sistema está sendo desenvolvido para centralizar processos como:

* cadastro e autenticação de usuários;
* gerenciamento de perfis;
* gerenciamento de locações;
* consulta de datas e disponibilidade;
* histórico de locações;
* acompanhamento do status das reservas;
* armazenamento de contratos;
* armazenamento de comprovantes;
* controle de pagamentos e cancelamentos;
* futura integração com gateway de pagamento.

---

## 🏗️ Arquitetura

A aplicação utiliza uma arquitetura dividida em três serviços principais:

```text
                         INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │   Frontend    │
                    │ Nginx :8080   │
                    │ HTML/CSS/JS   │
                    └───────┬───────┘
                            │
                            │ HTTP / API
                            ▼
                    ┌───────────────┐
                    │    Backend    │
                    │ Node.js       │
                    │ Express :8000 │
                    └───────┬───────┘
                            │
                            │ PostgreSQL
                            ▼
                    ┌───────────────┐
                    │   Database    │
                    │ PostgreSQL 17 │
                    └───────────────┘
```

Cada componente é executado em um **container Docker independente**.

---

## 🐳 Containers

O ambiente é gerenciado utilizando **Docker Compose**.

### Frontend

Responsável pela interface apresentada ao usuário.

Atualmente utiliza:

* HTML5;
* CSS3;
* JavaScript;
* Nginx.

O frontend está inicialmente sendo desenvolvido com tecnologias web tradicionais, com possibilidade de migração futura para **React**.

### Backend

Responsável pelas regras de negócio e comunicação entre frontend e banco de dados.

Tecnologias:

* Node.js;
* Express;
* PostgreSQL Driver (`pg`);
* API REST.

### Banco de dados

Responsável pela persistência das informações da aplicação.

Tecnologia:

* PostgreSQL 17.

Os dados do PostgreSQL são armazenados utilizando **Docker Volume**, permitindo preservar as informações mesmo quando o container é removido ou recriado.

---

## 🔐 Segurança da arquitetura

O banco de dados não precisa ser diretamente acessível pelo frontend.

A comunicação segue o fluxo:

```text
Usuário
   │
   ▼
Frontend
   │
   ▼
Backend / API
   │
   ▼
PostgreSQL
```

No ambiente Docker existem redes separadas:

```text
frontend_network

Frontend ───────── Backend


backend_network

Backend ────────── PostgreSQL
```

A rede utilizada pelo banco pode ser configurada como interna, reduzindo sua exposição aos demais componentes.

---

## 📁 Estrutura do projeto

```text
rustikcg/
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

A estrutura poderá ser expandida conforme novas funcionalidades forem implementadas.

---

## 🗄️ Dados previstos

O banco de dados será responsável por armazenar diferentes informações relacionadas ao funcionamento da plataforma.

### 👤 Usuários

Entre os dados de perfil poderão existir:

* nome;
* e-mail;
* telefone;
* cidade;
* estado;
* endereço;
* profissão;
* foto de perfil;
* informações de autenticação.

Dados sensíveis de autenticação deverão ser armazenados utilizando mecanismos adequados de segurança, incluindo **hash de senhas**.

### 📅 Locações

Cada locação poderá possuir informações como:

```text
Data
Horário
Cliente
Valor
Status
Contrato
Pagamento
Comprovante
```

Os possíveis estados de uma locação incluem:

```text
AGENDADO
FINALIZADO
CANCELADO
```

### 📄 Documentos

O sistema também deverá permitir o gerenciamento de documentos associados às locações, incluindo:

* contratos;
* comprovantes de pagamento;
* comprovantes de cancelamento;
* documentos relacionados à devolução.

---

## 💳 Pagamentos

Está prevista uma futura integração com um **gateway de pagamento**.

A intenção é delegar o processamento financeiro a um serviço especializado, evitando que informações financeiras sensíveis sejam processadas diretamente pela aplicação.

O backend ficará responsável principalmente por registrar informações como:

```text
ID da transação
Status
Valor
Data
Método
Referência da locação
```

---

## 🩺 Health Check

O backend possui endpoints para verificar o funcionamento dos serviços.

### Backend

```http
GET /api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "rustikcg_backend"
}
```

### Banco de dados

```http
GET /api/health/database
```

Esse endpoint verifica a comunicação entre:

```text
Backend → PostgreSQL
```

Quando a conexão estiver funcionando corretamente, será retornado o status do banco e seu horário atual.

---

## 🚀 Executando o projeto

### Pré-requisitos

É necessário possuir:

* Git;
* Docker;
* Docker Compose.

Clone o repositório:

```bash
git clone <URL-DO-REPOSITORIO>
```

Entre no diretório:

```bash
cd rustikcg
```

Configure as variáveis de ambiente necessárias no arquivo:

```text
.env
```

Exemplo:

```env
POSTGRES_DB=rustikcg
POSTGRES_USER=rustikcg_user
POSTGRES_PASSWORD=altere_para_uma_senha_segura
```

> ⚠️ O arquivo `.env` contendo credenciais reais **não deve ser enviado ao GitHub**.

Adicione ao `.gitignore`:

```gitignore
.env
node_modules/
```

---

## ▶️ Iniciando os containers

Execute:

```bash
docker compose up -d --build
```

Verifique os containers:

```bash
docker compose ps
```

Acompanhe os logs:

```bash
docker compose logs -f
```

Para visualizar apenas o backend:

```bash
docker compose logs -f backend
```

Para visualizar o banco:

```bash
docker compose logs -f db
```

---

## ⏹️ Encerrando o ambiente

```bash
docker compose down
```

Para reiniciar:

```bash
docker compose restart
```

Para reconstruir as imagens:

```bash
docker compose up -d --build
```

---

## 🌐 Acesso

Durante o desenvolvimento local, o frontend pode ser acessado através de:

```text
http://localhost:8080
```

O backend utiliza internamente a porta:

```text
8000
```

---

## 🌳 Estratégia Git

O projeto pode utilizar branches separadas para desenvolvimento/testes e produção.

```text
main
 │
 │ Produção
 │
 └───────────────► versão estável


test
 │
 │ Desenvolvimento / testes
 │
 └───────────────► novas funcionalidades
```

Fluxo esperado:

```text
Nova funcionalidade
        │
        ▼
      test
        │
        ▼
     testes
        │
        ▼
   Pull Request
        │
        ▼
      main
        │
        ▼
    produção
```

---

## 🛣️ Roadmap

Funcionalidades planejadas para as próximas versões:

* [ ] Sistema completo de cadastro de usuários
* [ ] Autenticação e login
* [ ] Hash seguro de senhas
* [ ] Autorização de usuários
* [ ] Perfil do usuário
* [ ] Upload de foto de perfil
* [ ] Sistema de locações
* [ ] Calendário de disponibilidade
* [ ] Histórico de locações
* [ ] Controle de status das reservas
* [ ] Gerenciamento de contratos
* [ ] Upload de comprovantes
* [ ] Sistema de cancelamento
* [ ] Integração com gateway de pagamento
* [ ] Painel administrativo
* [ ] Logs e monitoramento
* [ ] Sistema de backup do PostgreSQL
* [ ] Migração para infraestrutura em nuvem
* [ ] HTTPS
* [ ] CI/CD
* [ ] Ambiente separado de teste e produção
* [ ] Migração futura do frontend para React

---

## 🧰 Tecnologias

| Tecnologia     | Utilização                |
| -------------- | ------------------------- |
| HTML5          | Estrutura do frontend     |
| CSS3           | Interface e estilização   |
| JavaScript     | Interatividade            |
| Nginx          | Servidor do frontend      |
| Node.js        | Backend                   |
| Express        | API REST                  |
| PostgreSQL     | Banco de dados            |
| Docker         | Containerização           |
| Docker Compose | Orquestração local        |
| Git            | Controle de versão        |
| GitHub         | Hospedagem do repositório |

---

## 🔄 Evolução do projeto

O RustikCG está sendo desenvolvido de forma incremental.

A arquitetura foi preparada para permitir que os componentes sejam evoluídos individualmente:

```text
HTML/CSS/JS
     │
     ▼
   React
```

```text
Docker local
     │
     ▼
Servidor de testes
     │
     ▼
Servidor de produção
     │
     ▼
Infraestrutura em nuvem
```

O PostgreSQL também poderá futuramente ser migrado para um serviço de banco de dados gerenciado em nuvem sem exigir uma reformulação completa da aplicação.

---

## 🎯 Objetivo

Além de atender às necessidades reais de gerenciamento e locação do espaço, o RustikCG também busca aplicar na prática conceitos de:

* desenvolvimento web;
* APIs REST;
* Node.js;
* bancos de dados relacionais;
* PostgreSQL;
* Docker;
* redes;
* segurança;
* Git e GitHub;
* arquitetura de software;
* infraestrutura;
* DevOps.

---

## 📌 Status

```text
Frontend        🟡 Em desenvolvimento
Backend         🟡 Em desenvolvimento
PostgreSQL      🟢 Configurado
Docker          🟢 Configurado
API             🟡 Em desenvolvimento
Autenticação    🔴 Planejada
Locações        🔴 Planejada
Pagamentos      🔴 Planejado
Deploy          🔴 Planejado
```

---

## 📄 Licença

Este projeto é de uso privado e está atualmente em desenvolvimento.

Todos os direitos reservados.

By @toncogo