import prisma from "@/lib/db";
import SubmissionCard from "@/components/SubmissionCard";
import Link from "next/link";
import { PageHeader } from "@/components/UI";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;

  const where: any = {};
  if (category) where.category = category;

  const items = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: true, assets: true },
    take: 20,
  });

  const categories = ["ART", "DESIGN", "MUSIC", "PHOTOGRAPHY", "WRITING", "OTHER"];

  return (
    <div className="space-y-6">
      <PageHeader title="New" actions={<Link href="/submit" className="btn btn-primary">Submit</Link>} />
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="muted">Filter:</span>
        <Link className={`chip ${!category ? 'chip-accent' : ''}`} href="/">All</Link>
        {categories.map((c) => (
          <Link key={c} className={`chip ${category === c ? 'chip-accent' : ''}`} href={`/?category=${c}`}>{c}</Link>
        ))}
      </div>
      {items.length ? (
        <div className="grid grid-cols-1 gap-4">
          {items.map((s) => (
            <SubmissionCard key={s.id} submission={s as any} />
          ))}
        </div>
      ) : (
        <div className="text-sm muted">
          No submissions yet. Be the first to <Link href="/submit" className="underline">submit</Link>.
        </div>
      )}
    </div>
  );
}
