import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import dayjs from 'dayjs';

export type LinhaRelatorio = {
  assistente: string;
  visitas: number;
  beneficiarios: number;
};

export type DadosRelatorio = {
  inicio: string;
  fim: string;
  totalVisitas: number;
  totalBeneficiarios: number;
  porAssistente: LinhaRelatorio[];
};

function periodoLegivel({ inicio, fim }: DadosRelatorio) {
  return `${dayjs(inicio).format('DD/MM/YYYY')} a ${dayjs(fim).format('DD/MM/YYYY')}`;
}

function nomeArquivo(extensao: string) {
  return `relatorio-sigpcf-${dayjs().format('YYYY-MM-DD-HHmm')}.${extensao}`;
}

function montarHtml(dados: DadosRelatorio) {
  const linhas = dados.porAssistente
    .map(
      (linha) => `
        <tr>
          <td>${linha.assistente}</td>
          <td class="num">${linha.visitas}</td>
          <td class="num">${linha.beneficiarios}</td>
        </tr>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, sans-serif; padding: 32px; color: #1a1a1a; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .periodo { color: #666; font-size: 13px; margin-bottom: 24px; }
          .totais { display: flex; gap: 16px; margin-bottom: 28px; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px 20px; }
          .card .valor { font-size: 24px; font-weight: bold; }
          .card .rotulo { font-size: 11px; color: #666; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
          th { background: #f5f5f5; font-size: 11px; text-transform: uppercase; color: #666; }
          td.num, th.num { text-align: right; }
          .rodape { margin-top: 32px; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <h1>Relatório de visitas e atendimentos</h1>
        <div class="periodo">Programa Criança Feliz — SIGPCF · Período: ${periodoLegivel(dados)}</div>

        <div class="totais">
          <div class="card">
            <div class="valor">${dados.totalVisitas}</div>
            <div class="rotulo">Visitas no período</div>
          </div>
          <div class="card">
            <div class="valor">${dados.totalBeneficiarios}</div>
            <div class="rotulo">Beneficiários cadastrados</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Assistente social</th>
              <th class="num">Visitas</th>
              <th class="num">Beneficiários</th>
            </tr>
          </thead>
          <tbody>
            ${linhas || '<tr><td colspan="3">Nenhum dado no período.</td></tr>'}
          </tbody>
        </table>

        <div class="rodape">Gerado pelo app SIGPCF em ${dayjs().format('DD/MM/YYYY [às] HH:mm')}.</div>
      </body>
    </html>`;
}

function montarCsv(dados: DadosRelatorio) {
  const escapar = (valor: string | number) => `"${String(valor).replace(/"/g, '""')}"`;
  const linhas = [
    ['Relatório SIGPCF'],
    ['Período', periodoLegivel(dados)],
    ['Total de visitas', dados.totalVisitas],
    ['Beneficiários cadastrados', dados.totalBeneficiarios],
    [],
    ['Assistente social', 'Visitas', 'Beneficiários'],
    ...dados.porAssistente.map((linha) => [linha.assistente, linha.visitas, linha.beneficiarios]),
  ];

  return linhas.map((colunas) => colunas.map(escapar).join(';')).join('\n');
}

async function compartilhar(uri: string, mimeType: string, titulo: string) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento indisponível neste aparelho.');
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: titulo, UTI: mimeType });
}

export async function exportarPdf(dados: DadosRelatorio) {
  const { uri } = await Print.printToFileAsync({ html: montarHtml(dados) });
  await compartilhar(uri, 'application/pdf', 'Relatório em PDF');
}

export async function exportarCsv(dados: DadosRelatorio) {
  const arquivo = new File(Paths.cache, nomeArquivo('csv'));
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(`﻿${montarCsv(dados)}`);

  await compartilhar(arquivo.uri, 'text/csv', 'Relatório em CSV');
}
