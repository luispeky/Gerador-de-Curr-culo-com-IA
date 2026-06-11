# Gerador de Currículo com IA

Aplicação web para montar um currículo profissional em minutos, com **textos gerados e aprimorados pela IA da Anthropic (Claude)**. Formulário à esquerda, preview ao vivo à direita e exportação em PDF com um clique.

Feito com **Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript**.

## Recursos

- 📝 Formulário completo: dados pessoais, resumo, experiências, formação, habilidades e idiomas.
- ✨ **IA (Claude)**:
  - **Gerar resumo profissional** a partir dos dados preenchidos.
  - **Melhorar** a descrição de cada experiência (transforma em tópicos com verbos de ação).
  - **Sugerir habilidades** relevantes para o cargo.
- 👁️ Preview ao vivo no formato de uma folha A4.
- 🎨 4 temas de cor (azul, verde, violeta, grafite).
- ⬇️ Exportar em PDF (via impressão do navegador — "Salvar como PDF").
- 🔒 A chave da API fica só no servidor (rotas de API). Nunca é exposta ao navegador.

## Como rodar

1. Instale as dependências (já instaladas se você acabou de criar o projeto):

   ```bash
   npm install
   ```

2. Configure a chave da Anthropic. Copie `.env.example` para `.env.local` e cole sua chave
   (obtida em <https://console.anthropic.com/>):

   ```bash
   # .env.local
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra <http://localhost:3000>.

> Sem a chave, o formulário, o preview e o PDF funcionam normalmente — apenas os botões "✨" de IA retornarão um aviso.

## Build de produção

```bash
npm run build
npm start
```

## Estrutura

```
src/
  app/
    api/gerar/route.ts     # rota que conversa com a Claude (servidor)
    layout.tsx
    page.tsx               # app principal (formulário + preview)
    globals.css            # tema escuro + estilos da folha + regras de impressão
  components/
    CurriculoPreview.tsx   # renderiza a folha A4
  lib/
    anthropic.ts           # cliente da Anthropic + modelo
    types.ts               # tipos compartilhados
```

## Modelo de IA

Usa `claude-opus-4-8` via o SDK oficial `@anthropic-ai/sdk`. Para trocar o modelo,
edite `MODELO` em [src/lib/anthropic.ts](src/lib/anthropic.ts).
