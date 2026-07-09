import { normalizePath } from "./redirect-resolver";

const DEFAULT_SITE_TITLE = "Pairo | Premium Handcrafted Shearling Jackets";
const DEFAULT_SITE_DESC = "Experience the ultimate warmth and luxury with Pairo's handcrafted shearling jackets.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pairolifestyle.com";

/**
 * Sanitizes input strings to prevent HTML tag or script injection in metadata.
 */
export function sanitizeSEOString(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // Remove script tags
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .replace(/["']/g, "") // Remove quotes to prevent breaking meta attributes
    .trim();
}

/**
 * Validates whether a string is a valid JSON-LD structure.
 * Returns parsed object or null if invalid.
 */
export function validateAndParseJsonLd(jsonString) {
  if (!jsonString || typeof jsonString !== "string") return null;
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === "object") {
      // Basic schema.org validation
      if (!parsed["@context"]) {
        parsed["@context"] = "https://schema.org";
      }
      return parsed;
    }
  } catch (e) {
    console.error("[SEO Resolver] Invalid JSON-LD schema:", e.message);
  }
  return null;
}

/**
 * Safely stringifies and escapes JSON-LD objects to prevent script breakout injections.
 */
export function escapeJsonLd(data) {
  if (!data) return "";
  const jsonString = typeof data === "string" ? data : JSON.stringify(data);
  return jsonString
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f");
}

/**
 * Normalizes competitor brand references and URLs to Pairo.
 */
export function cleanCompetitorDetails(jsonLd) {
  if (!jsonLd) return jsonLd;
  let str = typeof jsonLd === "string" ? jsonLd : JSON.stringify(jsonLd);

  // Replace competitor names with Pairo Lifestyle
  str = str
    .replace(/Excellent Leather Shop/gi, "Pairo Lifestyle")
    .replace(/Prime Jackets/gi, "Pairo Lifestyle")
    .replace(/Jackets Junction/gi, "Pairo Lifestyle")
    .replace(/The Jacket Maker/gi, "Pairo Lifestyle")
    .replace(/The Jacket M/gi, "Pairo Lifestyle");

  // Replace competitor URLs with Pairo Lifestyle URL
  str = str
    .replace(/https?:\/\/excellentleathershop\.com/gi, "https://pairolifestyle.com")
    .replace(/https?:\/\/primejackets\.com/gi, "https://pairolifestyle.com")
    .replace(/https?:\/\/jacketsjunction\.com/gi, "https://pairolifestyle.com")
    .replace(/https?:\/\/thejacketmaker\.com/gi, "https://pairolifestyle.com");

  try {
    return JSON.parse(str);
  } catch (e) {
    return jsonLd;
  }
}

/**
 * Normalizes a URL to ensure uniqueness.
 */
