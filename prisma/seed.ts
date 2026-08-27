import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const CATEGORIES = [
  "Web Development",
  "Data Science & AI",
  "Cloud & DevOps",
  "Quality Assurance",
  "Design",
  "Digital Marketing",
];

const TRAINERS = [
  {
    name: "Ananya Rao",
    bio: "Full-stack engineer turned trainer, previously built consumer products at scale before moving into full-time mentorship.",
    experienceYears: 9,
    expertise: ["React", "Node.js", "System Design"],
  },
  {
    name: "Vikram Shetty",
    bio: "Data scientist and educator focused on making statistics and machine learning approachable for career switchers.",
    experienceYears: 8,
    expertise: ["Python", "Machine Learning", "SQL"],
  },
  {
    name: "Priya Menon",
    bio: "Cloud architect with a decade of production AWS experience, now dedicated to hands-on cloud training.",
    experienceYears: 11,
    expertise: ["AWS", "DevOps", "Terraform"],
  },
  {
    name: "Rahul Deshpande",
    bio: "QA lead who has shipped test automation frameworks for fintech and e-commerce platforms.",
    experienceYears: 7,
    expertise: ["Selenium", "API Testing", "Test Strategy"],
  },
  {
    name: "Sneha Kapoor",
    bio: "Product designer with an eye for usability, trains learners to think like designers before they touch a tool.",
    experienceYears: 6,
    expertise: ["UI/UX", "Figma", "Design Systems"],
  },
  {
    name: "Arjun Nair",
    bio: "Performance marketer who has managed multi-lakh ad budgets, now teaches practical, campaign-first digital marketing.",
    experienceYears: 8,
    expertise: ["SEO", "Performance Marketing", "Analytics"],
  },
];

type CourseSeed = {
  title: string;
  category: string;
  trainer: string;
  shortDescription: string;
  description: string;
  modes: ("ONLINE" | "CLASSROOM" | "WEEKEND" | "CORPORATE" | "INTERNSHIP" | "WORKSHOP")[];
  level: string;
  durationText: string;
  regularFee: number;
  featured?: boolean;
  highlights: string[];
  modules: { title: string; topics: string[] }[];
  faqs: { q: string; a: string }[];
};

