import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://studylinker.academy";

  const routes = [
    "",
    "/parents",
    "/parents/how-it-works",
    "/parents/find-teachers",
    "/parents/curriculum",
    "/parents/reports",
    "/portal/parent",
    "/teachers",
    "/teachers/find-students",
    "/teachers/apply",
    "/teachers/application-process",
    "/teachers/benefits",
    "/teachers/resources",
    "/portal/teacher",
    "/subjects",
    "/subjects/primary",
    "/subjects/middle",
    "/subjects/secondary",
    "/subjects/o-a-level",
    "/about",
    "/about/story",
    "/about/quality",
    "/blog",
    "/contact",
    "/careers",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/refund",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route.includes("/parents") || route.includes("/teachers") ? 0.9 : 0.8,
  }));
}

