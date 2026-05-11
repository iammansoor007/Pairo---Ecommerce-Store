import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import SiteConfig from '../models/SiteConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteData = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/data.json'), 'utf-8'));

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // Clear existing data
    await Product.deleteMany({});
    await SiteConfig.deleteMany({});

    // Seed Products
    const productsToSeed = [
      ...siteData.products.newArrivals.map(p => ({ ...p, type: 'newArrival' })),
      ...siteData.products.topSelling.map(p => ({ ...p, type: 'topSelling' }))
    ];

    await Product.insertMany(productsToSeed);
    console.log('Products seeded.');

    // Seed SiteConfig
    const config = {
      brand: siteData.brand,
      navigation: siteData.navigation,
      hero: siteData.hero,
      categories: siteData.categories,
      footer: siteData.footer,
      products: { labels: siteData.products.labels },
      testimonials: siteData.testimonials,
      blogs: siteData.blogs
    };

    await SiteConfig.create(config);
    console.log('Site config seeded.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
