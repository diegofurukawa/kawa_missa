import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    });

    const dynamicRoutes: MetadataRoute.Sitemap = tenants.map((tenant) => ({
      url: `${baseUrl}/dashboard/public?tenant=${tenant.id}`,
      lastModified: tenant.createdAt,
      changeFrequency: "daily",
      priority: 0.9,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
