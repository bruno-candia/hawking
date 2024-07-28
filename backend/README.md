# AutoClock

## Descrição

AutoClock é uma API para automatizar o processo de bater ponto, utilizando Node.js, TypeScript e MongoDB. A aplicação gera horários de entrada e saída randômicos, notifica o usuário via WhatsApp, e realiza o registro de ponto automaticamente.

## Funcionalidades

- Geração automática de horários de entrada e saída.
- Notificação via WhatsApp com opções para confirmar, adiar ou cancelar o registro de ponto.
- Automação para acessar o site de ponto, realizar login e registrar o ponto.
- Salvamento dos registros no banco de dados MongoDB.

## Estrutura do Projeto

```plaintext
src/
  ├── config/
  ├── controllers/
  ├── middleware/
  ├── models/
  ├── routes/
  ├── services/
  ├── types/
  ├── utils/
  ├── index.ts
tests/
.env
package.json
tsconfig.json
README.md
```

## Pré-requisitos

- Node.js versão >= 20
- MongoDB
- WhatsApp API Key

## Configuração do Projeto

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/autoclock.git
   cd autoclock
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:

   ```plaintext
   MONGODB_URI=sua_url_mongodb
   WHATSAPP_API_KEY=sua_api_key
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Endpoints da API

### Usuários

- **GET /users**: Lista todos os usuários.
- **POST /users**: Cria um novo usuário.

### Registros de Ponto

- **GET /attendance**: Lista todos os registros de ponto.
- **POST /attendance**: Cria um novo registro de ponto.

## Contribuindo

1. Faça um fork do repositório.
2. Crie uma branch para sua feature/bugfix (`git checkout -b feature/nova-feature`).
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Faça push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.
