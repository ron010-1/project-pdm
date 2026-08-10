# project-pdm

App mobile em React Native + TypeScript (Expo) para o Programa Criança Feliz, consumindo a API `criancaFeliz-pw1`.

## Pré-requisitos

- Node.js 18+ e npm
- API `criancaFeliz-pw1` rodando localmente (ver README daquele repo): `docker-compose up -d` para subir Postgres/PostGIS, depois `npm install && npm run dev` — serve em `http://localhost:3333`. Ela também recebe e serve as imagens/vídeos, então não é preciso mais nenhum serviço separado de mídia.

## Setup

```bash
npm install
cp .env.example .env
```

Ajuste `EXPO_PUBLIC_API_URL` no `.env` conforme onde o app vai rodar:

- Emulador Android: `http://10.0.2.2:3333`
- iOS simulator / web / Expo Go no mesmo Wi-Fi: `http://<ip-da-maquina>:3333`

Atenção: em dispositivo físico o IP da máquina muda quando o DHCP renova a concessão. Se o app parar de carregar dados do nada, confira o IP atual (`ipconfig`) antes de procurar outra causa — e lembre que `EXPO_PUBLIC_*` é embutido no bundle, então é preciso reiniciar o `npx expo start` depois de mexer no `.env`.

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
- `src/features` — telas por área: `auth`, `beneficiarios` (CRUD + visitas, integrado à API), `agenda` (lista de visitas real, integrada à API), `inicio` (dashboard real: visitas de hoje, famílias ativas, alertas), `relatorios` (dados de exemplo), `perfil`

## Upload de imagem/vídeo

A própria API guarda os arquivos. O app envia a mídia para `POST /uploads` (campo `file`, multipart, autenticado) e recebe de volta um **caminho relativo** — ex.: `/uploads/uuid.jpg`. Esse caminho é o que vai para o campo `foto` do beneficiário e para `imagens` da visita; a API serve os arquivos estaticamente em `/uploads`.

O caminho é relativo de propósito: o endereço do servidor muda (IP da máquina em desenvolvimento, deploy depois) sem invalidar o que já está no banco. Na hora de exibir, `resolveMediaUrl()` (`src/api/media.ts`) prefixa com `EXPO_PUBLIC_API_URL` — e devolve o valor intacto quando ele já é uma URL absoluta, para que registros antigos (criados quando a mídia ia para um serviço externo) continuem funcionando.

A visualização usa `<Image>` pra fotos e `expo-video` (`VideoView`) com controles nativos pra vídeos; como a API não guarda o tipo da mídia, ele é inferido pela extensão do arquivo (`isVideoUrl()`).

## Mapa

O mapa de seleção de endereço (`react-native-maps`) funciona no Expo Go em dev, mas para um build nativo real (EAS build/produção) o Android precisa de uma chave da Google Maps SDK em `app.json` (`expo.android.config.googleMaps.apiKey`), que ainda não foi configurada.

## Regras de negócio implementadas (SIGPCF_Requisitos.pdf)

- **RNF_06 (Essencial)** — "Apenas o assistente social responsável pode alterar a data de uma visita domiciliar": o botão de editar data em `VisitaDetalheScreen` só aparece se `visita.assistenteId` for igual ao usuário logado. Como `PATCH /visitas/:id` na API não valida isso no servidor (qualquer token válido pode editar qualquer visita), essa é uma restrição só do lado do cliente — não impede alguém de chamar a API diretamente.

## Limitações conhecidas

- Relatórios usa dados de exemplo — não há endpoint de relatório na API.
- A Agenda no Figma prevê status "agendada"/"cancelada" (visitas futuras), mas o model `Visita` da API só registra visitas já realizadas (sem campo de status/agendamento). Por isso a Agenda deste app lista só visitas já registradas, todas com badge "Realizada", sem os filtros de status do Figma — não dava pra fabricar um estado de agendamento que a API não tem.
- Os arquivos enviados ficam no disco da máquina que roda a API e são servidos sem autenticação em `/uploads` — o nome é um uuid não adivinhável, mas quem tiver o link acessa. Recriar o servidor sem um volume persistente perde os arquivos.
- O nome exibido no Início/Perfil vem de `GET /assists/:id` a partir do uuid do token — se o usuário logado for um Admin (não um Assistente Social), essa busca falha silenciosamente e o nome genérico "Assistente Social" é mostrado no lugar.