const COURSES: CourseSeed[] = [
  {
    title: "Full Stack Web Development (MERN)",
    category: "Web Development",
    trainer: "Ananya Rao",
    shortDescription: "Build and ship production-grade web apps with MongoDB, Express, React and Node.js.",
    description:
      "A project-driven full stack program covering modern JavaScript, React on the frontend, and Node/Express with MongoDB on the backend. You'll ship three real applications and leave with a deployable portfolio.",
    modes: ["ONLINE", "WEEKEND"],
    level: "Beginner to Advanced",
    durationText: "16 weeks",
    regularFee: 42000,
    featured: true,
    highlights: [
      "Three portfolio-ready projects, including a full e-commerce app",
      "Live doubt-clearing sessions twice a week",
      "Resume and GitHub profile review before placement support begins",
    ],
    modules: [
      { title: "Part I — Frontend Foundations", topics: ["HTML, CSS & responsive layout", "Modern JavaScript (ES6+)", "React fundamentals", "State management with hooks"] },
      { title: "Part II — Backend & APIs", topics: ["Node.js & Express", "REST API design", "Authentication with JWT", "MongoDB & Mongoose"] },
      { title: "Part III — Shipping Real Apps", topics: ["Deployment & CI basics", "Testing fundamentals", "Capstone project"] },
    ],
    faqs: [
      { q: "Do I need prior coding experience?", a: "No — we start from JavaScript fundamentals in week one." },
      { q: "Is this course live or recorded?", a: "Fully live, with recordings shared afterward for revision." },
    ],
  },
  {
    title: "Python Full Stack Development",
    category: "Web Development",
    trainer: "Ananya Rao",
    shortDescription: "Django and React for backend-leaning developers who want a Python-first stack.",
    description:
      "Learn to build robust web applications using Python and Django on the backend paired with React on the frontend, including deployment to a real cloud environment.",
    modes: ["ONLINE", "CLASSROOM"],
    level: "Beginner to Intermediate",
    durationText: "14 weeks",
    regularFee: 38000,
    highlights: ["Django ORM and admin panel mastery", "React frontend integration", "Deployed capstone project"],
    modules: [
      { title: "Python & Django Basics", topics: ["Python fundamentals", "Django models & views", "Django admin & auth"] },
      { title: "APIs & Frontend", topics: ["Django REST Framework", "React basics", "Connecting frontend to APIs"] },
      { title: "Deployment", topics: ["Environment configuration", "Deploying to the cloud"] },
    ],
    faqs: [{ q: "Is Django hard to learn for beginners?", a: "No — we build up gradually with small projects each week." }],
  },
  {
    title: "Java Full Stack Development",
    category: "Web Development",
    trainer: "Ananya Rao",
    shortDescription: "Spring Boot, Hibernate and Angular — the enterprise-standard full stack.",
    description:
      "A comprehensive program covering Core Java, Spring Boot microservices, Hibernate for persistence, and Angular for the frontend — the stack most in demand at enterprise employers.",
    modes: ["ONLINE", "WEEKEND", "CORPORATE"],
    level: "Beginner to Advanced",
    durationText: "18 weeks",
    regularFee: 45000,
    highlights: ["Microservices with Spring Boot", "Hands-on Angular frontend module", "Mock technical interviews included"],
    modules: [
      { title: "Core Java & OOP", topics: ["Java syntax & OOP", "Collections & exceptions", "Multithreading basics"] },
      { title: "Spring Boot & Hibernate", topics: ["REST APIs with Spring Boot", "Hibernate & JPA", "Spring Security basics"] },
      { title: "Angular Frontend", topics: ["Angular components & routing", "Services & HTTP client"] },
    ],
    faqs: [{ q: "Will this help with product-company interviews?", a: "Yes — we include DSA-lite problem solving alongside the stack." }],
  },
  {
    title: "Data Science with Python",
    category: "Data Science & AI",
    trainer: "Vikram Shetty",
    shortDescription: "From Python and statistics to machine learning models you can explain and deploy.",
    description:
      "Covers the full data science workflow: Python for data analysis, statistics, visualization, and machine learning — ending with a deployed model as your capstone project.",
    modes: ["ONLINE", "WEEKEND"],
    level: "Beginner to Advanced",
    durationText: "16 weeks",
    regularFee: 48000,
    featured: true,
    highlights: ["Real datasets, not toy examples", "Capstone: an end-to-end ML project", "Interview prep for data roles"],
    modules: [
      { title: "Python & Statistics", topics: ["Python for data analysis", "NumPy & Pandas", "Statistics fundamentals"] },
      { title: "Visualization & ML", topics: ["Matplotlib & Seaborn", "Supervised learning", "Model evaluation"] },
      { title: "Capstone", topics: ["Feature engineering", "Deploying a model with an API"] },
    ],
    faqs: [{ q: "Do I need a math background?", a: "Basic algebra is enough — we teach the statistics you need as we go." }],
  },
  {
    title: "Data Analytics with SQL & Power BI",
    category: "Data Science & AI",
    trainer: "Vikram Shetty",
    shortDescription: "Turn raw business data into dashboards and decisions using SQL and Power BI.",
    description:
      "A practical analytics course for aspiring data analysts — covering advanced SQL querying, data modelling, and building interactive dashboards in Power BI.",
    modes: ["ONLINE", "CLASSROOM"],
    level: "Beginner to Intermediate",
    durationText: "10 weeks",
    regularFee: 28000,
    highlights: ["Advanced SQL window functions", "Real business-case dashboards", "Portfolio of 3 Power BI reports"],
    modules: [
      { title: "SQL for Analysts", topics: ["Joins & subqueries", "Window functions", "Query optimisation basics"] },
      { title: "Power BI", topics: ["Data modelling", "DAX fundamentals", "Interactive dashboards"] },
    ],
    faqs: [{ q: "Is this suitable for non-tech graduates?", a: "Yes — most of our analytics learners come from non-CS backgrounds." }],
  },
  {
    title: "Machine Learning & Deep Learning",
    category: "Data Science & AI",
    trainer: "Vikram Shetty",
    shortDescription: "Go beyond scikit-learn into neural networks, CNNs and real deployment.",
    description:
      "An advanced-track course for learners who already know Python and statistics, diving into deep learning architectures, neural networks, and deploying models at scale.",
    modes: ["ONLINE"],
    level: "Advanced",
    durationText: "12 weeks",
    regularFee: 39000,
    highlights: ["Hands-on with TensorFlow and PyTorch", "Covers CNNs and basic NLP", "Project-based evaluation"],
    modules: [
      { title: "Neural Network Foundations", topics: ["Perceptrons & backpropagation", "TensorFlow/PyTorch basics"] },
      { title: "Deep Learning Applications", topics: ["Convolutional networks", "Intro to NLP"] },
    ],
    faqs: [{ q: "What's the prerequisite?", a: "Comfort with Python and basic machine learning concepts." }],
  },
  {
    title: "AWS Cloud Practitioner to Solutions Architect",
    category: "Cloud & DevOps",
    trainer: "Priya Menon",
    shortDescription: "Go from AWS fundamentals to designing production-ready cloud architectures.",
    description:
      "A structured path from AWS basics to solutions-architect-level design thinking, with hands-on labs in EC2, S3, VPC, IAM and cost optimisation, mapped to the official certification.",
    modes: ["ONLINE", "WEEKEND"],
    level: "Beginner to Advanced",
    durationText: "10 weeks",
    regularFee: 32000,
    featured: true,
    highlights: ["Mapped to AWS certification exam objectives", "Hands-on labs in every session", "Architecture review of your own project"],
    modules: [
      { title: "AWS Foundations", topics: ["Core services overview", "IAM & security basics", "EC2 & S3"] },
      { title: "Networking & Architecture", topics: ["VPC design", "Load balancing & auto scaling", "Cost optimisation"] },
    ],
    faqs: [{ q: "Does this prepare me for AWS certification?", a: "Yes, the syllabus maps directly to the Solutions Architect Associate exam." }],
  },
  {
    title: "DevOps Engineering",
    category: "Cloud & DevOps",
    trainer: "Priya Menon",
    shortDescription: "CI/CD, containers and infrastructure-as-code — the full DevOps toolchain.",
    description:
      "Covers the practical DevOps toolchain end to end: Git workflows, Docker, Kubernetes basics, Jenkins pipelines and Terraform, with a capstone that automates a real deployment.",
    modes: ["ONLINE", "CORPORATE"],
    level: "Intermediate",
    durationText: "12 weeks",
    regularFee: 36000,
    highlights: ["Docker & Kubernetes from scratch", "Build a real CI/CD pipeline", "Terraform infrastructure-as-code module"],
    modules: [
      { title: "Containers", topics: ["Docker fundamentals", "Kubernetes basics"] },
      { title: "CI/CD & IaC", topics: ["Jenkins pipelines", "Terraform basics", "Monitoring fundamentals"] },
    ],
    faqs: [{ q: "Do I need cloud experience first?", a: "Basic Linux and command-line comfort is enough to start." }],
  },
  {
    title: "Microsoft Azure Administrator",
    category: "Cloud & DevOps",
    trainer: "Priya Menon",
    shortDescription: "Administer and secure Azure environments with hands-on, exam-aligned training.",
    description:
      "Covers Azure identity, storage, networking and compute administration, aligned with the AZ-104 certification, with weekly hands-on labs in a real Azure environment.",
    modes: ["ONLINE"],
    level: "Beginner to Intermediate",
    durationText: "8 weeks",
    regularFee: 26000,
    highlights: ["Aligned to AZ-104 exam objectives", "Weekly hands-on labs", "Practice exams included"],
    modules: [
      { title: "Identity & Storage", topics: ["Azure AD basics", "Storage accounts"] },
      { title: "Compute & Networking", topics: ["Virtual machines", "Virtual networks"] },
    ],
    faqs: [{ q: "Is a laptop with specific specs required?", a: "Any laptop that can run a browser — labs run in the cloud." }],
  },
  {
    title: "Manual & Automation Testing with Selenium",
    category: "Quality Assurance",
    trainer: "Rahul Deshpande",
    shortDescription: "From test-case writing to a working Selenium automation framework.",
    description:
      "Start with manual testing fundamentals — test cases, bug reports, test plans — then build a complete Selenium with Java automation framework you can show in interviews.",
    modes: ["ONLINE", "CLASSROOM", "WEEKEND"],
    level: "Beginner to Intermediate",
    durationText: "10 weeks",
    regularFee: 26000,
    featured: true,
    highlights: ["Manual testing fundamentals included", "Build a real automation framework", "API testing with Postman module"],
    modules: [
      { title: "Manual Testing", topics: ["Test case design", "Bug life cycle", "Test planning"] },
      { title: "Automation with Selenium", topics: ["Selenium WebDriver", "TestNG framework", "Page Object Model"] },
      { title: "API Testing", topics: ["Postman fundamentals", "REST Assured basics"] },
    ],
    faqs: [{ q: "Is coding knowledge required to start?", a: "We teach the Java basics you need for automation from scratch." }],
  },
  {
    title: "API Testing & Postman Mastery",
    category: "Quality Assurance",
    trainer: "Rahul Deshpande",
    shortDescription: "A focused, fast-track course on testing APIs the way professional QA teams do.",
    description:
      "A short, focused course for testers who want to specialise in API testing — covering Postman collections, REST Assured, and integrating API tests into CI pipelines.",
    modes: ["ONLINE", "WORKSHOP"],
    level: "Intermediate",
    durationText: "3 weeks",
    regularFee: 9000,
    highlights: ["Fast-track format", "Hands-on Postman collections", "CI integration basics"],
    modules: [{ title: "API Testing Essentials", topics: ["Postman collections & environments", "REST Assured basics", "CI integration"] }],
    faqs: [{ q: "Is this a good add-on to manual testing?", a: "Yes — it's designed as a specialisation for working testers." }],
  },
  {
    title: "UI/UX Design Foundations",
    category: "Design",
    trainer: "Sneha Kapoor",
    shortDescription: "Design thinking, wireframing and Figma — a portfolio-first design course.",
    description:
      "Learn user research, wireframing, prototyping and visual design in Figma, culminating in a case-study-ready portfolio project reviewed by a working product designer.",
    modes: ["ONLINE", "WEEKEND"],
    level: "Beginner",
    durationText: "8 weeks",
    regularFee: 24000,
    highlights: ["Portfolio-ready case study", "1:1 design review session", "Figma component libraries covered"],
    modules: [
      { title: "Design Foundations", topics: ["Design thinking", "User research basics", "Information architecture"] },
      { title: "Figma & Prototyping", topics: ["Wireframing", "Component libraries", "Interactive prototypes"] },
    ],
    faqs: [{ q: "Do I need drawing skills?", a: "No — UI/UX design is about problem-solving, not illustration." }],
  },
  {
    title: "Digital Marketing & Performance Advertising",
    category: "Digital Marketing",
    trainer: "Arjun Nair",
    shortDescription: "SEO, social, and paid ads — run real campaigns, not just theory.",
    description:
      "A campaign-first digital marketing course covering SEO, social media strategy, and performance advertising on Google and Meta, with a live-budget campaign project.",
    modes: ["ONLINE", "CLASSROOM"],
    level: "Beginner to Intermediate",
    durationText: "8 weeks",
    regularFee: 22000,
    highlights: ["Run a real ad campaign with reporting", "Covers SEO, SEM and social", "Analytics & reporting module"],
    modules: [
      { title: "SEO & Content", topics: ["On-page SEO", "Keyword research", "Content strategy basics"] },
      { title: "Paid Advertising", topics: ["Google Ads", "Meta Ads Manager", "Campaign analytics"] },
    ],
    faqs: [{ q: "Is a budget required for the live campaign?", a: "No — we use small shared test budgets for the practical module." }],
  },
  {
    title: "Business Analyst Certification",
    category: "Data Science & AI",
    trainer: "Vikram Shetty",
    shortDescription: "Bridge business needs and technical teams with a structured BA toolkit.",
    description:
      "Covers requirement gathering, process modelling, SQL basics and stakeholder communication — the core toolkit for a business analyst role in a tech organisation.",
    modes: ["ONLINE", "WEEKEND"],
    level: "Beginner to Intermediate",
    durationText: "8 weeks",
    regularFee: 25000,
    highlights: ["Requirement-gathering templates included", "SQL for business analysts", "Mock stakeholder interviews"],
    modules: [
      { title: "BA Fundamentals", topics: ["Requirement elicitation", "Process modelling (BPMN)", "Documentation standards"] },
      { title: "Data for BAs", topics: ["SQL basics", "Dashboarding fundamentals"] },
    ],
    faqs: [{ q: "Is this suitable for freshers?", a: "Yes, though some business or IT familiarity helps." }],
  },
  {
    title: "React Native Mobile App Development",
    category: "Web Development",
    trainer: "Ananya Rao",
    shortDescription: "Build and ship real cross-platform mobile apps with React Native.",
    description:
      "For developers who already know JavaScript/React, this course covers building, testing and publishing cross-platform mobile apps using React Native and Expo.",
    modes: ["ONLINE"],
    level: "Intermediate",
    durationText: "8 weeks",
    regularFee: 27000,
    highlights: ["Publish to app stores as a capstone", "Native device API integration", "Covers both iOS and Android builds"],
    modules: [
      { title: "React Native Basics", topics: ["Components & navigation", "State management"] },
      { title: "Native Features & Publishing", topics: ["Device APIs", "App store publishing"] },
    ],
    faqs: [{ q: "Do I need a Mac to build iOS apps?", a: "We cover Expo-based workflows that don't strictly require one for learning." }],
  },
  {
    title: "Cybersecurity Fundamentals",
    category: "Cloud & DevOps",
    trainer: "Priya Menon",
    shortDescription: "Network security, ethical hacking basics and security operations, hands-on.",
    description:
      "An introductory-to-intermediate cybersecurity course covering network fundamentals, common attack vectors, ethical hacking basics, and security operations tooling.",
    modes: ["ONLINE", "WEEKEND"],
    level: "Beginner to Intermediate",
    durationText: "10 weeks",
    regularFee: 30000,
    highlights: ["Hands-on labs in a safe sandbox", "Covers OWASP Top 10", "Intro to SOC tooling"],
    modules: [
      { title: "Security Foundations", topics: ["Networking basics for security", "Common attack vectors", "OWASP Top 10"] },
      { title: "Hands-on Security", topics: ["Ethical hacking basics", "Security operations tooling"] },
    ],
    faqs: [{ q: "Is this course legal and safe to practice?", a: "All labs run in isolated, sanctioned sandbox environments." }],
  },
];

