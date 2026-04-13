# Webdesign Downloader

Ferramenta CLI + Web que baixa todos os assets visuais de uma webpage (HTML, CSS, imagens, fontes, SVGs) e organiza para analise de design system. Usa Playwright/Chromium headless para renderizar as paginas.

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

## Quick Start

### Com Docker (recomendado)

```bash
docker compose up --build
```

Acesse `http://localhost:3500`

### Desenvolvimento local

```bash
# Instalar dependencias
npm install

# Instalar Playwright (necessario)
cd backend && npx playwright install chromium && cd ..

# Rodar frontend + backend simultaneamente
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3500`

### CLI

```bash
node backend/src/cli.js <url> -o ./output
```

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

## License

MIT
