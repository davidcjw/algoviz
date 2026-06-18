import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOPICS_BY_SLUG, topicsByPillar } from "@/lib/content";
import { TopicView } from "@/components/TopicView";

export function generateStaticParams() {
  return topicsByPillar("data-structures").map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = TOPICS_BY_SLUG[params.slug];
  if (!t) return {};
  const path = `/${t.pillar}/${t.slug}`;
  return {
    title: t.title,
    description: t.summary,
    alternates: { canonical: path },
    openGraph: { title: `${t.title} · AlgoViz`, description: t.summary, url: path, type: "article" },
    twitter: { card: "summary_large_image", title: `${t.title} · AlgoViz`, description: t.summary },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const topic = TOPICS_BY_SLUG[params.slug];
  if (!topic || topic.pillar !== "data-structures") notFound();
  return <TopicView topic={topic} />;
}
