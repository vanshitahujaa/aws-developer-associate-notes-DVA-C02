import { useState } from "react";
import {
  keywordMap,
  confusables,
  limits,
  distractorTraps,
  qualifierTips,
  examMeta,
  domains,
} from "../data/examInfo";

type Section =
  | "keywords"
  | "confusables"
  | "limits"
  | "traps"
  | "qualifiers"
  | "exam";

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto pb-24 fade-up" style={{ maxWidth: "860px" }}>
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="title mb-5">{children}</h1>;
}

function FilterInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Filter…"
      className="w-full px-3 py-2 text-sm rounded-md mb-4"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        color: "var(--text-strong)",
      }}
    />
  );
}

export function ReferenceView({ section }: { section: Section }) {
  const [q, setQ] = useState("");
  const search = q.trim().toLowerCase();

  if (section === "exam") {
    return (
      <Wrap>
        <Title>Exam Overview</Title>

        <section className="panel p-6">
          <h2 className="h-sec mb-3">At a glance</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {Object.entries(examMeta).map(([k, v]) => (
              <div key={k} className="panel-2 px-3 py-2.5">
                <div
                  className="text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {k}
                </div>
                <div
                  className="mt-0.5 text-sm font-medium"
                  style={{ color: "var(--text-strong)" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6 mt-4">
          <h2 className="h-sec mb-3">Domains & weights</h2>
          <div className="space-y-3.5">
            {domains.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--text)" }}>{d.name}</span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--accent)" }}
                  >
                    {d.weight}%
                  </span>
                </div>
                <div
                  className="h-1 mt-1.5 w-full rounded-full overflow-hidden"
                  style={{ background: "#1d212a" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${d.weight}%`,
                      background:
                        "linear-gradient(90deg, var(--accent), rgba(255,164,27,0.5))",
                    }}
                  />
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {d.rough} · {d.services.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-6 mt-4">
          <h2 className="h-sec mb-3">Question pattern types</h2>
          <ol
            className="list-decimal pl-5 space-y-1.5 text-[15px]"
            style={{ color: "var(--text)" }}
          >
            <li>
              <strong>Keyword-to-service mapping</strong> — the answer is hidden
              in the question's vocabulary.
            </li>
            <li>
              <strong>Distractor traps</strong> — wrong answers that look
              correct but break a security/architecture rule.
            </li>
            <li>
              <strong>MOST / LEAST / BEST qualifier</strong> — multiple answers
              work; the qualifier picks one.
            </li>
            <li>
              <strong>Scenario shape</strong> — opening sentence tells you the
              domain.
            </li>
            <li>
              <strong>Reverse-read</strong> — read the last sentence + qualifier
              first, then skim for keywords.
            </li>
          </ol>
        </section>
      </Wrap>
    );
  }

  if (section === "keywords") {
    const rows = keywordMap.filter(
      (r) =>
        !search ||
        r.when.toLowerCase().includes(search) ||
        r.then.toLowerCase().includes(search)
    );
    return (
      <Wrap>
        <Title>Keyword → Service Map</Title>
        <p style={{ color: "var(--text)" }} className="mb-4 leading-relaxed">
          AWS hides answers in the question. If you see the phrase on the left,
          almost always pick the service on the right.
        </p>
        <FilterInput value={q} onChange={setQ} />
        <div className="panel p-2">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>When you see…</th>
                <th>Pick…</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.when}</td>
                  <td style={{ color: "var(--accent)" }}>{r.then}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Wrap>
    );
  }

  if (section === "confusables") {
    const rows = confusables.filter(
      (c) =>
        !search ||
        c.a.toLowerCase().includes(search) ||
        c.b.toLowerCase().includes(search) ||
        c.how.toLowerCase().includes(search)
    );
    return (
      <Wrap>
        <Title>Confusable Pairs</Title>
        <p style={{ color: "var(--text)" }} className="mb-4 leading-relaxed">
          The exam loves to put two technically correct options side by side.
          Master the difference cold.
        </p>
        <FilterInput value={q} onChange={setQ} />
        <div className="grid gap-2.5">
          {rows.map((c, i) => (
            <div key={i} className="panel p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="pill pill-orange">{c.a}</span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  vs
                </span>
                <span className="pill pill-blue">{c.b}</span>
              </div>
              <div
                className="mt-2 text-[14.5px] leading-relaxed"
                style={{ color: "var(--text)" }}
              >
                {c.how}
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    );
  }

  if (section === "limits") {
    const rows = limits.filter(
      (l) =>
        !search ||
        l.k.toLowerCase().includes(search) ||
        l.v.toLowerCase().includes(search)
    );
    return (
      <Wrap>
        <Title>Numbers & Limits</Title>
        <p style={{ color: "var(--text)" }} className="mb-4 leading-relaxed">
          AWS likes "which fails first" questions. These numbers appear directly
          in the answer choices.
        </p>
        <FilterInput value={q} onChange={setQ} />
        <div className="panel p-2">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>Service / Concept</th>
                <th>Limit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l, i) => (
                <tr key={i}>
                  <td>{l.k}</td>
                  <td
                    className="font-mono"
                    style={{ color: "var(--accent)" }}
                  >
                    {l.v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Wrap>
    );
  }

  if (section === "traps") {
    const rows = distractorTraps.filter(
      (t) => !search || t.toLowerCase().includes(search)
    );
    return (
      <Wrap>
        <Title>Distractor Traps</Title>
        <p style={{ color: "var(--text)" }} className="mb-4 leading-relaxed">
          Wrong-answer patterns that show up across the exam. If you see one,
          almost always rule it out.
        </p>
        <FilterInput value={q} onChange={setQ} />
        <div className="grid gap-2">
          {rows.map((t, i) => (
            <div key={i} className="panel p-3 flex gap-3 items-start">
              <span className="pill pill-red shrink-0">Trap</span>
              <div
                className="text-[14.5px] leading-relaxed"
                style={{ color: "var(--text)" }}
              >
                {t}
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    );
  }

  // qualifiers
  const rows = qualifierTips.filter(
    (t) =>
      !search ||
      t.q.toLowerCase().includes(search) ||
      t.a.toLowerCase().includes(search)
  );
  return (
    <Wrap>
      <Title>"MOST / LEAST / BEST" Qualifier Cheats</Title>
      <p style={{ color: "var(--text)" }} className="mb-4 leading-relaxed">
        When the question uses a qualifier, multiple answers technically work —
        the qualifier picks one. These are the typical interpretations.
      </p>
      <div className="grid gap-2.5">
        {rows.map((t, i) => (
          <div key={i} className="panel p-4">
            <div
              className="font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {t.q}
            </div>
            <div
              className="mt-1 text-[14.5px] leading-relaxed"
              style={{ color: "var(--text)" }}
            >
              {t.a}
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}
