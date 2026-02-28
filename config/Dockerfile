## Dockerfile - Servidor de aplicação

FROM node:18
# Cria o diretório da app
	WORKDIR /usr/src/app

# Copia os arquivos de dependências
	COPY package*.json ./

# Instala as dependências
	RUN npm install

# Copia o restante dos arquivos do projeto
	COPY . .

# Expõe a porta que o Express usa
	EXPOSE 3000

# Comando para rodar a aplicação
	CMD ["node", "server.js"]