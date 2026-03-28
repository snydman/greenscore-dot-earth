import type { Metadata } from "next";
import ShareClient from "./ShareClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const score = String(params.s ?? "?");
  const b = String(params.b ?? "0");
  const t = String(params.t ?? "0");
  const h = String(params.h ?? "0");
  const i = String(params.i ?? "0");

  const a = String(params.a ?? "0");
  const ogParams = new URLSearchParams({ s: score, b, t, h, i, a });
  const ogImageUrl = `/api/og?${ogParams.toString()}`;

  return {
    title: `I scored ${score}/100 on GreenScore — what's yours?`,
    description:
      "GreenScore measures how green your financial life is across banking, transport, heating, and investments. Take the free quiz and find out.",
    openGraph: {
      title: `I scored ${score}/100 on GreenScore`,
      description: "How green is your financial life? Take the quiz and compare.",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `GreenScore: ${score}/100` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `I scored ${score}/100 on GreenScore`,
      description: "How green is your financial life? Take the quiz and compare.",
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <ShareClient
      score={Number(params.s ?? 0)}
      bank={Number(params.b ?? 0)}
      transport={Number(params.t ?? 0)}
      heating={Number(params.h ?? 0)}
      invest={Number(params.i ?? 0)}
      airTravel={Number(params.a ?? 0)}
    />
  );
}
