```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   █ █ █ █▀▀ █▀▄ █▀▄ █▀▀ █▀▀ █ █▀▀ █▄ █                            │
│   █▄█ █ █▀  █▀▄ █ █ █▀  ▀▀█ █ █ █ █ ▀█                            │
│   ▀ ▀ ▀ ▀▀▀ ▀▀  ▀▀  ▀▀▀ ▀▀▀ ▀ ▀▀▀ ▀  ▀                            │
│                                                                     │
│   █▀▄ █▀█ █ █ █ █▄ █ █   █▀█ █▀█ █▀▄ █▀▀ █▀▄                      │
│   █ █ █ █ █▄█ █ █ ▀█ █   █ █ █▀█ █ █ █▀  █▀▄                      │
│   ▀▀  ▀▀▀ ▀ ▀ ▀ ▀  ▀ ▀▀▀ ▀▀▀ ▀ ▀ ▀▀  ▀▀▀ ▀ ▀                      │
│                                                                     │
│   Extraia assets visuais de qualquer site.                          │
│   HTML, CSS, imagens, fontes, SVGs — tudo organizado.               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

```
$ webdesign-downloader --version
  v1.0.0

$ webdesign-downloader --info

  ┌ Projeto
  │
  ├── Stack ........... React 19 · Fastify · Vite · Tailwind v4
  ├── Motor ........... Playwright / Chromium headless
  ├── Modo ............ CLI + API HTTP + Interface Web
  │
  ├ Autor
  │
  ├── Nome ............ Erico Renato Almeida
  ├── Site ............ https://ericorenato.com.br
  └── Instagram ....... @erico.arenato

$ webdesign-downloader https://exemplo.com -o ./assets

  [1/6] Renderizando pagina .............. done
  [2/6] Extraindo assets ................. 47 encontrados
  [3/6] Baixando arquivos ................ 47/47
  [4/6] Reescrevendo URLs ................ done
  [5/6] Extraindo design tokens .......... done
  [6/6] Gerando ZIP ...................... output/exemplo-com.zip

  ✔ Concluido em 12.4s
```

## Funcionalidades

- **Download completo** de assets visuais: HTML, CSS, imagens, fontes, SVGs, favicons
- **Reescrita de URLs** para navegacao offline dos arquivos baixados
- **Extracao de design tokens**: cores, fontes, tamanhos, espacamentos, breakpoints, sombras
- **Limpeza automatica** de scripts de analytics, hydration e smooth-scroll
- **Screenshot** da pagina renderizada
- **Empacotamento ZIP** pronto para download
- **Streaming SSE** com progresso em tempo real na interface web
- **CLI** para uso direto no terminal

## Arquitetura

Monorepo com npm workspaces:

```
webdesign-downloader/
├── frontend/          # React 19 + Vite + Tailwind CSS v4 + Framer Motion
│   └── src/
│       ├── components/    # Header, Hero, UrlInput, ProgressStream, ResultsPanel...
│       ├── hooks/         # useDownload.js (SSE via ReadableStream)
│       └── lib/           # api.js
├── backend/           # Fastify + Playwright
│   └── src/
│       ├── core/          # Pipeline principal
│       │   ├── downloader.js      # Orquestrador
│       │   ├── renderer.js        # Playwright render + network intercept
│       │   ├── asset-extractor.js # Cheerio HTML parse
│       │   ├── css-parser.js      # css-tree (@font-face, @import, url())
│       │   ├── rewriter.js        # Reescrita de URLs para offline
│       │   ├── cleaner.js         # Remove scripts indesejados
│       │   └── token-extractor.js # Extracao de design tokens
│       ├── utils/         # zip.js, file.js, url.js
│       ├── server.js      # Fastify server (SSE + static files)
│       ├── cli.js         # Interface de linha de comando
│       └── config.js      # Configuracao via env vars
├── Dockerfile         # Multi-stage build
└── docker-compose.yml
```

### Pipeline do Backend

```
Render (Playwright) → Extrair assets (Cheerio) → Download (p-limit) →
Parse CSS (css-tree) → Reescrever URLs → Limpar scripts → Extrair tokens → ZIP
```

### API

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/api/download` | POST | Inicia download, retorna stream SSE (`progress`/`complete`/`error`) |
| `/downloads/:id.zip` | GET | Serve arquivo ZIP gerado |
| `/health` | GET | Healthcheck |

## Guia para Alunos: como baixar e rodar o projeto

### 1. O que voce precisa instalar antes

Antes de tudo, voce precisa ter dois programas instalados no seu computador:

**Node.js (versao 20 ou superior)**

1. Acesse https://nodejs.org
2. Baixe a versao **LTS** (o botao verde grande)
3. Execute o instalador e clique em "Next" ate finalizar
4. Para confirmar que instalou certo, abra o terminal e digite:

```bash
node --version
```

Se aparecer algo como `v20.x.x` ou superior, esta tudo certo.

**Git**

