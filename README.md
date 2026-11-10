# Radar IA — GitHub Pages edition

Site gratuito para acompanhar lançamentos de modelos, testes grátis e ecossistemas de IA. Interface moderna em inglês (padrão) ou português, catálogo com 187 ferramentas e recursos, gráficos compactos de linguagem/imagem/vídeo e planos de 14 serviços.

**[Abra o Radar IA no GitHub Pages](https://daniloliveira89.github.io/site---Radar-IA/).** Para configurar a publicação, veja [PUBLICAR-NO-GITHUB.md](PUBLICAR-NO-GITHUB.md).

## O que está incluído

- Código-fonte completo desta edição, ícones e dados iniciais.
- Publicação automática pelo GitHub Pages.
- Coleta de notícias, comparativos e preços pelo GitHub Actions a cada seis horas, aproximadamente, e sob demanda. Cada envio para `main` publica a edição salva.
- Execução manual da coleta em **Actions → Update & publish Radar IA → Run workflow**.
- Sem chave de API de IA, sem assinatura de notícias e sem servidor contratado.
- Compatibilidade com endereços `usuario.github.io/repositorio/` e instalação na tela inicial pelo Safari.

## Diferença desta edição

O site hospedado anteriormente usava rotas de servidor. Esta edição foi adaptada para o GitHub Pages, que publica arquivos estáticos: o GitHub Actions executa os coletores em Node.js e publica arquivos JSON junto com a interface. O navegador lê essa edição publicada.

**O botão de atualizar dentro do site recarrega os dados publicados. Ele não dispara uma coleta nas empresas.** Para coletar imediatamente, execute o workflow no GitHub. As coletas agendadas funcionam mesmo com o site fechado. Não há notificações push.

O visual, os filtros, EN/PT, salvos locais, comparativos e catálogo foram mantidos. A mensagem do plano Google AI Pro foi generalizada para visitantes públicos. Esta entrega não altera o site já hospedado.

## Atualizações e limites

| Área | Atualização |
| --- | --- |
| Notícias | RSS e páginas oficiais, por regras de relevância; apenas lançamentos elegíveis a partir de 23/10/2026. |
| Comparativos | Tabelas da Artificial Analysis; três modalidades separadas e configurações preservadas. |
| Preços | Leitura das páginas oficiais compatíveis; preços não identificados mantêm o valor e a data anterior. Alguns itens são editoriais. |
| Ecossistemas | Catálogo editorial revisado em 23/10/2026. Novas ferramentas exigem edição de `lib/ecosystems.json`. |
| Notas de acesso | Regras em `lib/model-access.ts`; novas versões podem exigir revisão. Chat grátis não garante a configuração avaliada. |

O cron usa `17 */6 * * *` em UTC: aproximadamente **21:17, 03:17, 09:17 e 15:17 no horário de Brasília**. O GitHub pode atrasar ou pular execuções. Workflows agendados de repositórios públicos podem ser desativados após 60 dias de inatividade; confira a aba Actions se a data do site parar de avançar.

Se uma fonte bloquear o coletor ou mudar seu HTML, o site mostra os dados anteriores com a data original e o estado da consulta. A edição anterior continua disponível se uma compilação falhar. Não há garantia de descobrir todos os anúncios ou novos planos automaticamente.

Preços são referências internacionais/web em **USD**, sem conversão para reais. Cobrança mensal e total anual são separados. Benefícios, créditos, impostos e ofertas regionais variam. O corte de datas aplica-se às notícias, não aos modelos nos gráficos.

## Executar no computador

Instale Node.js 24 ou posterior. Abra um terminal na pasta que contém `package.json`:

```sh
npm ci
npm run dev
```

Para coletar dados e gerar os arquivos de publicação:

```sh
npm run update-data
npm test
npm run build
npm run preview
```

`npm run build` também prepara os dados locais, sem precisar de acesso às fontes externas. As pastas `dist/` e `public/data/` são geradas; não é necessário enviá-las ao repositório.

## Estrutura

- `app/page.tsx`, `app/globals.css`: interface principal.
- `components/`: gráficos, catálogo, planos, marcas e idioma.
- `lib/feed.ts`, `lib/benchmarks.ts`, `lib/pricing.ts`: coletores e regras.
- `lib/initial-*.json`: última edição; também servem de fallback.
- `scripts/update-data.mjs`: coleta e valida dados; não precisa de credenciais.
- `scripts/prepare-data.mjs`: copia os dados para publicação.
- `.github/workflows/publish.yml`: coleta, testes, compilação e publicação.
- `tests/`: verificações de corte de datas, dados, fallback e caminhos do aplicativo.

Os commits automáticos atualizam somente os três arquivos `lib/initial-*.json`. Usam o `GITHUB_TOKEN` temporário fornecido pelo GitHub; não exigem token pessoal e não disparam um ciclo infinito de workflows. Salvos, leituras, tema e idioma continuam locais ao navegador e não vão para o repositório.

## Marcas e fontes

Nomes, logos e modelos pertencem aos respectivos titulares. Ícones identificam serviços; os arquivos de marcas vêm de logos publicados pela Artificial Analysis e favicons oficiais do Runway e Midjourney. O Radar IA não é afiliado às empresas nem à Artificial Analysis. Dependências mantêm suas próprias licenças. Os links de origem dos anúncios, preços, métricas e ferramentas estão no site.

## Documentação oficial

- [GitHub Pages e repositórios públicos no plano Free](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Gratuidade dos runners padrão em repositórios públicos](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Publicação por GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Agendamento, atrasos e inatividade](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

## Version 1.1

- Language & reasoning displays up to 15 real models in both selections; the company view includes one result per company across the source. Image and video limits remain unchanged.
- News details use one concise product description and a separate improvement paragraph when verified. The duplicate excerpt, translation link and generic disclaimer were removed from the dialog.
- English and Portuguese editorial briefs cover the reviewed Kimi K3.1 Pro, GPT-6.1 Terra, Gemini 4 Carbon and Muse announcements. Other entries use source descriptions and rule-based topics; improvements are never inferred from the model number alone. Full source metadata is retained instead of the former 22-word cut.

## Version 1.2
- A compact layout throughout the site; supporting copy is collapsed under Details.
- Language & reasoning has a Top 10 free filter. It ranks distinct models with verified free hosted access, preserving Artificial Analysis scores. Reasoning configurations can differ between evaluation and free use.
- Free access is checked from Google API pricing, OpenRouter zero-priced :free routes, and the current DeepSeek free chat release. Account, quota and regional limits may apply. Open weights and temporary credits alone do not qualify.
- Free catalogues refresh with benchmark collections. Failed checks keep their original dates. When fewer than ten verified models match the benchmark, the chart shows the actual count.

## Version 1.3
Free chat coverage now includes the explicit ChatGPT Free model matrix and Claude model-family plan matrix. Latest text scores come from the dated Artificial Analysis collection. The current edition ranks ten matching models. Grok and Kimi have separate chat links without an inferred free-model score. Compare comes before Ecosystems; Unread is removed from navigation. The active benchmark source date is in the page footer.

## Version 1.4
Image and video comparisons include Top 5 free, using recurring free hosted quotas checked against official sources. Free image/video settings and rights can differ from the benchmark. Artificial Analysis has a visible link in the Compare toolbar. Source dates remain in the footer.


## v1.5 — Cost per score

Compare includes Cost per score for language, image and video: published API cost divided by the original score, ascending. Units: USD/task, USD/1,000 images and USD/minute. Missing prices are excluded; paid API prices stay separate from free chat quotas. Prices and scores share one dated AA snapshot and refresh together. Source rounding is preserved; a displayed zero is not evidence of a free API. Cost/Elo is a descriptive sorting aid, not an absolute quality-per-dollar metric.


## v1.5.1

Compare defaults to Top results (15 for language). Cost per score first selects the top 15 language or top 10 image/video rows by original score, then sorts that group by cost per point. Missing prices show a dash at the end and do not admit lower-scoring replacement models.


## v1.5.2

Cost per score is now the default comparison. Language candidates are the 20 highest-scoring rows, then sorted by API cost per score; image/video remain limited to their 10 highest-scoring rows. Missing prices remain unranked at the end.


## v1.5.3

Cost per score amounts turn red when the model score is lower than the preceding displayed model. Company, access and API price share one metadata line; comparison rows are more compact. Ranking logic is unchanged.


## v1.6 — Independent sources and free value comparison

Compare adds a separate Arena source: English-only text category, plus its text-to-image and text-to-video overall boards. AA remains the default. Scores and costs are never merged between providers. Arena exposes original intervals/votes and its edition date; failed refreshes retain the dated snapshot. Cost per score Free selects the verified distinct free models (10 text, 5 image/video), then sorts by their published AA API reference cost per point. Free chat quotas are not converted into zero API prices. Cost per score remains the initial filter for AA; Arena uses score ranking instead.


## v1.6.1 — Arena filters and score highlighting

Cost per score amounts turn red when the model has a lower score than any preceding displayed model. Ties and the first row stay neutral. The same rule applies to both benchmark sources.

Arena now offers all five comparison filters, including Cost per score (the default) and Cost per score Free. Candidate selection is unchanged: top 20 language or top 10 image/video scores before cost sorting; verified distinct free models are selected separately. Arena text uses its published input/output API prices with a fixed reference workload of 1 million total tokens, 50% input and 50% output. This reference is not AA's cost per task. Arena image/video publishes no comparable API prices in the collected boards: values remain unavailable (—), with rows ordered by score when all prices are missing. Unknown prices stay last and are never interpreted as free. Free access refers to verified hosted quotas, not zero API cost. Scores, prices and dates remain separate by source.


## v1.6.2 — Tied score highlighting

Cost per score and Cost per score Free now mark amounts yellow when the model ties the highest score among all preceding displayed rows. A higher preceding score still takes precedence and marks the amount red. The first row and new highest scores stay neutral; unknown prices remain uncolored. This applies to both sources, all modalities, and the data table.


## v1.6.3 — Hide red models

Both cost comparison modes show a second selector: Show all models (default) or Hide red models. It removes only models whose numeric cost per score is red in the full selected candidate group. Ties, record scores, and unknown prices remain. The original score-based candidate limits and free eligibility do not change, and hidden rows are not replaced with lower-scoring candidates. The chart and data table use the same visible rows; other modes ignore this setting.


## v1.7.0 — Creative Writing

Compare adds Creative Writing next to Language. It opens with the top 15 scores from Arena’s Creative Writing category, independent of the general language ranking. Human votes evaluate responses to creative writing prompts; this is not an evaluation of completed books. Existing comparison modes, cost visibility, original votes and intervals, and the dated fallback also work for this board.


## v1.7.1 — EQ-Bench Longform

Creative Writing opens on EQ-Bench Longform with the 15 highest original scores (0–100). Switch to Arena for human-voted results and its existing filters. Scores remain separate. EQ-Bench scores planning, revision, and fiction written in eight chapters with an AI judge; it does not publish comparable API prices. The collector reads only the source’s published leaderboard data and keeps the last saved snapshot when the source cannot be refreshed.


## v1.7.2 — Creative Writing names and free access

EQ-Bench displays readable model names in the chart and table, keeping the source IDs in the tooltips. The verified free filter matches OpenRouter’s exact model IDs as well as published names, so eligible variants such as Gemma 4 31B IT and 26B A4B IT no longer disappear. The filter does not substitute different releases or count open weights without a confirmed free hosted route.


## v1.7.3 — Creative Writing cost filters

EQ-Bench adds Cost per score and Cost per score Free with the existing red/yellow rules and Hide red models. Its benchmark scores stay separate from prices; a 50:50 mix of input and output tokens uses the exact standard OpenRouter route per million tokens, divided by the EQ-Bench score. Missing prices remain unpriced. Chat allowances do not turn a paid API into a zero-priced API. Grok 4.7 is marked paid; GLM-5.3 shows the user's reported free chat access separately from paid API pricing.
