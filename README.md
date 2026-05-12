# 🎬 Sulo Movies: Sistema de Recomendação de Filmes Premium

<div align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" />
  <img src="https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Groq-000000?style=for-the-badge&logo=groq&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/Llama_3-0466C8?style=for-the-badge&logo=meta&logoColor=white" alt="Llama 3" />
</div>

<br/>

Bem-vindo ao **Sulo Movies**, uma plataforma cinematográfica imersiva, inteligente e personalizada. Desenvolvida com as mais recentes tendências de design "Neo-Brutalist" e "Glassmorphism", e impulsionada por Inteligência Artificial para entregar as melhores recomendações de filmes.

---

## ✨ Funcionalidades Principais

- **🧠 AI Movie Matchmaker**: Assistente inteligente movido a Meta Llama 3 (via Groq API) que processa os seus desejos em linguagem natural para devolver sugestões perfeitas.
- **🎥 Trailers Automáticos**: Ao passar o rato num filme em destaque na página inicial, o trailer (vía YouTube/TMDB) reproduz-se silenciosamente em segundo plano, como na Netflix.
- **👤 Elenco e Perfis Interativos**: Clique num ator para explorar a sua biografia e filmografia completa com ordenação inteligente.
- **📊 Estatísticas Pessoais ("Spotify Wrapped")**: Acompanhe o seu tempo de ecrã, total de filmes vistos, géneros favoritos e descubra o seu "Vibe" de utilizador (ex: *Mestre da Sétima Arte*).
- **🌗 Modos Claro & Escuro**: Suporte nativo e otimizado com variáveis CSS que garantem uma transição fluída e sem falhas em toda a plataforma.
- **🌍 Multi-idioma Rápido**: Alteração de idioma em tempo real, sincronizada através de injeção direta nos pedidos da API, sem conflitos ou atrasos de base de dados.
- **📤 Partilha Nativa**: Botões modernos que utilizam a Web Share API para fácil partilha nas redes sociais ou mensagens.

---

## 🏗️ Arquitetura do Sistema

O sistema está dividido em duas partes distintas (Arquitetura Cliente-Servidor Desacoplada): um Frontend moderno em Angular (SPA) e um Backend seguro em PHP Nativo (API REST).

```mermaid
graph TD
    subgraph Frontend [🌐 Frontend (Angular 17+)]
        UI[User Interface] --> Services[API Services]
        Services --> i18n[Ngx-Translate]
    end

    subgraph Backend [⚙️ Backend (PHP Nativo)]
        API[API Router] --> Middleware[JWT / Auth]
        Middleware --> Controllers[Controllers]
        Controllers --> Models[Models (PDO/MySQL)]
        Controllers --> External[External Services]
    end

    subgraph APIs Externas [🌍 APIs Externas]
        TMDB[TMDB API (Filmes)]
        OMDB[OMDB API (Extra)]
        GROQ[Groq API (Llama 3)]
    end

    Frontend -- Pedidos HTTP (JSON) --> Backend
    External <-- Fetch --> Backend
```

### Fluxo de Dados e Caching

Para minimizar custos e tempos de carregamento, o backend implementa uma estratégia de _caching_ robusta em ficheiros (File-based caching) para todas as chamadas à API do TMDB e dados imutáveis (ex: detalhes de atores por 24h, listagens populares por 1h).

---

## 🚀 Como Iniciar (Setup)

### 1. Requisitos
- **Servidor Web:** XAMPP, WAMP, ou MAMP (PHP 8.1+ e MySQL 8+).
- **Node.js:** Versão 18+ e npm.
- **Angular CLI:** `npm install -g @angular/cli`.
- **Chaves de API:** Registo gratuito no [TMDB](https://www.themoviedb.org/) e [Groq](https://console.groq.com/).

### 2. Configurar o Backend (PHP)

1. Entre na pasta `backend`:
   ```bash
   cd backend
   ```
2. Crie e configure o ficheiro `.env`:
   - Copie o `.env.example` para `.env`
   - Preencha as suas chaves (`TMDB_API_KEY`, `GROQ_API_KEY`) e detalhes da base de dados.
   - **Nota:** Ajuste o `APP_URL` consoante o caminho do seu servidor (ex: `http://localhost/srf-movies/backend/public`).
3. Instale o Banco de Dados:
   - Aceda a `http://localhost/srf-movies/backend/setup_db.php` no seu browser. Isto criará todas as tabelas e utilizadores de teste automaticamente lendo os dados do seu `.env`.

### 3. Configurar o Frontend (Angular)

1. Entre na pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Verifique o ambiente (opcional):
   No ficheiro `src/environments/environment.ts`, assegure que o `apiUrl` aponta para o seu backend.
4. Inicie o servidor de desenvolvimento:
   ```bash
   ng serve --open
   ```

A plataforma deverá abrir agora no seu browser padrão em `http://localhost:4200`.

---

## 🤝 Colaboração de Equipa: WAMP vs XAMPP

Este projeto está perfeitamente preparado para suportar o ambiente do dono do projeto (Manuel-Sulo, via XAMPP) e de outros colaboradores (ex: quem usa WAMP). Como o ficheiro `.env` **nunca vai para o GitHub** (está no `.gitignore`), cada programador terá o seu próprio ambiente sem causar conflitos!

**Para o Dono do Projeto (Manuel-Sulo - XAMPP):**
Ao fazeres o `git clone` (se mudaste de máquina) ou o `git pull` (para receberes estas novas atualizações), basta:
1. Garantir que tens o teu `.env` na pasta `backend` (podes basear-te no `.env.example`).
2. No `.env`, verificar se a tua porta está correta para o XAMPP (normalmente `DB_PORT=3307` ou `3306`).
3. Mudar o `APP_URL` para o nome da tua pasta no *htdocs* (ex: `http://localhost/EngSof-lab4/backend/public`).
4. Iniciar o MySQL e o Apache no painel do XAMPP e aceder a `http://localhost/EngSof-lab4/backend/setup_db.php` se precisares de reinstalar a base de dados.

**Para Colaboradores (Ex: Ambiente WAMP):**
Mesmo procedimento ao clonar, mas tipicamente usas `DB_PORT=3306` e o `APP_URL` ajustado à pasta no *www* (ex: `http://localhost/srf-movies/backend/public`). O `setup_db.php` detetará automaticamente as portas corretas baseadas no teu `.env` local.

---

## 🧪 Contas de Teste

Após correr o `setup_db.php`, o sistema cria automaticamente:

- **Admin:** `admin@movierecommender.ao` | Pass: `admin123`
- **User:** `user@movierecommender.ao` | Pass: `user123`

---

> Desenvolvido para transformar qualquer ecrã num autêntico cinema inteligente. 🍿
