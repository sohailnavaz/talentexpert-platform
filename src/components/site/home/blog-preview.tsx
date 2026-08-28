import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { RevealItem, RevealStagger } from "@/components/ui-fx/reveal";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/generated/prisma";

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From the blog"
          title="Career tips, interview prep & industry notes"
        />
        <RevealStagger className="-mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {posts.map((post) => (
            <RevealItem key={post.id} className="w-[78%] shrink-0 snap-center sm:w-auto sm:shrink">
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
                  {post.publishedAt ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </span>
                  ) : null}
                  <h3 className="mt-1.5 line-clamp-2 font-heading text-base font-semibold group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
