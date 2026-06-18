import Link from "next/link";
import { ArrowRight, Eye, Gauge, MousePointerClick, Sparkles } from "lucide-react";
import { Background } from "@/components/Background";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { TopicMarquee } from "@/components/landing/TopicMarquee";
import { PillarCards } from "@/components/landing/PillarCards";
import { LinkedListDemo } from "@/components/landing/LinkedListDemo";
import { TOPICS } from "@/lib/content";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
  ],
};

export default function Home() {
  const liveCount = TOPICS.filter((t) => t.live).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Background />
      <Navbar />

      <main className="relative">
        {/* ───────────── Hero ───────────── */}
        <section className="relative mx-auto max-w-content px-4 pb-12 pt-32 sm:px-6 sm:pt-40">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Reveal>
                <span className="chip text-slate-300">
                  <Sparkles size={13} className="text-algo" />
                  Interactive CS, visualized
                </span>
              </Reveal>

              <Reveal i={1}>
                <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
                  See how <span className="text-gradient">algorithms</span> think.
                </h1>
              </Reveal>

              <Reveal i={2}>
                <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-300">
                  The ultimate playground for data structures, algorithms, and system
                  design. Don&apos;t grind problems — <em className="text-white not-italic">watch</em>{" "}
                  concepts come alive through animation, then build real intuition.
                </p>
              </Reveal>

              <Reveal i={3}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/learn"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    Start exploring
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/data-structures/linked-list"
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                  >
                    <MousePointerClick size={18} className="text-ds" />
                    Try a visualizer
                  </Link>
                </div>
              </Reveal>

              <Reveal i={4}>
                <dl className="mt-12 flex gap-8">
                  <Stat value={`${TOPICS.length}+`} label="Topics" />
                  <Stat value={`${liveCount}`} label="Live visualizers" />
                  <Stat value="3" label="Pillars" />
                </dl>
              </Reveal>
            </div>

            <Reveal i={2}>
              <HeroVisual />
            </Reveal>
          </div>
        </section>

        <TopicMarquee />

        <PillarCards />

        {/* ───────────── Why visual ───────────── */}
        <section className="relative z-10 mx-auto max-w-content px-4 py-20 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <LinkedListDemo />
            </div>
            <div className="order-1 lg:order-2">
              <Reveal>
                <p className="chip text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-ds" /> Why it works
                </p>
                <h2 className="mt-4 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
                  Memorizing fades. <br />
                  <span className="text-gradient">Seeing it move</span> sticks.
                </h2>
                <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-slate-300">
                  A linked list isn&apos;t a definition to recite — it&apos;s pointers being
                  rewired. When you watch a node splice into place, the mechanics become
                  obvious and unforgettable.
                </p>
              </Reveal>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Eye, title: "Watch", body: "Every concept animated step by step." },
                  { icon: MousePointerClick, title: "Play", body: "Drive it yourself with live controls." },
                  { icon: Gauge, title: "Grasp Big-O", body: "Feel why complexity matters." },
                ].map((f, i) => (
                  <Reveal i={i} key={f.title}>
                    <div className="card h-full p-4">
                      <f.icon size={20} className="text-algo" />
                      <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{f.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Final CTA ───────────── */}
        <section className="relative z-10 mx-auto max-w-content px-4 py-20 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-ink-800 to-ink-900 px-6 py-16 text-center sm:px-12">
              <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-algo/15 blur-[120px]" />
              <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
                Your next interview starts with{" "}
                <span className="text-gradient">understanding</span>.
              </h2>
              <p className="relative mx-auto mt-4 max-w-lg text-slate-300">
                Pick a data structure, hit play, and watch it click. No login, no
                friction — just learning.
              </p>
              <Link
                href="/learn"
                className="group relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
              >
                Browse all topics
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-3xl font-extrabold text-white">{value}</dt>
      <dd className="mt-1 font-mono text-2xs uppercase tracking-wider text-slate-500">{label}</dd>
    </div>
  );
}
