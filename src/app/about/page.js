import dbConnect from "@/lib/db";
import Page from "@/models/Page";
import SectionRenderer from "@/components/common/SectionRenderer";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  await dbConnect();
  const page = await Page.findOne({ slug: "about" }).lean();
  if (!page) return { title: "About Us" };

  return {
    title: page.seo?.title || "About Us",
    description: page.seo?.description || "Quality Jackets Made to Last",
    openGraph: {
      title: page.seo?.ogTitle || page.seo?.title,
      description: page.seo?.ogDescription || page.seo?.description,
      images: page.seo?.ogImage ? [{ url: page.seo.ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo?.twitterTitle || page.seo?.title,
      description: page.seo?.twitterDescription || page.seo?.description,
      images: [page.seo?.twitterImage || page.seo?.ogImage].filter(Boolean),
    },
  };
}

export default async function AboutPage() {
  await dbConnect();
  const page = await Page.findOne({ slug: "about", status: "Published" }).lean();

  if (!page) {
    notFound();
  }

  return (
    <main className="bg-white">
      <SectionRenderer sections={page.sections} />
    </main>
  );
}
