# project-pdm

App mobile em React Native + TypeScript (Expo) para o Programa Criança Feliz, consumindo a API `criancaFeliz-pw1`.

## Pré-requisitos

- Node.js 18+ e npm
- API `criancaFeliz-pw1` rodando localmente (ver README daquele repo): `docker-compose up -d` para subir Postgres/PostGIS, depois `npm install && npm run dev` — serve em `http://localhost:3333`
- Microserviço `serviceImages` rodando localmente (`npm install && npm run dev`, precisa de `.env` com `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` — ver `.env.example` daquele repo) — serve em `http://localhost:3000`

## Setup

```bash
npm install
cp .env.example .env
```

Ajuste `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_IMAGE_SERVICE_URL` no `.env` conforme onde o app vai rodar:

- Emulador Android: `http://10.0.2.2:3333` e `http://10.0.2.2:3000`
- iOS simulator / web / Expo Go no mesmo Wi-Fi: `http://<ip-da-maquina>:3333` e `http://<ip-da-maquina>:3000`

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

## Upload de imagem

A API `criancaFeliz-pw1` não persiste imagens de visita (`POST /visitas` descarta o campo `imagens` — o model `Imagem` existe mas nenhum controller grava linha nele). Por isso, a foto anexada na tela de registro de visita é enviada de verdade para o microserviço próprio `serviceImages` (`POST /upload`, campo `image`, retorna uma URL pública do Supabase Storage), e o vínculo entre essa URL e a visita é lembrado localmente no dispositivo (`AsyncStorage`), já que nenhum dos dois backends guarda essa associação.

## Limitações conhecidas

- As telas de Início, Agenda e Relatórios usam dados de exemplo — ainda não há endpoints correspondentes na API.
- O vínculo foto↔visita só existe no dispositivo que fez o upload (reinstalar o app ou trocar de aparelho perde essa referência, embora a imagem em si continue no Supabase Storage).
