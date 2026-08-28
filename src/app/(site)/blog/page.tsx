import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { getPublishedPosts } from "@/lib/data/content";
import { PageHero } from "@/components/site/page-hero";
import { formatDate } from "@/lib/format";
import { resolveStorageUrlOrNull } from "@/lib/storage";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";

export const metadata: Metadata = {
  title: "Blog",
  description: "Career tips, interview prep and industry notes from the Talent Expert team.",
};

const CATEGORY_LABELS: Record<string, string> = {
  "interview-questions": "Interview Questions",
  "career-advice": "Career Advice",
  cloud: "Cloud",
  design: "Design",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const postsRaw = await getPublishedPosts({ category });
  const posts = await Promise.all(
    postsRaw.map(async (post) => ({ ...post, coverImageUrl: await resolveStorageUrlOrNull(post.coverImageUrl) }))
  );

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={category ? CATEGORY_LABELS[category] ?? "Blog" : "Career Tips & Interview Prep"}
        description="Practical, no-fluff articles written by trainers who are still working in the field."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No articles in this category yet.</p>
        ) : (
          <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <RevealItem key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full bg-muted">
                    {post.coverImageUrl ? (
                      <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-brand-2/10">
                        <Newspaper className="h-8 w-8 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      {post.category ? ` · ${CATEGORY_LABELS[post.category] ?? post.category}` : ""}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 font-heading text-base font-semibold group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </section>
    </>
  );
}
