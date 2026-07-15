# project-pdm

App mobile em React Native + TypeScript (Expo) para o Programa Criança Feliz, consumindo a API `criancaFeliz-pw1`.

## Pré-requisitos

- Node.js 18+ e npm
- API `criancaFeliz-pw1` rodando localmente (ver README daquele repo): `docker-compose up -d` para subir Postgres/PostGIS, depois `npm install && npm run dev` — serve em `http://localhost:3333`

## Setup

```bash
npm install
cp .env.example .env
```

Ajuste `EXPO_PUBLIC_API_URL` no `.env` conforme onde o app vai rodar:

- Emulador Android: `http://10.0.2.2:3333`
- iOS simulator / web / Expo Go no mesmo Wi-Fi: `http://<ip-da-maquina>:3333`

## Rodando

```bash
npx expo start
```

Abra no Expo Go (celular) ou em um emulador/simulador a partir do menu do Metro.

## Estrutura

- `src/theme` — cores, tipografia e espaçamento extraídos do Figma
- `src/components` — componentes de UI reutilizáveis
- `src/api` — cliente axios (com interceptor de autenticação) e endpoints tipados da API
- `src/context/AuthContext.tsx` — autenticação (login/logout, token persistido)
- `src/navigation` — stacks e tabs
- `src/features` — telas por área: `auth`, `beneficiarios` (CRUD + visitas, integrado à API), `relatorios`, `inicio`, `agenda`, `perfil`

## Limitações conhecidas

- A API ainda não persiste imagens de visita (`POST /visitas` descarta o campo `imagens`), então fotos anexadas na tela de registro de visita ficam salvas apenas no dispositivo.
- As telas de Início, Agenda e Relatórios usam dados de exemplo — ainda não há endpoints correspondentes na API.
