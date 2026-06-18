import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lightbulb, TriangleAlert } from "lucide-react";
import { PILLARS, topicsByPillar, type Topic } from "@/lib/content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Background } from "@/components/Background";
import { Reveal } from "@/components/Reveal";
import { Visualizer } from "@/components/visualizers/Visualizer";
import { cn } from "@/lib/utils";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const accentText: Record<string, string> = {
  "data-structures": "text-ds",
  algorithms: "text-algo",
  "system-design": "text-sys",
};
const accentBorder: Record<string, string> = {
  "data-structures": "border-ds/40",
  algorithms: "border-algo/40",
  "system-design": "border-sys/40",
};
const diffColor: Record<string, string> = {
  Core: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  Intermediate: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  Advanced: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-400/10",
};

export function TopicView({ topic }: { topic: Topic }) {
  const pillar = PILLARS[topic.pillar];
  const siblings = topicsByPillar(topic.pillar);
  const idx = siblings.findIndex((t) => t.slug === topic.slug);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const at = accentText[topic.pillar];
  const path = `/${topic.pillar}/${topic.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Learn", item: absoluteUrl("/learn") },
          { "@type": "ListItem", position: 2, name: pillar.name, item: absoluteUrl(`/learn?pillar=${topic.pillar}`) },
          { "@type": "ListItem", position: 3, name: topic.title, item: absoluteUrl(path) },
        ],
      },
      {
        "@type": "LearningResource",
        name: topic.title,
        description: topic.summary,
        url: absoluteUrl(path),
        learningResourceType: "Interactive visualization",
        educationalLevel: topic.difficulty,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "AlgoViz" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Background />
      <Navbar />

      <main className="relative mx-auto max-w-content px-4 pt-28 sm:px-6">
        {/* breadcrumb */}
        <Reveal>
          <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-wider text-slate-500">
            <Link href="/learn" className="transition-colors hover:text-white">
              learn
            </Link>
            <span>/</span>
            <Link href={`/learn?pillar=${topic.pillar}`} className={cn("transition-colors hover:text-white", at)}>
              {pillar.name}
            </Link>
            <span>/</span>
            <span className="text-slate-300">{topic.title}</span>
          </div>
        </Reveal>

        {/* header */}
        <header className="mt-6 max-w-3xl">
          <Reveal i={1}>
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn("chip", at, accentBorder[topic.pillar])}>
                {pillar.glyph} {topic.category}
              </span>
              <span className={cn("rounded-full border px-3 py-1 font-mono text-2xs uppercase tracking-wider", diffColor[topic.difficulty])}>
                {topic.difficulty}
              </span>
              {topic.live && (
                <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-algo" /> interactive
                </span>
              )}
            </div>
          </Reveal>
          <Reveal i={2}>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">{topic.title}</h1>
            <p className={cn("mt-3 font-mono text-sm", at)}>{topic.tagline}</p>
          </Reveal>
        </header>

        {/* visualizer */}
        <Reveal i={3}>
          <div className="mt-10">
            <Visualizer slug={topic.slug} />
          </div>
        </Reveal>

        {/* content */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <Reveal>
              <section>
                <SectionLabel>How it works</SectionLabel>
                <p className="mt-3 text-pretty text-base leading-relaxed text-slate-300">{topic.summary}</p>
              </section>
            </Reveal>

            {topic.insights && (
              <Reveal>
                <section>
                  <SectionLabel>
                    <Lightbulb size={13} className={at} /> Mental models
                  </SectionLabel>
                  <ul className="mt-4 space-y-3">
                    {topic.insights.map((ins) => (
                      <li key={ins} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                        <Check size={16} className={cn("mt-0.5 shrink-0", at)} />
                        {ins}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {topic.pitfalls && (
              <Reveal>
                <section>
                  <SectionLabel>
                    <TriangleAlert size={13} className="text-amber-300" /> Common pitfalls
                  </SectionLabel>
                  <ul className="mt-4 space-y-3">
                    {topic.pitfalls.map((p) => (
                      <li key={p} className="flex gap-3 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2.5 text-sm leading-relaxed text-slate-300">
                        <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-300" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}
          </div>

          <div className="space-y-6">
            {topic.complexity && (
              <Reveal>
                <div className="card p-5">
                  <SectionLabel>Complexity</SectionLabel>
                  <dl className="mt-4 space-y-2.5">
                    {topic.complexity.map((c) => (
                      <div key={c.label} className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5 last:border-0 last:pb-0">
                        <dt className="text-sm text-slate-400">{c.label}</dt>
                        <dd className="text-right">
                          <span className={cn("font-mono text-sm font-semibold", at)}>{c.value}</span>
                          {c.note && <span className="ml-2 font-mono text-2xs text-slate-500">{c.note}</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            )}

            {topic.useCases && (
              <Reveal>
                <div className="card p-5">
                  <SectionLabel>Reach for it when</SectionLabel>
                  <ul className="mt-4 space-y-2.5">
                    {topic.useCases.map((u) => (
                      <li key={u} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <ArrowRight size={15} className={cn("mt-0.5 shrink-0", at)} />
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {/* prev / next */}
        <nav className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/${prev.pillar}/${prev.slug}`} className="group flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:bg-white/5">
              <ArrowLeft size={18} className="text-slate-500 transition-transform group-hover:-translate-x-1" />
              <div>
                <div className="font-mono text-2xs uppercase text-slate-500">Previous</div>
                <div className="font-semibold">{prev.title}</div>
              </div>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/${next.pillar}/${next.slug}`} className="group flex items-center justify-end gap-3 rounded-xl border border-line bg-white/[0.02] p-4 text-right transition-colors hover:bg-white/5 sm:col-start-2">
              <div>
                <div className="font-mono text-2xs uppercase text-slate-500">Next</div>
                <div className="font-semibold">{next.title}</div>
              </div>
              <ArrowRight size={18} className="text-slate-500 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </nav>
      </main>

      <Footer />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-slate-500">
      {children}
    </h2>
  );
}
