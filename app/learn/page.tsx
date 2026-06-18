import type { Metadata } from "next";
import { Suspense } from "react";
import { Background } from "@/components/Background";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Catalog } from "@/components/Catalog";
import { PILLARS, type Pillar } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learn — Browse all topics",
  description: "Browse every data structure, algorithm, and system design concept with interactive visualizers.",
  alternates: { canonical: "/learn" },
};

const valid: Pillar[] = ["data-structures", "algorithms", "system-design"];

export default function LearnPage({
  searchParams,
}: {
  searchParams: { pillar?: string };
}) {
  const initialPillar = valid.includes(searchParams.pillar as Pillar)
    ? (searchParams.pillar as Pillar)
    : undefined;

  return (
    <>
      <Background />
      <Navbar />

      <main className="relative mx-auto max-w-content px-4 pt-28 sm:px-6">
        <Reveal>
          <span className="chip text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-algo" /> The library
          </span>
          <h1 className="mt-5 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Pick a concept. <span className="text-gradient">Watch it think.</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg text-slate-300">
            {initialPillar ? PILLARS[initialPillar].blurb : "Every topic comes with an animated, interactive visualizer and a no-fluff breakdown of how it really works."}
          </p>
        </Reveal>

        <div className="mt-12">
          <Suspense fallback={<div className="font-mono text-sm text-slate-500">Loading topics…</div>}>
            <Catalog />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}