const TESTIMONIALS = [
  { studentName: "Meghana Reddy", courseName: "Full Stack Web Development (MERN)", quote: "I had zero coding background six months ago. The live sessions and project reviews made all the difference — I'm now working as a frontend developer.", rating: 5 },
  { studentName: "Karthik Iyer", courseName: "AWS Cloud Practitioner to Solutions Architect", quote: "The hands-on labs were exactly what I needed. I cleared my AWS certification within two weeks of finishing the course.", rating: 5 },
  { studentName: "Divya Sharma", courseName: "Data Science with Python", quote: "The trainer explained statistics in a way that finally made sense. The capstone project is now the centerpiece of my portfolio.", rating: 5 },
  { studentName: "Ritesh Gupta", courseName: "Manual & Automation Testing with Selenium", quote: "Went from a non-tech background to a QA automation role. The framework we built in class is almost identical to what I use at work now.", rating: 4 },
  { studentName: "Ananya Joshi", courseName: "UI/UX Design Foundations", quote: "The 1:1 portfolio review alone was worth the fee. I walked away with a case study I was actually proud to show.", rating: 5 },
  { studentName: "Suresh Pillai", courseName: "DevOps Engineering", quote: "Practical, no fluff. We built a real CI/CD pipeline in week 6 and I understood every piece of it.", rating: 5 },
  { studentName: "Neha Verma", courseName: "Digital Marketing & Performance Advertising", quote: "Running an actual ad campaign as part of the course gave me stories to tell in interviews, not just theory.", rating: 4 },
  { studentName: "Abhishek Rao", courseName: "Java Full Stack Development", quote: "The mock interviews at the end were tougher than my actual interview. I felt completely prepared.", rating: 5 },
];

