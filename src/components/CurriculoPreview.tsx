import { Fragment } from "react";
import {
  montarContatos,
  periodoExperiencia,
  type Curriculo,
  type Tema,
} from "@/lib/types";

const CORES: Record<Tema, string> = {
  azul: "#2563eb",
  verde: "#059669",
  violeta: "#7c3aed",
  grafite: "#334155",
};

export default function CurriculoPreview({
  curriculo,
  tema,
}: {
  curriculo: Curriculo;
  tema: Tema;
}) {
  const c = curriculo;
  const contatos = montarContatos(c);
  const experiencias = c.experiencias.filter((e) => e.cargo || e.empresa);
  const formacoes = c.formacoes.filter((f) => f.curso || f.instituicao);
  const cursos = c.cursos.filter((cu) => cu.nome || cu.instituicao);
  const idiomas = c.idiomas.filter((i) => i.idioma);

  return (
    <div className="folha" style={{ ["--tema" as string]: CORES[tema] }}>
      <div className="cabecalho">
        <div className="cab-texto">
          <h1>{c.nome || "Seu Nome"}</h1>
          <p className="cargo-topo">{c.cargoDesejado || "Cargo desejado"}</p>
        </div>
        {c.foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="foto" src={c.foto} alt={c.nome || "Foto"} />
        )}
      </div>

      {contatos.length > 0 && (
        <div className="contatos">
          {contatos.map((ct, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="sep">·</span>}
              {ct.href ? (
                <a href={ct.href} target="_blank" rel="noreferrer">
                  {ct.rotulo}
                </a>
              ) : (
                <span>{ct.rotulo}</span>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {c.resumo && (
        <section>
          <h2>Resumo Profissional</h2>
          <p className="item-desc">{c.resumo}</p>
        </section>
      )}

      {experiencias.length > 0 && (
        <section>
          <h2>Experiência Profissional</h2>
          {experiencias.map((e) => {
            const periodo = periodoExperiencia(e);
            return (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div className="item-titulo">
                  {e.cargo || "Cargo"}
                  {e.empresa ? ` — ${e.empresa}` : ""}
                </div>
                {periodo && <div className="item-sub">{periodo}</div>}
                {e.descricao && <div className="item-desc">{e.descricao}</div>}
              </div>
            );
          })}
        </section>
      )}

      {formacoes.length > 0 && (
        <section>
          <h2>Formação</h2>
          {formacoes.map((f) => (
            <div key={f.id} style={{ marginBottom: 8 }}>
              <div className="item-titulo">{f.curso || "Curso"}</div>
              <div className="item-sub">
                {f.instituicao}
                {f.periodo ? ` · ${f.periodo}` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {cursos.length > 0 && (
        <section>
          <h2>Cursos e Certificações</h2>
          {cursos.map((cu) => (
            <div key={cu.id} style={{ marginBottom: 6 }}>
              <div className="item-titulo">{cu.nome || "Curso"}</div>
              <div className="item-sub">
                {[cu.instituicao, cu.ano].filter(Boolean).join(" · ")}
              </div>
            </div>
          ))}
        </section>
      )}

      {c.habilidades.length > 0 && (
        <section>
          <h2>Habilidades</h2>
          <div className="tags">
            {c.habilidades.map((h, i) => (
              <span key={i} className="tag">
                {h}
              </span>
            ))}
          </div>
        </section>
      )}

      {idiomas.length > 0 && (
        <section>
          <h2>Idiomas</h2>
          <div className="tags">
            {idiomas.map((i) => (
              <span key={i.id} className="tag">
                {i.idioma}
                {i.nivel ? ` — ${i.nivel}` : ""}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
