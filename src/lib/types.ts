// Tipos compartilhados do gerador de currículo

export interface Experiencia {
  id: string;
  cargo: string;
  empresa: string;
  inicio: string; // ex.: "Jan 2022"
  fim: string; // ex.: "Dez 2023" (ignorado quando atual = true)
  atual: boolean; // trabalho aqui atualmente
  descricao: string;
}

export interface Formacao {
  id: string;
  curso: string;
  instituicao: string;
  periodo: string;
}

export interface Curso {
  id: string;
  nome: string;
  instituicao: string;
  ano: string;
}

export interface Idioma {
  id: string;
  idioma: string;
  nivel: string;
}

export interface Curriculo {
  nome: string;
  cargoDesejado: string;
  email: string;
  telefone: string;
  localizacao: string;
  linkedin: string;
  github: string; // opcional
  site: string; // portfólio — opcional
  foto: string; // data URL da foto — opcional; aparece só no modelo Moderno
  resumo: string;
  experiencias: Experiencia[];
  formacoes: Formacao[];
  cursos: Curso[]; // cursos e certificações
  habilidades: string[];
  idiomas: Idioma[];
}

export type Tema = "azul" | "verde" | "violeta" | "grafite";

// Modelo visual: "moderno" (colorido) ou "ats" (texto simples, amigável a triagem automática)
export type Modelo = "moderno" | "ats";

export interface ConfigVisual {
  tema: Tema;
  modelo: Modelo;
}

// Monta o texto do período de uma experiência ("Jan 2022 – Atual")
export function periodoExperiencia(e: Experiencia): string {
  const fim = e.atual ? "Atual" : e.fim;
  if (e.inicio && fim) return `${e.inicio} – ${fim}`;
  return e.inicio || fim || "";
}

// Item de contato com link opcional (href = null quando não é clicável, ex.: localização)
// - texto: valor por extenso (ex.: "linkedin.com/in/maria") — usado no modelo ATS
// - rotulo: rótulo curto para exibição (ex.: "LinkedIn") — usado no modelo Moderno
export interface ContatoLink {
  texto: string;
  rotulo: string;
  href: string | null;
}

function urlAbsoluta(v: string): string {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

// Monta a lista de contatos do cabeçalho, já com os links prontos
export function montarContatos(c: Curriculo): ContatoLink[] {
  const itens: ContatoLink[] = [];
  if (c.email)
    itens.push({ texto: c.email, rotulo: c.email, href: `mailto:${c.email}` });
  if (c.telefone)
    itens.push({
      texto: c.telefone,
      rotulo: c.telefone,
      href: `tel:${c.telefone.replace(/[^\d+]/g, "")}`,
    });
  if (c.localizacao)
    itens.push({ texto: c.localizacao, rotulo: c.localizacao, href: null });
  if (c.linkedin)
    itens.push({
      texto: c.linkedin,
      rotulo: "LinkedIn",
      href: urlAbsoluta(c.linkedin),
    });
  if (c.github)
    itens.push({
      texto: c.github,
      rotulo: "GitHub",
      href: urlAbsoluta(c.github),
    });
  if (c.site)
    itens.push({
      texto: c.site,
      rotulo: "Portfólio",
      href: urlAbsoluta(c.site),
    });
  return itens;
}

// Ações suportadas pela API de geração com IA
export type AcaoIA =
  | "resumo"
  | "melhorar_experiencia"
  | "habilidades"
  | "curriculo_completo";

export interface RequisicaoIA {
  acao: AcaoIA;
  curriculo: Curriculo;
  // contexto extra para ações específicas (ex.: id da experiência a melhorar)
  experienciaId?: string;
}