const PLACEMENTS = [
  { studentName: "Meghana Reddy", company: "Innovate Softlabs", role: "Frontend Developer", batch: "MERN — Jan 2026" },
  { studentName: "Karthik Iyer", company: "CloudNine Systems", role: "Cloud Support Engineer", batch: "AWS — Nov 2025" },
  { studentName: "Divya Sharma", company: "DataWorks Analytics", role: "Junior Data Analyst", batch: "Data Science — Dec 2025" },
  { studentName: "Ritesh Gupta", company: "QAEdge Technologies", role: "QA Automation Engineer", batch: "Selenium — Oct 2025" },
  { studentName: "Ananya Joshi", company: "Pixel & Co Studio", role: "Product Designer", batch: "UI/UX — Jan 2026" },
  { studentName: "Suresh Pillai", company: "Nimbus Cloud Services", role: "DevOps Engineer", batch: "DevOps — Sep 2025" },
  { studentName: "Neha Verma", company: "GrowthLoop Media", role: "Performance Marketer", batch: "Digital Marketing — Dec 2025" },
  { studentName: "Abhishek Rao", company: "Verta Systems", role: "Java Developer", batch: "Java Full Stack — Nov 2025" },
  { studentName: "Pooja Nair", company: "Innovate Softlabs", role: "Business Analyst", batch: "BA Certification — Aug 2025" },
  { studentName: "Vishal Kumar", company: "SecureNet Labs", role: "SOC Analyst", batch: "Cybersecurity — Jul 2025" },
];

