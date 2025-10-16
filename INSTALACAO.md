# 📦 Guia de Instalação - Vehicle Tracking Portal

## Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)
- **PostgreSQL** (versão 14 ou superior) - [Download aqui](https://www.postgresql.org/download/)
- **Git** (opcional, para clonar o projeto) - [Download aqui](https://git-scm.com/)

## 📥 Passo 1: Baixar o Projeto

### Opção A: Baixar como ZIP do Replit
1. No Replit, clique nos três pontos (...) no canto superior direito
2. Selecione "Download as zip"
3. Extraia o arquivo ZIP em uma pasta no seu computador

### Opção B: Usando Git (se o projeto estiver no GitHub)
```bash
git clone <URL_DO_REPOSITORIO>
cd vehicle-tracking-portal
```

## 🔧 Passo 2: Instalar Dependências

Abra o terminal (CMD, PowerShell ou Git Bash) na pasta do projeto e execute:

```bash
npm install
```

Isso vai instalar todas as bibliotecas necessárias.

> **💡 Nota para Windows:** O projeto já está configurado com `cross-env` para funcionar perfeitamente no Windows!

## 🗄️ Passo 3: Configurar o Banco de Dados

1. **Criar o banco de dados PostgreSQL:**

```bash
# Entre no PostgreSQL
psql -U postgres

# Crie um novo banco de dados
CREATE DATABASE vehicle_tracking;

# Saia do PostgreSQL
\q
```

2. **Criar arquivo de variáveis de ambiente:**

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
# URL de conexão com o PostgreSQL
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/vehicle_tracking

# Ambiente
NODE_ENV=development
```

⚠️ **Importante:** Substitua `sua_senha` pela senha do seu PostgreSQL.

## 🚀 Passo 4: Preparar o Banco de Dados

Execute o comando para criar as tabelas no banco:

```bash
npm run db:push
```

## ▶️ Passo 5: Rodar o Sistema

Execute o comando:

```bash
npm run dev
```

O sistema estará disponível em: **http://localhost:5000**

## 📝 Credenciais de Acesso

O sistema usa a API externa para autenticação. Use as credenciais que você já possui para fazer login.

A API externa está em: `https://tracker-api-rodrigocastrom1.replit.app`

## 🛠️ Comandos Úteis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a versão de produção
- `npm run db:push` - Atualiza o esquema do banco de dados
- `npm run db:studio` - Abre interface visual do banco (se disponível)

## ⚠️ Solução de Problemas

### Erro de conexão com o banco de dados
- Verifique se o PostgreSQL está rodando: `sudo service postgresql status` (Linux) ou pelo Gerenciador de Tarefas (Windows)
- Confirme que a URL no `.env` está correta
- Teste a conexão: `psql -U postgres -d vehicle_tracking`

### Porta 5000 já em uso
Se a porta 5000 estiver ocupada, você pode mudar criando um arquivo `.env` com:
```env
PORT=3000
```
Ou qualquer outra porta disponível.

### Erro "ENOTSUP: operation not supported" no Windows
✅ **Este erro já foi corrigido!** O servidor agora detecta automaticamente se está rodando no Windows e usa `localhost` ao invés de `0.0.0.0`.

### Erro ao instalar dependências
- Limpe o cache: `npm cache clean --force`
- Delete a pasta `node_modules` e o arquivo `package-lock.json`
- Execute novamente: `npm install`

## 🌐 Estrutura do Projeto

```
vehicle-tracking-portal/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   └── lib/          # Utilitários e configurações
├── server/                # Backend (Express + Node.js)
│   ├── routes.ts         # Rotas da API
│   ├── lib/             # Cliente da API externa
│   └── index.ts         # Servidor principal
├── shared/               # Código compartilhado
│   └── schema.ts        # Esquemas do banco de dados
└── package.json         # Dependências do projeto
```

## 📞 Suporte

Se encontrar problemas durante a instalação, verifique:

1. Versões dos pré-requisitos instalados
2. Logs de erro no terminal
3. Configuração das variáveis de ambiente no `.env`

## 🚀 Próximos Passos

Após a instalação bem-sucedida:

1. Acesse http://localhost:5000
2. Faça login com suas credenciais
3. Comece a usar o sistema de rastreamento!

---

✅ **Sistema pronto para uso na sua máquina local!**
