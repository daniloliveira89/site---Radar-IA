# Publicar o Radar IA gratuitamente

Esta edição usa **GitHub Pages + GitHub Actions**, em um repositório **público**. O site e o código ficarão públicos. Não é preciso configurar chaves de API, contratar servidor ou cadastrar um token pessoal. O endereço gratuito é do tipo `https://SEU-USUARIO.github.io/radar-ia/`.

## Repositório

O código está em [daniloliveira89/site---Radar-IA](https://github.com/daniloliveira89/site---Radar-IA). O endereço da publicação é [daniloliveira89.github.io/site---Radar-IA](https://daniloliveira89.github.io/site---Radar-IA/).

## 2. Ativar a publicação

No repositório:

1. Abra **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Abra **Settings → Actions → General**. Habilite a execução de Actions se a conta pedir. Em **Workflow permissions**, permita **Read and write permissions** caso os commits automáticos sejam bloqueados. O workflow declara `contents: write` somente no job de coleta/compilação.
4. Abra **Actions → Update & publish Radar IA**.
5. Clique em **Run workflow**, selecione `main` e confirme.
6. Aguarde os jobs **build** e **deploy** ficarem verdes. O endereço do site aparece no resultado de `deploy` e em **Settings → Pages**.

Um primeiro job iniciado antes de ativar Pages pode falhar. Depois de ativar, execute **Run workflow** novamente. Não precisa editar caminhos ou colocar seu nome de usuário no código.

## 3. Atualizações

- O GitHub programa quatro coletas por dia: **07:17, 12:17, 17:17 e 22:17 (horário de Brasília)**. Cada coleta concluída publica uma nova edição.
- Envios para `main` publicam a edição salva.
- Para antecipar uma coleta, use **Actions → Update & publish Radar IA → Run workflow**.
- O botão dentro do site apenas recarrega os dados já publicados.
- As coletas funcionam com o computador desligado. A agenda depende do GitHub e pode atrasar.
- Ecossistemas, regras de acesso e descoberta de planos novos continuam editoriais.

## 4. Usar no iPhone

Abra o endereço publicado no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**. Os dados precisam de internet para atualizar. Não há envio de notificações push.

## Se algo falhar

Abra a execução vermelha em **Actions** e leia o primeiro passo que falhou:

- **Pages não habilitado / 404:** confirme **Settings → Pages → GitHub Actions** e repita o workflow.
- **Permission denied / git push:** permita escrita em Actions; regras de proteção de branch também podem impedir os commits de dados. Para um repositório novo, mantenha a configuração padrão de `main` até publicar.
- **Workflow não aparece:** confirme que `.github/workflows/publish.yml` foi enviado para `main`.
- **Visual sem estilos / ícones ausentes:** confirme que enviou `public`, `app`, `components`, `lib` e os arquivos da raiz; use o endereço que o Pages informou, com a barra final.
- **Fonte indisponível:** a data e os avisos mostram a situação. Dados anteriores são preservados; isso não exige API paga.
- **Agendamento parou:** confirme se o workflow está habilitado; o GitHub pode desativar agendas após 60 dias de inatividade.

A criação do repositório e a publicação na sua conta ainda precisam ser feitas por você. Este ZIP contém os arquivos e a automação pronta, sem credenciais da hospedagem anterior.