1. Acesse https://git-scm.com/downloads
2. Baixe para o seu sistema operacional (Windows, Mac ou Linux)
3. Execute o instalador (no Windows, pode manter todas as opcoes padrao)
4. Para confirmar, abra o terminal e digite:

```bash
git --version
```

Se aparecer algo como `git version 2.x.x`, esta tudo certo.

> **Dica:** No Windows, depois de instalar o Git voce pode usar o **Git Bash** como terminal. Clique com o botao direito em qualquer pasta e selecione "Open Git Bash here".

---

### 2. Baixar o projeto (clonar o repositorio)

Abra o terminal e navegue ate a pasta onde voce quer salvar o projeto. Exemplo:

```bash
cd ~/Desktop
```

Agora clone o repositorio:

```bash
git clone https://github.com/ericorenato/webdesigner_downloader.git
```

Isso vai criar uma pasta chamada `webdesigner_downloader` com todo o codigo. Entre nela:

```bash
cd webdesigner_downloader
```

---

### 3. Instalar as dependencias

O projeto usa bibliotecas externas que precisam ser baixadas. Rode este comando na raiz do projeto:

```bash
npm install
```

Aguarde finalizar (pode levar alguns minutos na primeira vez).

Agora instale o navegador que o backend usa internamente para acessar as paginas:

```bash
cd backend
npx playwright install chromium
cd ..
```

> **Nota:** O Playwright vai baixar uma copia do Chromium (~150 MB). Isso e normal e necessario para o projeto funcionar.

---

### 4. Rodar o projeto

Com tudo instalado, basta rodar:

```bash
npm run dev
```

Isso inicia o frontend e o backend ao mesmo tempo. Voce vai ver mensagens no terminal indicando que os dois servidores estao rodando.

Agora abra o navegador e acesse:

```
http://localhost:5173
```

Pronto! A interface do Webdesign Downloader vai aparecer. Cole a URL de qualquer site e clique para baixar os assets.

---

### 5. Parar o projeto

Para parar os servidores, volte ao terminal e pressione:

```
Ctrl + C
```

---

### Alternativa: rodar com Docker

Se voce ja tem o **Docker Desktop** instalado (https://www.docker.com/products/docker-desktop), pode rodar tudo com um unico comando, sem precisar instalar Node.js:

```bash
git clone https://github.com/ericorenato/webdesigner_downloader.git
cd webdesigner_downloader
docker compose up --build
```

Acesse `http://localhost:3500` no navegador.

---

### Usando pela linha de comando (CLI)

Voce tambem pode usar o projeto direto pelo terminal, sem abrir o navegador:

```bash
node backend/src/cli.js https://exemplo.com -o ./meus-assets
```

Os arquivos serao salvos na pasta `./meus-assets`.

---

### Problemas comuns

| Problema | Solucao |
|----------|---------|
| `node: command not found` | Node.js nao esta instalado ou nao esta no PATH. Reinstale pelo site oficial. |
| `git: command not found` | Git nao esta instalado. Baixe em https://git-scm.com/downloads |
| Erro ao rodar `npm install` | Verifique se esta dentro da pasta do projeto (`cd webdesigner_downloader`) |
| Erro de permissao no Playwright | No Mac/Linux, tente com `sudo npx playwright install chromium` |
| Porta 5173 ja em uso | Outro processo esta usando a porta. Feche-o ou mude a porta no `vite.config.js` |

## Variaveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessario:

| Variavel | Default | Descricao |
|----------|---------|-----------|
| `PORT` | `3500` | Porta do servidor |
| `MAX_CONCURRENT` | `3` | Downloads simultaneos |
| `CLEANUP_INTERVAL_MIN` | `30` | Intervalo de limpeza (min) |
| `MAX_FILE_AGE_MIN` | `60` | Idade maxima dos arquivos (min) |
| `DEFAULT_TIMEOUT` | `30000` | Timeout de renderizacao (ms) |
| `DEFAULT_VIEWPORT_W` | `1440` | Largura do viewport |
| `DEFAULT_VIEWPORT_H` | `900` | Altura do viewport |
| `MAX_ASSET_SIZE_MB` | `10` | Tamanho maximo por asset (MB) |
| `DOWNLOADS_DIR` | `./downloads` | Diretorio dos downloads |

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion

**Backend:** Node.js, Fastify, Playwright, Cheerio, css-tree, archiver

**Infra:** Docker (multi-stage build), npm workspaces

## Bonus: Prompt para extrair Design System de qualquer site

O repositorio inclui o arquivo [`PROMPT_DESIGN.md`](PROMPT_DESIGN.md) — um prompt pronto para usar com IA (como o Claude ou ChatGPT) que recebe o HTML de um site e gera automaticamente uma **pagina de documentacao visual** com tipografia, cores, componentes, layout, animacoes e iconografia extraidos diretamente do codigo original.

Util para estudar e documentar o design system de qualquer site de referencia.

---

## Autor

Criado por **Erico Renato Almeida**.

- Site: [ericorenato.com.br](https://ericorenato.com.br)
- Instagram: [@erico.arenato](https://instagram.com/erico.arenato)

## License

MIT