const BLOG_POSTS = [
  {
    title: "Top 20 Full Stack Developer Interview Questions (2026 Edition)",
    excerpt: "The questions we see most often in real interviews — with the reasoning interviewers are actually testing for.",
    content: "Full content coming soon. This is placeholder content seeded for the Talent Expert blog and will be replaced with the final article.",
    category: "interview-questions",
  },
  {
    title: "How to Choose Between Data Science and Data Analytics",
    excerpt: "Both fields work with data, but the day-to-day, skills, and career paths are more different than they look.",
    content: "Full content coming soon. This is placeholder content seeded for the Talent Expert blog and will be replaced with the final article.",
    category: "career-advice",
  },
  {
    title: "AWS vs Azure: Which Cloud Certification Should You Start With?",
    excerpt: "A practical comparison based on job postings, salary bands, and how each certification is actually tested.",
    content: "Full content coming soon. This is placeholder content seeded for the Talent Expert blog and will be replaced with the final article.",
    category: "cloud",
  },
  {
    title: "Manual Testing to Automation: A 90-Day Transition Plan",
    excerpt: "The exact sequence we recommend to testers who want to add automation skills without starting from zero.",
    content: "Full content coming soon. This is placeholder content seeded for the Talent Expert blog and will be replaced with the final article.",
    category: "career-advice",
  },
  {
    title: "5 Portfolio Mistakes That Cost Design Candidates the Interview",
    excerpt: "Hiring managers weigh in on what makes them scroll past a UI/UX portfolio in the first ten seconds.",
    content: "Full content coming soon. This is placeholder content seeded for the Talent Expert blog and will be replaced with the final article.",
    category: "design",
  },
  {
    title: "Top Selenium Interview Questions for Automation Testers",
    excerpt: "From locators to the Page Object Model — the questions that come up in almost every QA automation interview.",
    content: "Full content coming soon. This is placeholder content seeded for the Talent Expert blog and will be replaced with the final article.",
    category: "interview-questions",
  },
];

