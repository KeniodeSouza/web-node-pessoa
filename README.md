# WEBSERVICE-NODE-PESSOA-ENDERECO 🚀
---

**Versão: 1.0.0**

Webservice robusto em Node.js para gerenciamento de Pessoas e Endereço. 
Utilizando Clean Architecture, TypeORM e PostgreSQL.

> O projeto completo da aplicação está localizado no diretório **/Documents** deste projeto.


## 📋 Funcionalidades

- Cadastro e gestão de **Pessoa** e **Endereço**.
- Validação de dados rigorosa com **Joi**.
- Documentação interativa via **Swagger UI**.
- Tratamento de erros centralizado (sem try/catch redundante).
- Compatibilidade Cross-Platform (Windows/Linux).


## 🛠️ Tecnologias Utilizadas

- **Node.js** & **TypeScript**
- **Express** (Framework Web)
- **TypeORM** (Persistência de dados)
- **PostgreSQL** (Banco de dados)
- **Joi** (Validação de Schemas)
- **Swagger** (Documentação)


## Arvore de Diretorios
```text
WEBSERVICE-NODE-PESSOA/
├── Documents/
├── dist/
├── src/
│   ├── controllers/        # Recebe requisições e valida com Joi
│   ├── db/                 # Configurações do Banco de dados
│   ├── entities/           # Definição da Entidades
│   ├── enums/              # Definição de Enums e validação
│   ├── errors/             # Tratamento de erro centralizado
│   ├── middlewares/        # Tratamento de erro centralizado e validação
│   ├── services/           # Regras de negócio
│   ├── repositories/       # TypeORM Entities, Migrations e Repositories
│   │   └── migrations      # Migração
│   ├── routes/             # Definição de rotas (Genericas e Específicas)
│   ├── schemas/            # Schemas Joi (Separados da validação)
│   ├── swagger/            # Configurações Swagger
│   ├── server.ts           # Inicialização do servidor
│   └── app.ts              # Configuração do Aplicativo
├── .env                    # Variáveis de ambiente
├── .gitignore              # Modulos ignorados pelo Git 
├── package.json            # Complentes e dependencias do projeto
├── README.md               # Descrição do projeto
└── tsconfig.json           # Definição de desenvolvimento
```
---


## 🔧 Instalação e Execução

1. **Instalação de desenvolvimento:**
```bash
	npm install express dotenv pg typeorm reflect-metadata joi cors swagger-ui-express
	npm install -D typescript ts-node-dev copyfiles yamljs @types/express @types/node @types/swagger-ui-express @types/cors
```

2. **Clone o repositório:**
```bash
   git clone [https://github.com/SEU_USUARIO/WEBSERVICE-NODE-PESSOA.git](https://github.com//WEBSERVICE-NODE-PESSOA-ENDERECO.git)
```