export function normalizeCanonicalUrl(url) {
  if (!url) return SITE_URL;
  try {
    const absoluteUrl = url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    const urlObj = new URL(absoluteUrl);
    
    const cleanParams = new URLSearchParams();
    const category = urlObj.searchParams.get("category");
    const type = urlObj.searchParams.get("type");
    if (category) cleanParams.set("category", category.toLowerCase());
    if (type) cleanParams.set("type", type.toLowerCase());
    
    let pathname = urlObj.pathname.toLowerCase().replace(/\/+/g, "/");
    if (pathname.endsWith("/") && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    
    const queryString = cleanParams.toString();
    const relativePart = pathname + (queryString ? `?${queryString}` : "");
    
    return `${SITE_URL}${relativePart}`;
  } catch (e) {
    console.error("[SEO Resolver] Error normalizing canonical URL:", e.message);
    return url;
  }
}

/**
 * Centrally resolves SEO metadata for storefront routes (Asynchronous).
 */
export async function resolveSEOMetadata(options = {}) {
  const {
    entity = {},
    type = "page",
    fallbackTitle = DEFAULT_SITE_TITLE,
    fallbackDesc = DEFAULT_SITE_DESC,
    fallbackImage = "/hero-image.png",
    path = "",
    reviews = []
  } = options;

  const seo = entity.seo || {};

  // 1. Core Titles and Descriptions (Sanitized)
  const metaTitle = sanitizeSEOString(seo.title || entity.name || entity.title || fallbackTitle);
  const metaDescription = sanitizeSEOString(seo.description || entity.shortDescription || entity.excerpt || fallbackDesc);

  // 2. Canonical URL uniqueness & automatic fallback generation
  let canonical = seo.canonicalUrl ? seo.canonicalUrl.trim() : "";
  if (!canonical) {
    if (path) {
      canonical = path;
    } else if (type === "product" && entity.slug) {
      canonical = `/product/${entity.slug}`;
    } else if (type === "blog" && entity.slug) {
      canonical = `/blog/${entity.slug}`;
    } else if (type === "category" && entity.slug) {
      canonical = `/${entity.slug}`;
    } else if (type === "page" && entity.slug) {
      canonical = `/${entity.slug}`;
    } else {
      canonical = "/";
    }
  }
  canonical = normalizeCanonicalUrl(canonical);

  // 3. Robots controls (Forced noindex, nofollow globally per user request)
  const noIndex = true;
  const noFollow = true;

  // 4. OpenGraph and Twitter image fallback hierarchy
  const entityFeaturedImage = entity.image || (Array.isArray(entity.images) && entity.images[0]) || null;
  
  const ogImgUrlRaw = seo.ogImage || entityFeaturedImage || fallbackImage;
  const ogImgUrl = ogImgUrlRaw.startsWith("http") ? ogImgUrlRaw : `${SITE_URL}${ogImgUrlRaw}`;

  const twImgUrlRaw = seo.twitterImage || seo.ogImage || entityFeaturedImage || fallbackImage;
  const twImgUrl = twImgUrlRaw.startsWith("http") ? twImgUrlRaw : `${SITE_URL}${twImgUrlRaw}`;

  // 5. OpenGraph Tags
  const openGraph = {
    title: sanitizeSEOString(seo.ogTitle || metaTitle),
    description: sanitizeSEOString(seo.ogDescription || metaDescription),
    url: canonical,
    siteName: "Pairo Store",
    images: [{ url: ogImgUrl }],
    locale: "en_US",
    type: type === "blog" ? "article" : "website",
  };

  // 6. Twitter Card Tags
  const twitter = {
    card: "summary_large_image",
    title: sanitizeSEOString(seo.twitterTitle || seo.ogTitle || metaTitle),
    description: sanitizeSEOString(seo.twitterDescription || seo.ogDescription || metaDescription),
    images: [twImgUrl],
    site: "@pairostore",
    creator: "@pairostore",
  };

  // 7. Structured Data Assembly
  let structuredDataJson = null;
  const parsedJsonLd = validateAndParseJsonLd(seo.structuredData);
  if (parsedJsonLd) {
    structuredDataJson = cleanCompetitorDetails(parsedJsonLd);
  } else {
    // Generate fallback schemas
    if (type === "product" && entity.name) {
      const { getProductPrimaryCategorySlug } = require("./routes");
      const categorySlugRaw = getProductPrimaryCategorySlug(entity);
      const categorySlug = categorySlugRaw === 'uncategorized' ? 'shop' : categorySlugRaw;
      
      let categoryName = "Products";
      if (entity.primaryCategory && typeof entity.primaryCategory === 'object') {
         categoryName = entity.primaryCategory.name || "Products";
      } else if (entity.categories && entity.categories.length > 0) {
         const firstCat = entity.categories[0];
         if (firstCat && typeof firstCat === 'object') {
            categoryName = firstCat.name || "Products";
         }
      }

      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE_URL}${canonical}#product`,
        "name": entity.name,
        "description": entity.shortDescription || metaDescription,
        "image": ogImgUrl,
        "url": `${SITE_URL}${canonical}`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD",
          "price": entity.price || 0,
          "availability": entity.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      };

      if (entity.reviewCount > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": entity.rating || 0,
          "bestRating": "5",
          "worstRating": "1",
          "reviewCount": entity.reviewCount
        };
      }

      if (reviews && Array.isArray(reviews) && reviews.length > 0) {
        const approvedReviews = reviews
          .filter(r => r.status === "Approved" && !r.isDeleted)
          .slice(0, 5);

        if (approvedReviews.length > 0) {
          productSchema.review = approvedReviews.map(r => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": r.customerName || "Anonymous"
            },
            "datePublished": r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            "reviewBody": r.comment || "",
            "name": r.title || "",
            "reviewRating": {
              "@type": "Rating",
              "bestRating": "5",
              "ratingValue": r.rating,
              "worstRating": "1"
            }
          }));
        }
      }

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `${SITE_URL}/${categorySlug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": entity.name,
            "item": `${SITE_URL}${canonical}`
          }
        ]
      };

      // Query ProductQuestions asynchronously for FAQ Schema
      let faqSchema = null;
      try {
        const mongoose = require("mongoose");
        if (mongoose.connection && mongoose.connection.readyState === 1) {
          let ProductQuestion;
          try {
            ProductQuestion = mongoose.model("ProductQuestion");
          } catch {
            ProductQuestion = require("../models/ProductQuestion").default || require("../models/ProductQuestion");
          }

          const questions = await ProductQuestion.find({
            productId: entity._id || entity.id,
            status: "Approved",
            isDeleted: false
          }).lean();

          const qaList = questions
            .filter(q => q.replies && q.replies.length > 0)
            .map(q => {
              const firstStaffReply = q.replies.find(r => r.isStaff || r.isAdmin);
              if (firstStaffReply) {
                return {
                  "@type": "Question",
                  "name": q.questionText || q.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": firstStaffReply.replyText || firstStaffReply.text
                  }
                };
              }
              return null;
            })
            .filter(Boolean);

          if (qaList.length > 0) {
            faqSchema = {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": qaList
            };
          }
        }
      } catch (e) {
        console.error("[SEO Resolver] Failed to load Product FAQs:", e.message);
      }

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [productSchema, breadcrumbSchema]
      };

      if (faqSchema) {
        structuredDataJson["@graph"].push(faqSchema);
      }
    } else if (type === "category" && entity.name) {
      const categorySchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${canonical}#collection`,
        "name": entity.name,
        "description": entity.description || metaDescription,
        "url": `${SITE_URL}${canonical}`
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": entity.name,
            "item": `${SITE_URL}${canonical}`
          }
        ]
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [categorySchema, breadcrumbSchema]
      };
    } else if (type === "blog" && entity.title) {
      structuredDataJson = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": entity.title,
        "description": entity.excerpt || metaDescription,
        "image": ogImgUrl,
        "datePublished": entity.createdAt,
        "author": {
          "@type": "Person",
          "name": entity.author || "Pairo Studio"
        }
      };
    } else if (type === "home" || path === "/" || path === "/home") {
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Pairo Lifestyle",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "url": `${SITE_URL}/assets/pairo.webp`,
          "caption": "Pairo Lifestyle"
        },
        "sameAs": [
          "https://www.instagram.com/pairolifestyle",
          "https://www.facebook.com/pairolifestyle"
        ]
      };

      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "name": "Pairo Lifestyle",
        "url": SITE_URL,
        "publisher": {
          "@id": `${SITE_URL}/#organization`
        }
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [orgSchema, websiteSchema]
      };
    } else if (type === "shop" || path === "/shop") {
      const shopSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/shop#collection`,
        "name": "Shop All Handcrafted Shearling Jackets",
        "description": "Browse the complete archival collection of Pairo's premium shearling and leather jackets.",
        "url": `${SITE_URL}/shop`
      };
      
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${SITE_URL}/shop` }
        ]
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [shopSchema, breadcrumbSchema]
      };
    } else if (type === "blog_list" || path === "/blog") {
      const blogListSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog#collection`,
        "name": "Editorial Journal - Pairo Lifestyle",
        "description": "Explore the stories, craftsmanship, and heritage behind Pairo's archival shearling collection.",
        "url": `${SITE_URL}/blog`
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Journal", "item": `${SITE_URL}/blog` }
        ]
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [blogListSchema, breadcrumbSchema]
      };
    } else if (type === "contact" || path === "/contact") {
      const contactSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact#webpage`,
        "name": "Contact Pairo - Direct Concierge Line",
        "description": "Get in touch with Pairo Lifestyle atelier for bespoke fittings, sizing advice, and order inquiries.",
        "url": `${SITE_URL}/contact`
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${SITE_URL}/contact` }
        ]
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [contactSchema, breadcrumbSchema]
      };
    } else if (type === "about" || path === "/about") {
      const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#webpage`,
        "name": "About Pairo Lifestyle - Artisanal Shearling Heritage",
        "description": "Discover Pairo's journey in crafting the future of modern elegance, bridging heritage craftsmanship and contemporary design.",
        "url": `${SITE_URL}/about`
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "About", "item": `${SITE_URL}/about` }
        ]
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [aboutSchema, breadcrumbSchema]
      };
    } else if (type === "faq" || path === "/faq") {
      const faqPageSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Pairo Lifestyle's estimated delivery time?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our handcrafted pieces are made-to-order. The estimated delivery time is between 15–20 working days."
            }
          },
          {
            "@type": "Question",
            "name": "Do you support custom/bespoke configurations?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we support extensive bespoke modifications including custom leather types, colors, hardware finishes, fur accents, and branding uploads."
            }
          }
        ]
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [faqPageSchema]
      };
    } else if (type === "search") {
      const searchSchema = {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": "Search Results",
        "url": `${SITE_URL}/search`
      };

      structuredDataJson = {
        "@context": "https://schema.org",
        "@graph": [searchSchema]
      };
    }
  }

  // Next.js App Router metadata format
  const metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonical,
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
      }
    },
    openGraph,
    twitter,
  };

  return {
    metadata,
    structuredData: structuredDataJson
  };
}