const BADGES = [
  {
    key: "first-enrollment",
    label: "First Step",
    description: "Enrolled in your first course.",
    icon: "Rocket",
    criteria: { type: "enrollmentsCount", threshold: 1 },
  },
  {
    key: "first-course-completed",
    label: "Course Finisher",
    description: "Completed your first course.",
    icon: "Award",
    criteria: { type: "coursesCompleted", threshold: 1 },
  },
  {
    key: "three-courses-completed",
    label: "Triple Threat",
    description: "Completed three courses.",
    icon: "Trophy",
    criteria: { type: "coursesCompleted", threshold: 3 },
  },
  {
    key: "twenty-five-hours",
    label: "Dedicated Learner",
    description: "Logged 25 hours of learning.",
    icon: "Clock",
    criteria: { type: "hoursLogged", threshold: 25 },
  },
  {
    key: "hundred-hours",
    label: "Marathon Learner",
    description: "Logged 100 hours of learning.",
    icon: "Flame",
    criteria: { type: "hoursLogged", threshold: 100 },
  },
  {
    key: "first-test-passed",
    label: "Quiz Whiz",
    description: "Passed your first test with a score of 60% or higher.",
    icon: "Sparkles",
    criteria: { type: "testsPassed", threshold: 1 },
  },
];

