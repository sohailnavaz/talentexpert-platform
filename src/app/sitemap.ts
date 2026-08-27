import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

const STATIC_ROUTES = [
  "",
  "/courses",
  "/batches",
  "/online",
  "/classroom",
  "/weekend",
  "/corporate",
  "/internships",
  "/workshops",
  "/placements",
  "/careers",
  "/trainers",
  "/blog",
  "/about",
  "/about/faqs",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
  "/cancellation-and-refund",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, trainers, posts] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.trainer.findMany({ where: { active: true }, select: { slug: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${siteConfig.url}/courses/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const trainerEntries: MetadataRoute.Sitemap = trainers.map((t) => ({
    url: `${siteConfig.url}/trainers/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...courseEntries, ...trainerEntries, ...postEntries];
}
