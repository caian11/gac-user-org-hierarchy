# Instruções do Projeto — GAC User Org Hierarchy

Esta API foi desenvolvida em **NestJS** com **PostgreSQL** para gerenciar hierarquias de usuários e grupos utilizando a estratégia de **Closure Table**.

## 🛠 Dependências Necessárias

Antes de começar, certifique-se de ter instalado:
- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose**
- **Python 3.12+** (para rodar os testes contidos na raiz do desafio)

## 🚀 Como Rodar a Aplicação

### 1. Banco de Dados (Docker)
A aplicação utiliza o PostgreSQL. Um arquivo `docker-compose.yaml` está configurado para subir o banco na porta **5433** (para evitar conflitos com instâncias locais na 5432).

Na raiz do projeto, execute:
```bash
docker-compose up -d
```
## 2. Instalação e Execução da API

### Instalar dependências do Node
```bash
npm install
```

### Iniciar a aplicação em modo de desenvolvimento
```bash
npm run start:dev
```

A API estará disponível em: http://localhost:3000

---

## Como Rodar os Testes (Python)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
### 2. Testes de Integração (Pytest)
```bash
export BASE_URL="http://localhost:3000"
pytest -v
```

### 3. Teste de Carga (Locust)
```bash
locust -f locustfile.py --headless -u 30 -r 5 -t 1m --host "http://localhost:3000"
```