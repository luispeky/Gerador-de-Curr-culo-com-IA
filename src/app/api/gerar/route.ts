import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODELO } from "@/lib/anthropic";
import { periodoExperiencia, type Curriculo, type RequisicaoIA } from "@/lib/types";

export const runtime = "nodejs";

// Instrução base: tom profissional, português do Brasil, sem rodeios.
const SISTEMA = `Você é um especialista em recrutamento e redação de currículos no Brasil.
Escreve em português do Brasil, com tom profissional, claro e objetivo — nada de clichês vazios
("profissional proativo e dinâmico"), nada de exageros. Foca em resultados concretos e verbos de ação.
Responda SOMENTE com o texto pedido, sem preâmbulos, sem comentários sobre o seu processo,
sem markdown de cabeçalho. Não invente fatos, datas, empresas ou números que não estejam nos dados.`;

function resumirCurriculo(c: Curriculo): string {
  const exp = c.experiencias
    .filter((e) => e.cargo || e.empresa)
    .map(
      (e) =>
        `- ${e.cargo || "Cargo"} na ${e.empresa || "empresa"} (${periodoExperiencia(e) || "período"}): ${e.descricao || "sem descrição"}`,
    )
    .join("\n");
  const form = c.formacoes
    .filter((f) => f.curso || f.instituicao)
    .map((f) => `- ${f.curso} — ${f.instituicao} (${f.periodo})`)
    .join("\n");
  const cursos = c.cursos
    .filter((cu) => cu.nome || cu.instituicao)
    .map((cu) => `- ${cu.nome} — ${cu.instituicao} (${cu.ano})`)
    .join("\n");
  return [
    `Nome: ${c.nome || "(não informado)"}`,
    `Cargo desejado: ${c.cargoDesejado || "(não informado)"}`,
    `Localização: ${c.localizacao || "(não informado)"}`,
    c.resumo ? `Resumo atual: ${c.resumo}` : "",
    exp ? `Experiências:\n${exp}` : "",
    form ? `Formação:\n${form}` : "",
    cursos ? `Cursos e certificações:\n${cursos}` : "",
    c.habilidades.length ? `Habilidades: ${c.habilidades.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function montarPrompt(req: RequisicaoIA): string {
  const ctx = resumirCurriculo(req.curriculo);
  switch (req.acao) {
    case "resumo":
      return `Com base nos dados abaixo, escreva um RESUMO PROFISSIONAL para o topo do currículo.
De 2 a 4 frases, em primeira ou terceira pessoa neutra, destacando a área de atuação, o nível de
experiência e os principais pontos fortes. Apenas o parágrafo, sem título.

DADOS:
${ctx}`;

    case "melhorar_experiencia": {
      const e = req.curriculo.experiencias.find(
        (x) => x.id === req.experienciaId,
      );
      if (!e) return "";
      return `Reescreva a descrição da experiência profissional abaixo em 3 a 5 tópicos (bullets)
começando cada linha com "• ". Use verbos de ação no passado, destaque entregas e impacto.
Se houver pouca informação, melhore a redação sem inventar números.

Cargo: ${e.cargo}
Empresa: ${e.empresa}
Período: ${periodoExperiencia(e)}
Descrição original: ${e.descricao || "(vazia)"}

Contexto geral do candidato:
${ctx}`;
    }

    case "habilidades":
      return `Sugira de 8 a 12 habilidades (técnicas e comportamentais) relevantes para o perfil abaixo.
Responda APENAS com as habilidades separadas por vírgula, em uma única linha, sem numeração.

PERFIL:
${ctx}`;

    case "curriculo_completo":
      return `A partir das informações abaixo, gere um resumo profissional forte (2-4 frases).
Apenas o parágrafo do resumo, sem título.

DADOS:
${ctx}`;

    default:
      return "";
  }
}

export async function POST(request: NextRequest) {
  let req: RequisicaoIA;
  try {
    req = (await request.json()) as RequisicaoIA;
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const prompt = montarPrompt(req);
  if (!prompt) {
    return NextResponse.json(
      { erro: "Não há dados suficientes para esta ação." },
      { status: 400 },
    );
  }

  try {
    const anthropic = getAnthropic();
    const resposta = await anthropic.messages.create({
      model: MODELO,
      max_tokens: 1500,
      system: SISTEMA,
      messages: [{ role: "user", content: prompt }],
    });

    const texto = resposta.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n")
      .trim();

    return NextResponse.json({ texto });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido.";
    const status = msg.includes("ANTHROPIC_API_KEY") ? 500 : 502;
    return NextResponse.json({ erro: msg }, { status });
  }
}