const JOB_OPENINGS = [
  { title: "Junior Frontend Developer", location: "Hyderabad (Hybrid)", experience: "0–1 years", description: "Looking for a MERN-trained developer to join our internal tools team." },
  { title: "QA Automation Engineer", location: "Remote", experience: "1–3 years", description: "Selenium + API testing experience preferred. Fresh automation-certified candidates welcome." },
  { title: "Data Analyst", location: "Hyderabad (On-site)", experience: "0–2 years", description: "SQL and Power BI skills required. Great fit for recent Data Analytics graduates." },
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (const name of CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categoryMap.set(name, cat.id);
  }

  console.log("Seeding trainers...");
  const trainerMap = new Map<string, string>();
  for (const t of TRAINERS) {
    const trainer = await db.trainer.upsert({
      where: { slug: slugify(t.name) },
      update: {},
      create: {
        name: t.name,
        slug: slugify(t.name),
        bio: t.bio,
        experienceYears: t.experienceYears,
        expertise: t.expertise,
      },
    });
    trainerMap.set(t.name, trainer.id);
  }

  console.log("Seeding courses...");
  const courseIds: { id: string; title: string }[] = [];
  for (const c of COURSES) {
    const course = await db.course.upsert({
      where: { slug: slugify(c.title) },
      update: {},
      create: {
        title: c.title,
        slug: slugify(c.title),
        shortDescription: c.shortDescription,
        description: c.description,
        categoryId: categoryMap.get(c.category),
        trainerId: trainerMap.get(c.trainer),
        modes: c.modes,
        level: c.level,
        durationText: c.durationText,
        regularFee: c.regularFee,
        featured: c.featured ?? false,
        highlights: c.highlights,
        faqs: c.faqs,
        status: "PUBLISHED",
        modules: {
          create: c.modules.map((m, mi) => ({
            title: m.title,
            order: mi,
            topics: { create: m.topics.map((t, ti) => ({ title: t, order: ti })) },
          })),
        },
      },
    });
    courseIds.push({ id: course.id, title: course.title });
  }

  console.log("Seeding batches...");
  const modesByCourse: Record<string, CourseSeed> = Object.fromEntries(
    COURSES.map((c) => [slugify(c.title), c])
  );
  let batchOffset = 3;
  for (const { id, title } of courseIds) {
    const seed = modesByCourse[slugify(title)];
    const mode = seed.modes[0];
    const trainerId = trainerMap.get(seed.trainer);
    const startDate = daysFromNow(batchOffset);
    batchOffset += 5;

    const batch = await db.batch.create({
      data: {
        courseId: id,
        startDate,
        startTime: "7:00 PM - 9:00 PM IST",
        mode,
        trainerId,
        durationText: seed.durationText,
        seatTotal: 30,
        seatsFilled: Math.floor(Math.random() * 18),
        fee: seed.regularFee,
        contactNumber: "+91 90000 00000",
        status: "UPCOMING",
      },
    });

    if (courseIds.indexOf({ id, title }) === -1 && Math.random() > 0.4) {
      // no-op placeholder kept simple
    }

    // give roughly half the batches an early-bird offer
    if (Math.random() > 0.45) {
      await db.offer.create({
        data: {
          batchId: batch.id,
          label: "Early-bird",
          type: "PERCENT",
          value: 15,
          startAt: daysFromNow(-5),
          endAt: daysFromNow(10),
        },
      });
    }
  }

  console.log("Seeding testimonials...");
  for (const t of TESTIMONIALS) {
    await db.testimonial.create({ data: t });
  }

  console.log("Seeding placements...");
  for (const p of PLACEMENTS) {
    await db.placement.create({ data: p });
  }

  console.log("Seeding blog posts...");
  for (const p of BLOG_POSTS) {
    await db.blogPost.upsert({
      where: { slug: slugify(p.title) },
      update: {},
      create: {
        title: p.title,
        slug: slugify(p.title),
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seeding badges...");
  for (const b of BADGES) {
    await db.badge.upsert({
      where: { key: b.key },
      update: {},
      create: b,
    });
  }

  console.log("Seeding job openings...");
  for (const j of JOB_OPENINGS) {
    await db.jobOpening.create({ data: j });
  }

  console.log("Seeding announcement...");
  await db.announcement.create({
    data: {
      title: "New batches open",
      body: "Early-bird pricing is live on select courses — enrol before seats fill up.",
      audience: "BOTH",
      startAt: daysFromNow(-1),
      endAt: daysFromNow(30),
      active: true,
    },
  });

  console.log("Seeding admin user...");
  await db.adminUser.upsert({
    where: { email: "admin@talentexpertedu.com" },
    update: {},
    create: {
      name: "Talent Expert Admin",
      email: "admin@talentexpertedu.com",
      passwordHash: await hashPassword("ChangeMe123!"),
      role: "SUPER_ADMIN",
    },
  });

  console.log("Seeding a demo student...");
  const demoStudent = await db.student.upsert({
    where: { email: "demo.student@talentexpertedu.com" },
    update: {},
    create: {
      name: "Demo Student",
      email: "demo.student@talentexpertedu.com",
      phone: "+91 98765 43210",
      passwordHash: await hashPassword("Student123!"),
      mustChangePassword: false,
      bio: "Aspiring full-stack developer, career-switching from customer support into tech.",
    },
  });

  const allBatches = await db.batch.findMany({ orderBy: { createdAt: "asc" }, take: 2 });
  const [firstBatch, secondBatch] = allBatches;

  if (firstBatch) {
    const existingEnrollment = await db.enrollment.findFirst({
      where: { studentId: demoStudent.id, batchId: firstBatch.id },
    });
    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          enrollmentCode: "HT-2608-0001",
          studentId: demoStudent.id,
          batchId: firstBatch.id,
          amountDue: firstBatch.fee,
          amountPaid: firstBatch.fee,
          status: "PAID",
          portalUnlocked: true,
          hoursLogged: 18,
        },
      });
      await db.classSession.create({
        data: {
          batchId: firstBatch.id,
          topic: "Orientation & environment setup",
          date: daysFromNow(2),
          time: "7:00 PM IST",
          joinUrl: "https://meet.google.com/example-demo-link",
        },
      });
    }
  }

  if (secondBatch) {
    const existingSecond = await db.enrollment.findFirst({
      where: { studentId: demoStudent.id, batchId: secondBatch.id },
    });
    if (!existingSecond) {
      const completedEnrollment = await db.enrollment.create({
        data: {
          enrollmentCode: "HT-2607-0002",
          studentId: demoStudent.id,
          batchId: secondBatch.id,
          amountDue: secondBatch.fee,
          amountPaid: secondBatch.fee,
          status: "PAID",
          portalUnlocked: true,
          hoursLogged: 32,
          completedAt: daysFromNow(-3),
        },
      });
      await db.testAttempt.create({
        data: {
          enrollmentId: completedEnrollment.id,
          title: "Module 3 Assessment",
          scorePercent: 84,
        },
      });
    }
  }

  console.log("Awarding demo badges...");
  const badgeKeysToAward = ["first-enrollment", "first-course-completed", "first-test-passed"];
  for (const key of badgeKeysToAward) {
    const badge = await db.badge.findUnique({ where: { key } });
    if (badge) {
      await db.studentBadge.upsert({
        where: { studentId_badgeId: { studentId: demoStudent.id, badgeId: badge.id } },
        update: {},
        create: { studentId: demoStudent.id, badgeId: badge.id },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
