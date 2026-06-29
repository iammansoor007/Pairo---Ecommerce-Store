import { permanentRedirect } from "next/navigation";
import { checkAndApplyRedirect } from "@/lib/redirect-resolver";
import dbConnect from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
  const { slug, productSlug } = await params;
  const resolvedSearchParams = await searchParams;

  const currentPath = `/${slug}/${productSlug}`;
  await checkAndApplyRedirect(currentPath);

  const paramsQuery = new URLSearchParams(resolvedSearchParams);
  const queryString = paramsQuery.toString();

  const destUrl = queryString 
    ? `/product/${productSlug}?${queryString}`
    : `/product/${productSlug}`;

  permanentRedirect(destUrl);
}

export default async function NestedProductRedirectPage({ params, searchParams }) {
  const { slug, productSlug } = await params;
  const resolvedSearchParams = await searchParams;

  const currentPath = `/${slug}/${productSlug}`;
  await checkAndApplyRedirect(currentPath);

  const paramsQuery = new URLSearchParams(resolvedSearchParams);
  const queryString = paramsQuery.toString();

  const destUrl = queryString 
    ? `/product/${productSlug}?${queryString}`
    : `/product/${productSlug}`;

  permanentRedirect(destUrl);
}
