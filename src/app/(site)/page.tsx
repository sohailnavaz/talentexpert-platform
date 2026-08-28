import { db } from "@/lib/db";
import { getFeaturedCourses, getUpcomingBatches } from "@/lib/data/courses";
import { getActivePlacements, getActiveTestimonials, getPublishedPosts } from "@/lib/data/content";
import { Hero } from "@/components/site/home/hero";
import { HowItWorks } from "@/components/site/home/how-it-works";
import { WhyUs } from "@/components/site/home/why-us";
import { FeaturedCourses } from "@/components/site/home/featured-courses";
import { UpcomingBatches } from "@/components/site/home/upcoming-batches";
import { PlacementsWall } from "@/components/site/home/placements-wall";
import { Testimonials } from "@/components/site/home/testimonials";
import { BlogPreview } from "@/components/site/home/blog-preview";
import { FinalCta } from "@/components/site/home/final-cta";

export default async function HomePage() {
  const [courses, batches, placements, testimonials, posts, studentsCount, coursesCount] =
    await Promise.all([
      getFeaturedCourses(3),
      getUpcomingBatches({ take: 2 }),
      getActivePlacements(10),
      getActiveTestimonials(8),
      getPublishedPosts({ take: 3 }),
      db.enrollment.count({ where: { status: "PAID" } }),
      db.course.count({ where: { status: "PUBLISHED" } }),
    ]);

  return (
    <>
      <Hero
        studentsCount={Math.max(studentsCount, 500)}
        coursesCount={Math.max(coursesCount, 30)}
        hiringPartners={40}
      />
      <HowItWorks />
      <FeaturedCourses courses={courses} />
      <UpcomingBatches batches={batches} />
      <WhyUs />
      <PlacementsWall placements={placements} />
      <Testimonials testimonials={testimonials} />
      <BlogPreview posts={posts} />
      <FinalCta />
    </>
  );
}
