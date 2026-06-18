import mongoose from 'mongoose';

const SubNavItemSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 11) },
  label: { type: String, required: true },
  type: { type: String, enum: ['cms_page', 'product_category', 'custom_url', 'external_url'], default: 'custom_url' },
  value: { type: String, default: '' },
  openInNewTab: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { _id: false });

const NavItemSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 11) },
  label: { type: String, required: true },
  type: { type: String, enum: ['cms_page', 'page', 'product', 'product_category', 'custom_url', 'external_url', 'mega_menu', 'dropdown_category', 'dropdown_product', 'dropdown_custom'], default: 'custom_url' },
  value: { type: String, default: '' },
  href: { type: String, default: '' },
  openInNewTab: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  hasMegaMenu: { type: Boolean, default: false }, // legacy field
  dropdownType: { type: String, enum: ['none', 'simple', 'mega'], default: 'none' }, // legacy field
  subItems: [SubNavItemSchema],
  megaCategoryIds: [String],
  dropdownCategoryIds: [String],
  dropdownProductIds: [String],
  order: { type: Number, default: 0 }
}, { strict: false, _id: false });

const SocialLinkSchema = new mongoose.Schema({
  platform: { type: String },
  url: { type: String, default: '' },
  enabled: { type: Boolean, default: false }
}, { _id: false });

const FooterCustomLinkSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 11) },
  label: { type: String, default: '' },
  url: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: false });

const SiteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },

  // ─── General / Brand ──────────────────────────────────────
  brand: {
    name: String,
    tagline: String,
    description: String,
    footerBrandName: String,      // animated brand name in footer
    copyrightText: String,        // e.g. "PAIRO — ALL RIGHTS RESERVED © 2026"
    privacyUrl: String,
    termsUrl: String,
  },

  // ─── Header Configuration ──────────────────────────────────
  headerConfig: {
    logoUrl: { type: String, default: '' },       // dynamic logo from Media Library
    navItems: [NavItemSchema],                     // full navigation menu
    megaCategoryIds: [String],                     // selected category slugs for mega menu
    topOffers: [String],                           // rotating offer messages in top bar
  },

  // ─── Footer Configuration ──────────────────────────────────
  footerConfig: {
    logoUrl: { type: String, default: '' },        // dynamic footer logo
    // Column 1 — Newsletter
    newsletterHeading: { type: String, default: 'Elite List' },
    newsletterDescription: { type: String, default: '' },
    newsletterPlaceholder: { type: String, default: 'JOIN THE LIST' },
    newsletterButtonText: { type: String, default: 'Subscribe' },
    // Column 2 — Categories
    footerCategoryIds: [String],                   // ordered list of category slugs
    // Column 3 — Blog Posts
    footerBlogIds: [String],                       // ordered list of blog post IDs
    footerBlogHeading: { type: String, default: 'Blog' },
    // Column 4 — Custom Links
    footerCustomLinks: [FooterCustomLinkSchema],
    footerCustomLinksHeading: { type: String, default: 'Information' },
  },

  // ─── Social Links ──────────────────────────────────────────
  socialLinks: [SocialLinkSchema],

  // ─── Store Commerce Settings ───────────────────────────────────────────────
  // Global defaults used by the shipping engine, tax service, and checkout
  commerce: {
    storeCurrency: { type: String, default: 'PKR' },              // ISO 4217 currency code
    weightUnit:    { type: String, enum: ['kg', 'lb'], default: 'kg' },
    dimensionUnit: { type: String, enum: ['cm', 'in'], default: 'cm' }
  },

  // ─── Legacy fields kept for backward compatibility ─────────
  navigation: {
    offers: [String],
    links: [{ name: String, href: String, hasMegaMenu: Boolean }]
  },
  hero: {
    slides: [{ id: Number, title: String, subtitle: String, image: String, buttonText: String, link: String }],
    labels: Object,
    stats: [{ value: String, label: String }],
    brands: [String]
  },
  categories: {
    title: String,
    label: String,
    viewAll: String,
    items: [{ name: String, slug: String, image: String, className: String }]
  },
  footer: {
    newsletterTitle: String,
    sections: [{ title: String, links: [{ name: String, href: String }] }]
  },
  products: {
    labels: Object
  },
  testimonials: {
    title: String,
    label: String,
    buttonText: String,
    verifiedLabel: String,
    perspectiveLabel: String,
    reviews: [Object]
  },
  blogs: {
    title: String,
    label: String,
    readMore: String,
    featuredProduct: Object,
    posts: [Object]
  }
}, { timestamps: true, strict: false });

delete mongoose.models.SiteConfig;
export default mongoose.model('SiteConfig', SiteConfigSchema);
