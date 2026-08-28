import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getStudentEnrollments } from "@/lib/data/portal";
import { getPublishedCourses } from "@/lib/data/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/site/course-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateShort, modeLabels } from "@/lib/format";

export const metadata: Metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const session = await verifyStudentSession();
  const [enrollments, allCourses] = await Promise.all([
    getStudentEnrollments(session.studentId),
    getPublishedCourses(),
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.batch.course.id));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track what you&apos;re enrolled in, or browse and enrol into something new without leaving your portal.
        </p>
      </div>

      <Tabs defaultValue="my-courses">
        <TabsList>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="all-courses">All Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="mt-6">
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No enrolled courses yet</p>
                <p className="text-sm text-muted-foreground">
                  Check the <span className="font-medium text-foreground">All Courses</span> tab above to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((e) => (
                <Link key={e.id} href={`/portal/courses/${e.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-heading text-base">{e.batch.course.title}</CardTitle>
                        {e.isTrial ? (
                          <Badge className="bg-primary">Free preview</Badge>
                        ) : e.completedAt ? (
                          <Badge className="bg-emerald-600">Completed</Badge>
                        ) : (
                          <Badge variant="secondary">Ongoing</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                      <p>{modeLabels[e.batch.mode] ?? e.batch.mode}</p>
                      <p>Started {formatDateShort(e.batch.startDate)}</p>
                      {e.batch.trainer ? <p>Trainer: {e.batch.trainer.name}</p> : null}
                      <p className="text-xs">Enrollment ID: {e.enrollmentCode}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all-courses" className="mt-6">
          {allCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No courses available right now</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allCourses.map((course) => (
                <div key={course.id} className="relative">
                  {enrolledCourseIds.has(course.id) ? (
                    <Badge className="absolute top-3 right-3 z-10 bg-emerald-600">Enrolled</Badge>
                  ) : null}
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Looking for something specific?{" "}
            <Link href="/courses" className="font-medium text-primary hover:underline">
              Search the full catalogue <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
