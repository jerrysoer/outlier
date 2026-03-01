import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { AnalysisResult } from "@/lib/types";
import type { Metadata } from "next";
import SharedResultView from "./SharedResultView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getAudit(slug: string): Promise<AnalysisResult | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from("audits")
      .select("result_json")
      .eq("slug", slug)
      .single();

    if (!data?.result_json) return null;
    return data.result_json as AnalysisResult;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getAudit(slug);

  if (!result) {
    return { title: "Outlier — Results Not Found" };
  }

  const title = `${result.channelA.meta.title} vs ${result.channelB.meta.title} — Outlier`;
  const rawRoast = result.viral?.roastCard;
  const roastText = typeof rawRoast === "string"
    ? rawRoast
    : (rawRoast?.forA || rawRoast?.forB || "");
  // coreFinding is string in new audits; guard against legacy objects from Supabase
  const coreFindingText = typeof result.coreFinding === "string"
    ? result.coreFinding
    : (result.coreFinding as unknown as { headline?: string })?.headline ?? "";
  const description = roastText || coreFindingText.slice(0, 150) || "YouTube channel competitive analysis by Outlier";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Outlier",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedResultPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getAudit(slug);

  if (!result) {
    notFound();
  }

  // Attach slug to result for share buttons
  result.slug = slug;

  return <SharedResultView result={result} />;
}
