"use client";

import { useState } from "react";
import CurriculoPreview from "@/components/CurriculoPreview";
import CurriculoPreviewATS from "@/components/CurriculoPreviewATS";
import AjustarFoto from "@/components/AjustarFoto";
import type {
  AcaoIA,
  Curriculo,
  Curso,
  Experiencia,
  Formacao,
  Idioma,
  Modelo,
  Tema,
} from "@/lib/types";

const id = () => Math.random().toString(36).slice(2, 9);

// Currículo zerado (com IDs novos a cada chamada) — usado no início e ao limpar.
function novoCurriculo(): Curriculo {
  return {
    nome: "",
    cargoDesejado: "",
    email: "",
    telefone: "",
    localizacao: "",
    linkedin: "",
    github: "",
    site: "",
    foto: "",
    resumo: "",
    experiencias: [
      {
        id: id(),
        cargo: "",
        empresa: "",
        inicio: "",
        fim: "",
        atual: false,
        descricao: "",
      },
    ],
    formacoes: [{ id: id(), curso: "", instituicao: "", periodo: "" }],
    cursos: [],
    habilidades: [],
    idiomas: [{ id: id(), idioma: "", nivel: "" }],
  };
}

const TEMAS: { valor: Tema; nome: string; cor: string }[] = [
  { valor: "azul", nome: "Azul", cor: "#2563eb" },
  { valor: "verde", nome: "Verde", cor: "#059669" },
  { valor: "violeta", nome: "Violeta", cor: "#7c3aed" },
  { valor: "grafite", nome: "Grafite", cor: "#334155" },
];

