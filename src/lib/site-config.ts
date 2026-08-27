export const siteConfig = {
  name: "Talent Expert",
  legalName: "Talent Expert",
  domain: "talentexpertedu.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.talentexpertedu.com",
  tagline: "Learn live. Get certified. Get hired.",
  description:
    "Career-focused live training, hands-on batches, and placement assistance across in-demand tech and professional courses.",
  phone: "+91 90000 00000",
  phoneHref: "tel:+919000000000",
  whatsappNumber: "919000000000",
  email: "hello@talentexpertedu.com",
  address: "Financial District, Hyderabad, Telangana, India",
  socials: {
    instagram: "https://instagram.com/talentexpertedu",
    linkedin: "https://linkedin.com/company/talentexpertedu",
    youtube: "https://youtube.com/@talentexpertedu",
    facebook: "https://facebook.com/talentexpertedu",
  },
};

export const modeLandingPages = [
  { slug: "classroom", label: "Classroom Training", mode: "CLASSROOM" as const },
  { slug: "online", label: "Online Training", mode: "ONLINE" as const },
  { slug: "weekend", label: "Weekend Batches", mode: "WEEKEND" as const },
  { slug: "corporate", label: "Corporate Training", mode: "CORPORATE" as const },
  { slug: "internships", label: "Internships", mode: "INTERNSHIP" as const },
  { slug: "workshops", label: "Free Workshops", mode: "WORKSHOP" as const },
];

export const mainNav = [
  { label: "Home", href: "/" },
  {
    label: "Courses",
    href: "/courses",
    children: [
      { label: "All Courses", href: "/courses" },
      { label: "New Batches", href: "/batches" },
      ...modeLandingPages.map((m) => ({ label: m.label, href: `/${m.slug}` })),
    ],
  },
  {
    label: "Placements",
    href: "/placements",
    children: [
      { label: "Placement Assistance", href: "/placements" },
      { label: "Careers & Job Openings", href: "/careers" },
      { label: "Interview Questions", href: "/blog?category=interview-questions" },
    ],
  },
  { label: "Trainers", href: "/trainers" },
  { label: "Blog", href: "/blog" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "FAQs", href: "/about/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const footerLinks = {
  courses: [
    { label: "All Courses", href: "/courses" },
    { label: "New Batches", href: "/batches" },
    { label: "Free Workshops", href: "/workshops" },
    { label: "Corporate Training", href: "/corporate" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Trainers", href: "/trainers" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Cancellation & Refund", href: "/cancellation-and-refund" },
  ],
  account: [
    { label: "Student Login", href: "/login" },
    { label: "Placement Assistance", href: "/placements" },
    { label: "FAQs", href: "/about/faqs" },
  ],
};
