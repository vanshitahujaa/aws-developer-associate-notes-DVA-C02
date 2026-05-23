import { useState } from "react";
import type { Topic, PracticeQ } from "../data/types";
import { phaseLabels } from "../data";

/* ---------- Lightweight markdown for **bold** and `code` ---------- */
function MdText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let buf = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      if (buf) {
        parts.push(buf);
        buf = "";
      }
      const end = text.indexOf("**", i + 2);
      if (end === -1) {
        buf += text.slice(i);
        i = text.length;
      } else {
        parts.push(<strong key={i}>{text.slice(i + 2, end)}</strong>);
        i = end + 2;
      }
    } else if (text[i] === "`") {
      if (buf) {
        parts.push(buf);
        buf = "";
      }
      const end = text.indexOf("`", i + 1);
      if (end === -1) {
        buf += text.slice(i);
        i = text.length;
      } else {
        parts.push(<code key={i}>{text.slice(i + 1, end)}</code>);
        i = end + 1;
      }
    } else {
      buf += text[i];
      i++;
    }
  }
  if (buf) parts.push(buf);
  return <>{parts}</>;
}

/* ---------- Pill helpers ---------- */
function DomainPill({ domain }: { domain: string }) {
  const map: Record<string, string> = {
    Development: "pill-orange",
    Security: "pill-purple",
    Deployment: "pill-blue",
    Troubleshooting: "pill-green",
    Reference: "pill",
  };
  return <span className={`pill ${map[domain] ?? "pill"}`}>{domain}</span>;
}

/* ---------- Section wrapper ---------- */
function Card({ children }: { children: React.ReactNode }) {
  return <section className="panel p-6 md:p-7 fade-up">{children}</section>;
}

