import Anthropic from "@anthropic-ai/sdk";

// Cliente único da Anthropic. A chave é lida de ANTHROPIC_API_KEY (.env.local).
// Roda apenas no servidor (rotas de API) — a chave nunca chega ao navegador.
let cliente: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Crie um arquivo .env.local com a sua chave da Anthropic.",
    );
  }
  if (!cliente) {
    cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cliente;
}

export const MODELO = "claude-opus-4-8";
