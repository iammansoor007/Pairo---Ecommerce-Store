import mongoose from 'mongoose';

const SiteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },
  brand: {
    name: String,
    tagline: String,
    description: String
  },
  navigation: {
    offers: [String],
    links: [{ name: String, href: String, hasMegaMenu: Boolean }]
  },
  hero: {
    slides: [{ id: Number, title: String, subtitle: String, image: String, buttonText: String }],
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
}, { timestamps: true });

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);
