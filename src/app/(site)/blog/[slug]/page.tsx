import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/content";
import { formatDate } from "@/lib/format";
import { resolveStorageUrlOrNull, isSignableStorageUrl } from "@/lib/storage";
import { BlogPreview } from "@/components/site/home/blog-preview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const otherPosts = (await getPublishedPosts({ take: 4 })).filter((p) => p.id !== post.id).slice(0, 3);
  const coverImageUrl = await resolveStorageUrlOrNull(post.coverImageUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImageUrl && !isSignableStorageUrl(post.coverImageUrl) ? { image: post.coverImageUrl } : {}),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-xs font-medium text-muted-foreground">
          {post.publishedAt ? formatDate(post.publishedAt) : ""} · By {post.authorName}
        </p>
        <h1 className="mt-2 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-brand-2/10">
              <Newspaper className="h-10 w-10 text-primary/50" />
            </div>
          )}
        </div>

        <div className="prose prose-neutral mt-8 max-w-none text-foreground/90">
          {post.content.split("\n").map((para, i) => (
            <p key={i} className="mb-4 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </article>

      {otherPosts.length > 0 ? <BlogPreview posts={otherPosts} /> : null}
    </>
  );
}