/* ---------- Practice question ---------- */
function Question({ q, idx }: { q: PracticeQ; idx: number }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [show, setShow] = useState(false);
  const isMulti = Array.isArray(q.correct);
  const correctSet = new Set(Array.isArray(q.correct) ? q.correct : [q.correct]);

  const toggle = (i: number) => {
    if (show) return;
    if (isMulti) {
      setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    } else {
      setPicked([i]);
    }
  };

  const isCorrect =
    show &&
    picked.length === correctSet.size &&
    picked.every((p) => correctSet.has(p));

  return (
    <div className="panel-2 p-5">
      <div className="flex items-start gap-3">
        <span className="pill pill-orange shrink-0 mt-0.5">Q{idx + 1}</span>
        <div style={{ color: "var(--text)" }} className="text-[15px] leading-relaxed">
          <MdText text={q.q} />
          {isMulti && (
            <span className="pill ml-2 align-middle text-[10px]">multi-select</span>
          )}
        </div>
      </div>

      <div className="mt-3.5 space-y-2">
        {q.options.map((opt, i) => {
          const isPicked = picked.includes(i);
          const isAnswer = correctSet.has(i);
          let cls = "opt";
          if (show && isAnswer) cls += " correct";
          else if (show && isPicked && !isAnswer) cls += " wrong";
          else if (isPicked) cls += " selected";
          return (
            <button key={i} onClick={() => toggle(i)} className={cls}>
              <span className="mr-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {String.fromCharCode(65 + i)}.
              </span>
              <MdText text={opt} />
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <button
          onClick={() => setShow((s) => !s)}
          className="text-xs px-3 py-1.5 rounded-md font-medium"
          style={{
            background: "var(--accent-soft)",
            color: "var(--accent)",
            border: "1px solid rgba(255,164,27,0.25)",
          }}
        >
          {show ? "Hide answer" : "Reveal answer"}
        </button>
        {show && (
          <span
            className="text-xs"
            style={{ color: isCorrect ? "var(--ok)" : "var(--err)" }}
          >
            {isCorrect ? "✓ Correct" : picked.length ? "✗ Not quite" : "—"}
          </span>
        )}
      </div>

      {show && (
        <div
          className="mt-3 fade-up text-[14.5px] leading-relaxed callout"
        >
          <span
            className="text-[10px] uppercase font-semibold tracking-[0.18em] mr-2"
            style={{ color: "var(--accent)" }}
          >
            Why
          </span>
          <MdText text={q.explanation} />
        </div>
      )}
    </div>
  );
}

/* ---------- Topic view ---------- */
export function TopicView({ topic }: { topic: Topic }) {
  return (
    <article
      className="mx-auto pb-24 fade-up prose-body"
      style={{ maxWidth: "780px" }}
    >
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="pill">{phaseLabels[topic.phase]}</span>
          <DomainPill domain={topic.domain} />
          <span className="pill">
            Topic {String(topic.number).padStart(2, "0")}
          </span>
        </div>
        <h1 className="title">{topic.title}</h1>
        {topic.weight && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {topic.weight}
          </p>
        )}
        <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--text)" }}>
          <MdText text={topic.blurb} />
        </p>
      </header>

      <div className="space-y-5">
        {topic.sections.map((s, i) => (
          <Card key={i}>
            <h2 className="h-sec mb-3">{s.heading}</h2>
            {s.body && (
              <p className="leading-relaxed">
                <MdText text={s.body} />
              </p>
            )}
            {s.bullets && (
              <ul className="bullet-list text-[15px]">
                {s.bullets.map((b, j) => (
                  <li key={j}>
                    <MdText text={b} />
                  </li>
                ))}
              </ul>
            )}
            {s.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr>
                      {s.table.headers.map((h, j) => (
                        <th key={j}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) => (
                          <td key={k}>
                            <MdText text={c} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {s.code && (
              <pre className="codeblock mt-3">
                <code>{s.code}</code>
              </pre>
            )}
          </Card>
        ))}

        {topic.keyNumbers && topic.keyNumbers.length > 0 && (
          <Card>
            <h2 className="h-sec mb-3">Key Numbers</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {topic.keyNumbers.map((n, i) => (
                <div
                  key={i}
                  className="panel-2 px-3 py-2 flex items-center justify-between gap-3"
                >
                  <span className="text-[14px]">
                    <MdText text={n.k} />
                  </span>
                  <span
                    className="text-[13px] font-mono"
                    style={{ color: "var(--accent)" }}
                  >
                    {n.v}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topic.howAsked && topic.howAsked.length > 0 && (
          <Card>
            <h2 className="h-sec mb-3">How it's asked on the exam</h2>
            <ul className="bullet-list text-[15px]">
              {topic.howAsked.map((b, j) => (
                <li key={j}>
                  <MdText text={b} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {topic.rootCauses && topic.rootCauses.length > 0 && (
          <Card>
            <h2 className="h-sec mb-1">Most-likely root cause</h2>
            <p className="text-[13.5px] mb-3" style={{ color: "var(--text-muted)" }}>
              Debug by probability. When you see the symptom, this is the &gt;50% reason.
            </p>
            <div className="space-y-2">
              {topic.rootCauses.map((r, i) => (
                <div
                  key={i}
                  className="panel-2 px-4 py-3 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-x-5 gap-y-1.5"
                >
                  <div className="text-[14px]">
                    <div
                      className="text-[10px] uppercase tracking-[0.16em] mb-0.5"
                      style={{ color: "var(--err)" }}
                    >
                      Symptom
                    </div>
                    <MdText text={r.symptom} />
                  </div>
                  <div className="text-[14px]">
                    <div
                      className="text-[10px] uppercase tracking-[0.16em] mb-0.5"
                      style={{ color: "var(--ok)" }}
                    >
                      Likely cause
                    </div>
                    <MdText text={r.cause} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topic.cases.length > 0 && (
          <Card>
            <h2 className="h-sec mb-3">Case Studies</h2>
            <div className="grid gap-3">
              {topic.cases.map((c, i) => (
                <div key={i} className="panel-2 p-4">
                  <div className="font-semibold mb-1" style={{ color: "var(--text-strong)" }}>
                    {c.title}
                  </div>
                  <div className="text-[14.5px] leading-relaxed">
                    <span
                      className="text-[10px] uppercase tracking-[0.18em] mr-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Scenario
                    </span>
                    <MdText text={c.scenario} />
                  </div>
                  <div className="text-[14.5px] leading-relaxed mt-1.5">
                    <span
                      className="text-[10px] uppercase tracking-[0.18em] mr-1.5"
                      style={{ color: "var(--ok)" }}
                    >
                      Answer
                    </span>
                    <MdText text={c.answer} />
                  </div>
                  <div className="text-[14.5px] leading-relaxed mt-1.5">
                    <span
                      className="text-[10px] uppercase tracking-[0.18em] mr-1.5"
                      style={{ color: "var(--accent)" }}
                    >
                      Why
                    </span>
                    <MdText text={c.why} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {topic.questions.length > 0 && (
          <Card>
            <h2 className="h-sec mb-1">Practice Questions</h2>
            <p className="text-[13.5px] mb-3" style={{ color: "var(--text-muted)" }}>
              Click an option to select, then reveal the answer.
            </p>
            <div className="space-y-3">
              {topic.questions.map((q, i) => (
                <Question key={i} q={q} idx={i} />
              ))}
            </div>
          </Card>
        )}

        {topic.gotchas.length > 0 && (
          <Card>
            <h2 className="h-sec mb-3">Gotchas Recap</h2>
            <ul className="bullet-list warn text-[15px]">
              {topic.gotchas.map((g, j) => (
                <li key={j}>
                  <MdText text={g} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </article>
  );
}