export default function Home() {
  const [cv, setCv] = useState<Curriculo>(novoCurriculo);
  const [tema, setTema] = useState<Tema>("azul");
  const [modelo, setModelo] = useState<Modelo>("moderno");
  const [novaHabilidade, setNovaHabilidade] = useState("");
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // foto original (sem recorte) para reabrir o editor; e controle do editor
  const [fotoOriginal, setFotoOriginal] = useState("");
  const [editandoFoto, setEditandoFoto] = useState(false);

  function set<K extends keyof Curriculo>(campo: K, valor: Curriculo[K]) {
    setCv((c) => ({ ...c, [campo]: valor }));
  }

  // Zera todos os dados pessoais (mantém só preferências visuais: tema/modelo)
  function limparTudo() {
    setCv(novoCurriculo());
    setFotoOriginal("");
    setNovaHabilidade("");
    setErro(null);
  }

  // Baixar = imprimir/salvar PDF. Os dados NÃO são apagados ao baixar —
  // só somem quando a pessoa fecha/recarrega a aba (nada é salvo).
  function baixarPDF() {
    window.print();
  }

  // ---- foto (opcional, só no modelo Moderno) ----
  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // guarda o original e abre o editor de enquadramento
      setFotoOriginal(reader.result as string);
      setEditandoFoto(true);
    };
    reader.readAsDataURL(file);
  }

  function removerFoto() {
    set("foto", "");
    setFotoOriginal("");
  }

  // ---- IA ----
  async function chamarIA(acao: AcaoIA, experienciaId?: string) {
    setErro(null);
    setCarregando(experienciaId ?? acao);
    try {
      const r = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, curriculo: cv, experienciaId }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || "Falha na geração.");
      const texto: string = data.texto;

      if (acao === "resumo" || acao === "curriculo_completo") {
        set("resumo", texto);
      } else if (acao === "habilidades") {
        const lista = texto
          .split(/[,\n]/)
          .map((s) => s.replace(/^[-•\d.\s]+/, "").trim())
          .filter(Boolean);
        // mescla com as já existentes, sem duplicar
        setCv((c) => ({
          ...c,
          habilidades: Array.from(new Set([...c.habilidades, ...lista])),
        }));
      } else if (acao === "melhorar_experiencia" && experienciaId) {
        setCv((c) => ({
          ...c,
          experiencias: c.experiencias.map((e) =>
            e.id === experienciaId ? { ...e, descricao: texto } : e,
          ),
        }));
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(null);
    }
  }

  // ---- experiências ----
  function addExperiencia() {
    set("experiencias", [
      ...cv.experiencias,
      {
        id: id(),
        cargo: "",
        empresa: "",
        inicio: "",
        fim: "",
        atual: false,
        descricao: "",
      },
    ]);
  }
  function updExperiencia(eid: string, patch: Partial<Experiencia>) {
    set(
      "experiencias",
      cv.experiencias.map((e) => (e.id === eid ? { ...e, ...patch } : e)),
    );
  }
  function delExperiencia(eid: string) {
    set(
      "experiencias",
      cv.experiencias.filter((e) => e.id !== eid),
    );
  }

  // ---- formação ----
  function addFormacao() {
    set("formacoes", [
      ...cv.formacoes,
      { id: id(), curso: "", instituicao: "", periodo: "" },
    ]);
  }
  function updFormacao(fid: string, patch: Partial<Formacao>) {
    set(
      "formacoes",
      cv.formacoes.map((f) => (f.id === fid ? { ...f, ...patch } : f)),
    );
  }
  function delFormacao(fid: string) {
    set(
      "formacoes",
      cv.formacoes.filter((f) => f.id !== fid),
    );
  }

  // ---- cursos e certificações ----
  function addCurso() {
    set("cursos", [
      ...cv.cursos,
      { id: id(), nome: "", instituicao: "", ano: "" },
    ]);
  }
  function updCurso(cid: string, patch: Partial<Curso>) {
    set(
      "cursos",
      cv.cursos.map((c) => (c.id === cid ? { ...c, ...patch } : c)),
    );
  }
  function delCurso(cid: string) {
    set(
      "cursos",
      cv.cursos.filter((c) => c.id !== cid),
    );
  }

  // ---- idiomas ----
  function addIdioma() {
    set("idiomas", [...cv.idiomas, { id: id(), idioma: "", nivel: "" }]);
  }
  function updIdioma(iid: string, patch: Partial<Idioma>) {
    set(
      "idiomas",
      cv.idiomas.map((i) => (i.id === iid ? { ...i, ...patch } : i)),
    );
  }
  function delIdioma(iid: string) {
    set(
      "idiomas",
      cv.idiomas.filter((i) => i.id !== iid),
    );
  }

  // ---- habilidades (chips) ----
  function addHabilidade() {
    const nova = novaHabilidade.trim();
    if (!nova) return;
    // permite colar várias separadas por vírgula
    const lista = nova
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setCv((c) => ({
      ...c,
      habilidades: Array.from(new Set([...c.habilidades, ...lista])),
    }));
    setNovaHabilidade("");
  }
  function delHabilidade(hab: string) {
    set(
      "habilidades",
      cv.habilidades.filter((h) => h !== hab),
    );
  }

  const ocupado = (chave: string) => carregando === chave;

  return (
    <div className="min-h-screen">
      {/* Cabeçalho */}
      <header className="nao-imprimir border-b border-[var(--border)] sticky top-0 z-10 backdrop-blur-md bg-[color-mix(in_srgb,var(--bg)_80%,transparent)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="w-9 h-9 shrink-0" />
            <div>
              <h1 className="font-bold text-lg leading-tight">OmniGC</h1>
              <p className="text-xs text-[var(--muted)]">
                Gerador de Currículos · IA por Claude
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="btn btn-fantasma"
              onClick={() => {
                if (confirm("Apagar todos os dados preenchidos?")) limparTudo();
              }}
              title="Apaga tudo que você preencheu"
            >
              Limpar
            </button>
            <button
              className="btn btn-primario"
              onClick={baixarPDF}
              title="Abre a janela de impressão — escolha 'Salvar como PDF'."
            >
              ⬇ Baixar PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6 grid lg:grid-cols-2 gap-5 lg:gap-6">
        {/* ===== Formulário ===== */}
        <div className="nao-imprimir space-y-5">
          <div className="text-xs text-[var(--muted)] flex items-center gap-2">
            🔒 Tudo fica só no seu navegador. Nada é salvo — os dados somem
            quando você fecha ou recarrega a aba.
          </div>

          {erro && (
            <div className="cartao border-[#5a2e3a] text-[#ffb4b4] text-sm">
              ⚠ {erro}
            </div>
          )}

          {/* Dados pessoais */}
          <section className="cartao space-y-4">
            <h2 className="font-semibold text-base">Dados pessoais</h2>

            {/* Foto (opcional — só no modelo Moderno) */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-[var(--border)] bg-[var(--bg-soft)] overflow-hidden grid place-items-center shrink-0">
                {cv.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cv.foto}
                    alt="Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-[var(--muted)]">👤</span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap gap-2">
                  <label className="btn btn-fantasma cursor-pointer">
                    {cv.foto ? "Trocar foto" : "Adicionar foto"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFoto}
                    />
                  </label>
                  {cv.foto && fotoOriginal && (
                    <button
                      className="btn btn-fantasma"
                      onClick={() => setEditandoFoto(true)}
                    >
                      Ajustar
                    </button>
                  )}
                  {cv.foto && (
                    <button className="btn btn-perigo" onClick={removerFoto}>
                      Remover
                    </button>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Opcional · aparece só no modelo Moderno (o ATS nunca usa foto)
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Campo
                rotulo="Nome completo"
                valor={cv.nome}
                onChange={(v) => set("nome", v)}
                placeholder="Maria Silva"
              />
              <Campo
                rotulo="Cargo desejado"
                valor={cv.cargoDesejado}
                onChange={(v) => set("cargoDesejado", v)}
                placeholder="Desenvolvedora Front-end"
              />
              <Campo
                rotulo="E-mail"
                valor={cv.email}
                onChange={(v) => set("email", v)}
                placeholder="maria@email.com"
              />
              <Campo
                rotulo="Telefone"
                valor={cv.telefone}
                onChange={(v) => set("telefone", v)}
                placeholder="(91) 99999-0000"
              />
              <Campo
                rotulo="Localização"
                valor={cv.localizacao}
                onChange={(v) => set("localizacao", v)}
                placeholder="Belém, PA"
              />
              <Campo
                rotulo="LinkedIn"
                opcional
                valor={cv.linkedin}
                onChange={(v) => set("linkedin", v)}
                placeholder="linkedin.com/in/maria"
              />
              <Campo
                rotulo="GitHub"
                opcional
                valor={cv.github}
                onChange={(v) => set("github", v)}
                placeholder="github.com/maria"
              />
              <Campo
                rotulo="Site / portfólio"
                opcional
                valor={cv.site}
                onChange={(v) => set("site", v)}
                placeholder="maria.dev"
              />
            </div>
          </section>

          {/* Resumo */}
          <section className="cartao space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base">Resumo profissional</h2>
              <button
                className="btn btn-ia"
                onClick={() => chamarIA("resumo")}
                disabled={!!carregando}
              >
                {ocupado("resumo") ? "Gerando…" : "✨ Gerar com IA"}
              </button>
            </div>
            <textarea
              className="campo min-h-[90px] resize-y"
              value={cv.resumo}
              onChange={(e) => set("resumo", e.target.value)}
              placeholder="Preencha os dados e experiências, depois clique em 'Gerar com IA' — ou escreva você mesmo."
            />
          </section>

          {/* Experiências */}
          <section className="cartao space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base">
                Experiência profissional
              </h2>
              <button className="btn btn-fantasma" onClick={addExperiencia}>
                + Adicionar
              </button>
            </div>
            {cv.experiencias.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-[var(--border)] p-3 space-y-3"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo
                    rotulo="Cargo"
                    valor={e.cargo}
                    onChange={(v) => updExperiencia(e.id, { cargo: v })}
                    placeholder="Analista de Marketing"
                  />
                  <Campo
                    rotulo="Empresa"
                    valor={e.empresa}
                    onChange={(v) => updExperiencia(e.id, { empresa: v })}
                    placeholder="Empresa X"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo
                    rotulo="Início"
                    valor={e.inicio}
                    onChange={(v) => updExperiencia(e.id, { inicio: v })}
                    placeholder="Jan 2022"
                  />
                  <div>
                    <span className="rotulo">
                      {e.atual ? "Saída" : "Fim"}
                    </span>
                    <input
                      className="campo disabled:opacity-50"
                      value={e.atual ? "" : e.fim}
                      disabled={e.atual}
                      onChange={(ev) =>
                        updExperiencia(e.id, { fim: ev.target.value })
                      }
                      placeholder={e.atual ? "Atual" : "Dez 2023"}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[var(--accent)]"
                    checked={e.atual}
                    onChange={(ev) =>
                      updExperiencia(e.id, { atual: ev.target.checked })
                    }
                  />
                  Trabalho aqui atualmente
                </label>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="rotulo mb-0">Descrição</span>
                    <button
                      className="btn btn-ia !py-1 !px-2 !text-xs"
                      onClick={() => chamarIA("melhorar_experiencia", e.id)}
                      disabled={!!carregando}
                    >
                      {ocupado(e.id) ? "Melhorando…" : "✨ Melhorar"}
                    </button>
                  </div>
                  <textarea
                    className="campo min-h-[80px] resize-y"
                    value={e.descricao}
                    onChange={(ev) =>
                      updExperiencia(e.id, { descricao: ev.target.value })
                    }
                    placeholder="O que você fazia e quais resultados entregou."
                  />
                </div>
                {cv.experiencias.length > 1 && (
                  <button
                    className="btn btn-perigo !py-1 !px-2 !text-xs"
                    onClick={() => delExperiencia(e.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Formação */}
          <section className="cartao space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base">Formação</h2>
              <button className="btn btn-fantasma" onClick={addFormacao}>
                + Adicionar
              </button>
            </div>
            {cv.formacoes.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-[var(--border)] p-3 space-y-3"
              >
                <Campo
                  rotulo="Curso"
                  valor={f.curso}
                  onChange={(v) => updFormacao(f.id, { curso: v })}
                  placeholder="Bacharelado em Administração"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo
                    rotulo="Instituição"
                    valor={f.instituicao}
                    onChange={(v) => updFormacao(f.id, { instituicao: v })}
                    placeholder="Universidade Federal"
                  />
                  <Campo
                    rotulo="Período"
                    valor={f.periodo}
                    onChange={(v) => updFormacao(f.id, { periodo: v })}
                    placeholder="2018 – 2022"
                  />
                </div>
                {cv.formacoes.length > 1 && (
                  <button
                    className="btn btn-perigo !py-1 !px-2 !text-xs"
                    onClick={() => delFormacao(f.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Cursos e certificações (opcional) */}
          <section className="cartao space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base">
                  Cursos e certificações
                </h2>
                <p className="text-xs text-[var(--muted)]">Opcional</p>
              </div>
              <button className="btn btn-fantasma" onClick={addCurso}>
                + Adicionar
              </button>
            </div>
            {cv.cursos.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                Adicione cursos livres, certificações ou bootcamps.
              </p>
            )}
            {cv.cursos.map((cu) => (
              <div
                key={cu.id}
                className="rounded-xl border border-[var(--border)] p-3 space-y-3"
              >
                <Campo
                  rotulo="Curso / certificação"
                  valor={cu.nome}
                  onChange={(v) => updCurso(cu.id, { nome: v })}
                  placeholder="Scrum Master Certificado (PSM I)"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo
                    rotulo="Instituição"
                    opcional
                    valor={cu.instituicao}
                    onChange={(v) => updCurso(cu.id, { instituicao: v })}
                    placeholder="Alura"
                  />
                  <Campo
                    rotulo="Ano"
                    opcional
                    valor={cu.ano}
                    onChange={(v) => updCurso(cu.id, { ano: v })}
                    placeholder="2024"
                  />
                </div>
                <button
                  className="btn btn-perigo !py-1 !px-2 !text-xs"
                  onClick={() => delCurso(cu.id)}
                >
                  Remover
                </button>
              </div>
            ))}
          </section>

          {/* Habilidades */}
          <section className="cartao space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base">Habilidades</h2>
              <button
                className="btn btn-ia"
                onClick={() => chamarIA("habilidades")}
                disabled={!!carregando}
              >
                {ocupado("habilidades") ? "Sugerindo…" : "✨ Sugerir com IA"}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                className="campo"
                value={novaHabilidade}
                onChange={(e) => setNovaHabilidade(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHabilidade();
                  }
                }}
                placeholder="Digite uma habilidade e tecle Enter"
              />
              <button className="btn btn-fantasma" onClick={addHabilidade}>
                Adicionar
              </button>
            </div>
            {cv.habilidades.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cv.habilidades.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 bg-[var(--bg-soft)] border border-[var(--border)] rounded-full px-3 py-1 text-sm"
                  >
                    {h}
                    <button
                      className="text-[var(--muted)] hover:text-[#ff8e8e]"
                      onClick={() => delHabilidade(h)}
                      title="Remover"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Idiomas */}
          <section className="cartao space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base">Idiomas</h2>
                <p className="text-xs text-[var(--muted)]">Opcional</p>
              </div>
              <button className="btn btn-fantasma" onClick={addIdioma}>
                + Adicionar
              </button>
            </div>
            {cv.idiomas.map((i) => (
              <div key={i.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Campo
                    rotulo="Idioma"
                    valor={i.idioma}
                    onChange={(v) => updIdioma(i.id, { idioma: v })}
                    placeholder="Inglês"
                  />
                </div>
                <div className="flex-1">
                  <Campo
                    rotulo="Nível"
                    valor={i.nivel}
                    onChange={(v) => updIdioma(i.id, { nivel: v })}
                    placeholder="Avançado"
                  />
                </div>
                {cv.idiomas.length > 1 && (
                  <button
                    className="btn btn-perigo !py-2 !px-2"
                    onClick={() => delIdioma(i.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* ===== Preview ===== */}
        <div className="lg:sticky lg:top-[84px] lg:self-start area-impressao">
          <div className="nao-imprimir mb-3 flex flex-wrap items-center gap-3">
            {/* Seletor de modelo */}
            <div className="inline-flex rounded-lg border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setModelo("moderno")}
                className={`px-3 py-1.5 text-sm font-medium transition ${
                  modelo === "moderno"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                Moderno
              </button>
              <button
                onClick={() => setModelo("ats")}
                className={`px-3 py-1.5 text-sm font-medium transition ${
                  modelo === "ats"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                title="Currículo em texto simples, otimizado para sistemas de triagem (ATS)"
              >
                ATS
              </button>
            </div>

            {/* Cores — só no modelo moderno */}
            {modelo === "moderno" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)] mr-1">Tema:</span>
                {TEMAS.map((t) => (
                  <button
                    key={t.valor}
                    onClick={() => setTema(t.valor)}
                    className="w-7 h-7 rounded-full border-2 transition"
                    style={{
                      background: t.cor,
                      borderColor: tema === t.valor ? "white" : "transparent",
                    }}
                    title={t.nome}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs text-[var(--muted)]">
                Texto simples · sem cores · ideal para triagem automática
              </span>
            )}
          </div>

          {modelo === "ats" ? (
            <CurriculoPreviewATS curriculo={cv} />
          ) : (
            <CurriculoPreview curriculo={cv} tema={tema} />
          )}
        </div>
      </main>

      {editandoFoto && fotoOriginal && (
        <AjustarFoto
          src={fotoOriginal}
          onAplicar={(d) => {
            set("foto", d);
            setEditandoFoto(false);
          }}
          onCancelar={() => setEditandoFoto(false)}
        />
      )}
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient
          id="logoGrad"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6e9bff" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logoGrad)" />
      <rect x="18" y="13" width="28" height="38" rx="4" fill="#ffffff" />
      <circle cx="26" cy="24" r="3.4" fill="#8b5cf6" />
      <rect x="31.5" y="21.5" width="11" height="2.4" rx="1.2" fill="#c7d2fe" />
      <rect x="31.5" y="26.5" width="8.5" height="2.4" rx="1.2" fill="#c7d2fe" />
      <rect x="22" y="34" width="20" height="2.6" rx="1.3" fill="#dbe3f4" />
      <rect x="22" y="39.5" width="20" height="2.6" rx="1.3" fill="#dbe3f4" />
      <rect x="22" y="45" width="13" height="2.6" rx="1.3" fill="#dbe3f4" />
    </svg>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  placeholder,
  opcional,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  opcional?: boolean;
}) {
  return (
    <label className="block">
      <span className="rotulo">
        {rotulo}
        {opcional && (
          <span className="text-[var(--muted)] font-normal lowercase">
            {" "}
            · opcional
          </span>
        )}
      </span>
      <input
        className="campo"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
