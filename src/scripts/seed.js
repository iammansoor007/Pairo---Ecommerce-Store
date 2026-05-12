const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Using the STABLE standard connection string
const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";

const CategorySchema = new mongoose.Schema({ name: String, slug: String, description: String, image: String, isDeleted: { type: Boolean, default: false } });
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, shortDescription: String, description: String,
  price: Number, compareAtPrice: Number, sku: String, stock: Number, manageStock: { type: Boolean, default: true },
  status: { type: String, default: 'Published' }, type: String, image: String, images: [String],
  variants: [{ name: String, values: [String] }], variantCombinations: [{ title: String, price: Number, stock: Number, sku: String }],
  narrative: { title: String, content: String }, categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  isDeleted: { type: Boolean, default: false }, rating: { type: Number, default: 5 }
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear existing products to avoid duplicates
    console.log('Clearing old products...');
    await Product.deleteMany({});
    
    // Get Categories
    const categories = await Category.find({});
    const jacketId = categories.find(c => c.slug === 'jackets')?._id;
    const vestId = categories.find(c => c.slug === 'vests')?._id;
    const accessoryId = categories.find(c => c.slug === 'accessories')?._id;

    console.log('Seeding 12 Premium Products...');
    
    const dummyProducts = [
      {
        name: "A-1 Shearling Flight Jacket",
        slug: "a1-shearling-flight",
        shortDescription: "The definitive pilot's jacket, reframed for the modern minimalist.",
        description: "<p>Handcrafted from premium Spanish shearling, the A-1 represents the pinnacle of Pairo design.</p>",
        price: 850,
        compareAtPrice: 1200,
        sku: "PAI-A1-01",
        stock: 12,
        type: "newArrival",
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop",
        categories: [jacketId],
        variants: [{ name: "Size", values: ["S", "M", "L", "XL"] }, { name: "Color", values: ["Cognac", "Black"] }]
      },
      {
        name: "Noir Biker Jacket",
        slug: "noir-biker-jacket",
        shortDescription: "Italian grain leather with custom matte-black hardware.",
        description: "<p>A timeless silhouette engineered for the city. Featuring reinforced shoulders and premium silk lining.</p>",
        price: 650,
        compareAtPrice: 850,
        sku: "PAI-BK-02",
        stock: 8,
        type: "topSelling",
        image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1000&auto=format&fit=crop",
        categories: [jacketId],
        variants: [{ name: "Size", values: ["M", "L", "XL"] }]
      },
      {
        name: "Desert Suede Vest",
        slug: "desert-suede-vest",
        shortDescription: "Lightweight, versatile, and expertly tailored.",
        description: "<p>The perfect layering piece. Crafted from ethically sourced goat suede with a water-resistant finish.</p>",
        price: 320,
        sku: "PAI-VST-03",
        stock: 20,
        type: "newArrival",
        image: "https://images.unsplash.com/photo-1620012253585-456c7bc7b9dd?q=80&w=1000&auto=format&fit=crop",
        categories: [vestId],
        variants: [{ name: "Size", values: ["S", "M", "L"] }]
      },
      {
        name: "Heritage Leather Weekend Bag",
        slug: "heritage-weekend-bag",
        shortDescription: "Spacious, durable, and gets better with age.",
        description: "<p>Vegetable-tanned leather with solid brass hardware. Built to last a lifetime of travels.</p>",
        price: 420,
        compareAtPrice: 550,
        sku: "PAI-ACC-04",
        stock: 5,
        type: "topSelling",
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop",
        categories: [accessoryId]
      },
      {
        name: "Cognac Shearling Gilet",
        slug: "cognac-shearling-gilet",
        shortDescription: "Ultra-warm shearling vest with a rugged finish.",
        description: "<p>Designed for the outdoors. Thick shearling lining with a distressed leather exterior.</p>",
        price: 380,
        sku: "PAI-VST-05",
        stock: 15,
        type: "newArrival",
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop",
        categories: [vestId]
      },
      {
        name: "Midnight Suede Jacket",
        slug: "midnight-suede-jacket",
        shortDescription: "Deep navy suede in a classic trucker silhouette.",
        description: "<p>A sophisticated take on the workwear classic. Brushed nickel buttons and hidden interior pockets.</p>",
        price: 520,
        sku: "PAI-JKT-06",
        stock: 10,
        type: "topSelling",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
        categories: [jacketId]
      },
      {
         name: "Minimalist Card Holder",
         slug: "minimalist-card-holder",
         shortDescription: "Slim, secure, and crafted from full-grain leather.",
         description: "<p>RFID protection meets Pairo minimalism. Fits up to 6 cards and folded cash.</p>",
         price: 65,
         sku: "PAI-ACC-07",
         stock: 50,
         image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
         categories: [accessoryId]
      },
      {
         name: "Arctic Parka with Shearling",
         slug: "arctic-parka",
         shortDescription: "Our warmest jacket yet. Built for extreme conditions.",
         description: "<p>Waterproof shell with a full shearling-lined hood and body. Rated for -20°C.</p>",
         price: 1100,
         compareAtPrice: 1500,
         sku: "PAI-PRK-08",
         stock: 5,
         type: "newArrival",
         image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1000&auto=format&fit=crop",
         categories: [jacketId]
      },
      {
         name: "Classic Leather Belt",
         slug: "classic-leather-belt",
         shortDescription: "4mm thick bridle leather with a stainless steel buckle.",
         description: "<p>The only belt you'll ever need. Hand-burnished edges and a timeless width.</p>",
         price: 85,
         sku: "PAI-ACC-09",
         stock: 40,
         image: "https://images.unsplash.com/photo-1554992251-ce93309a9042?q=80&w=1000&auto=format&fit=crop",
         categories: [accessoryId]
      },
      {
         name: "Vintage Aviator Jacket",
         slug: "vintage-aviator",
         shortDescription: "Inspired by the 1940s originals. Distressed and detailed.",
         description: "<p>Heavyweight shearling with a cracked wax finish. Authentic military specifications.</p>",
         price: 950,
         sku: "PAI-AV-10",
         stock: 7,
         type: "topSelling",
         image: "https://images.unsplash.com/photo-1520975954732-35dd2229969e?q=80&w=1000&auto=format&fit=crop",
         categories: [jacketId]
      },
      {
         name: "Sleek Chelsea Vest",
         slug: "sleek-chelsea-vest",
         shortDescription: "Polished leather front with a wool-blend back.",
         description: "<p>The ultimate office-to-evening layer. Modern fit and breathable construction.</p>",
         price: 290,
         sku: "PAI-VST-11",
         stock: 18,
         image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
         categories: [vestId]
      },
      {
         name: "Utility Overshirt",
         slug: "utility-overshirt",
         shortDescription: "Heavy cotton drill with leather pocket details.",
         description: "<p>A rugged transitional piece. Featuring reinforced elbows and custom Pairo studs.</p>",
         price: 210,
         sku: "PAI-UT-12",
         stock: 22,
         image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=1000&auto=format&fit=crop",
         categories: [jacketId]
      }
    ];

    await Product.insertMany(dummyProducts);
    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
