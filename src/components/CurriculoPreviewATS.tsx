import { montarContatos, periodoExperiencia, type Curriculo } from "@/lib/types";

// Modelo ATS: coluna única, sem cores nem ícones, cabeçalhos padrão e texto
// corrido — pensado para ser lido corretamente por sistemas de triagem (ATS).
export default function CurriculoPreviewATS({
  curriculo,
}: {
  curriculo: Curriculo;
}) {
  const c = curriculo;
  const contatos = montarContatos(c);
  const experiencias = c.experiencias.filter((e) => e.cargo || e.empresa);
  const formacoes = c.formacoes.filter((f) => f.curso || f.instituicao);
  const cursos = c.cursos.filter((cu) => cu.nome || cu.instituicao);
  const idiomas = c.idiomas.filter((i) => i.idioma);

  return (
    <div className="folha-ats">
      <h1>{c.nome || "Seu Nome"}</h1>
      {c.cargoDesejado && <p className="cargo-topo">{c.cargoDesejado}</p>}
      {contatos.length > 0 && (
        <p className="contatos">
          {contatos.map((ct, i) => (
            <span key={i}>
              {i > 0 && "  |  "}
              {ct.href ? (
                <a href={ct.href} target="_blank" rel="noreferrer">
                  {ct.texto}
                </a>
              ) : (
                ct.texto
              )}
            </span>
          ))}
        </p>
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
              <div key={e.id} className="bloco">
                <div className="item-titulo">
                  {[e.cargo, e.empresa].filter(Boolean).join(" — ")}
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
            <div key={f.id} className="bloco">
              <div className="item-titulo">{f.curso || "Curso"}</div>
              <div className="item-sub">
                {[f.instituicao, f.periodo].filter(Boolean).join(" — ")}
              </div>
            </div>
          ))}
        </section>
      )}

      {cursos.length > 0 && (
        <section>
          <h2>Cursos e Certificações</h2>
          {cursos.map((cu) => (
            <div key={cu.id} className="bloco">
              <div className="item-titulo">{cu.nome || "Curso"}</div>
              {(cu.instituicao || cu.ano) && (
                <div className="item-sub">
                  {[cu.instituicao, cu.ano].filter(Boolean).join(" — ")}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {c.habilidades.length > 0 && (
        <section>
          <h2>Habilidades</h2>
          {/* texto corrido: melhor para extração de palavras-chave pelo ATS */}
          <p className="item-desc">{c.habilidades.join(", ")}</p>
        </section>
      )}

      {idiomas.length > 0 && (
        <section>
          <h2>Idiomas</h2>
          <p className="item-desc">
            {idiomas
              .map((i) => [i.idioma, i.nivel].filter(Boolean).join(" — "))
              .join("; ")}
          </p>
        </section>
      )}
    </div>
  );
}
