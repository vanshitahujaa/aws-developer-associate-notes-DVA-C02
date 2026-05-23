import { useEffect, useState } from "react";
import { Background } from "./components/Background";
import { Sidebar, type View } from "./components/Sidebar";
import { HomeView } from "./components/HomeView";
import { TopicView } from "./components/TopicView";
import { ReferenceView } from "./components/ReferenceView";
import { allTopics } from "./data";

function App() {
  const initialFromHash = (): View => {
    const h = window.location.hash.replace("#", "");
    if (h.startsWith("ref:")) {
      return { kind: "reference", section: h.slice(4) as any };
    }
    if (h && allTopics.some((t) => t.id === h)) {
      return { kind: "topic", id: h };
    }
    return { kind: "home" };
  };

  const [view, setView] = useState<View>(initialFromHash);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onHash = () => setView(initialFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (view.kind === "home") window.location.hash = "";
    if (view.kind === "topic") window.location.hash = view.id;
    if (view.kind === "reference") window.location.hash = `ref:${view.section}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const topic =
    view.kind === "topic" ? allTopics.find((t) => t.id === view.id) : undefined;

  return (
    <div className="relative min-h-screen flex">
      <Background />
      <Sidebar view={view} setView={setView} search={search} setSearch={setSearch} />
      <main className="flex-1 p-6 md:p-10 min-w-0">
        {view.kind === "home" && <HomeView setView={setView} />}
        {view.kind === "topic" && topic && <TopicView topic={topic} />}
        {view.kind === "reference" && <ReferenceView section={view.section} />}
      </main>
    </div>
  );
}

export default App;
