import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  isDeleted: { type: Boolean, default: false },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  type: { type: String, enum: ['product', 'blog'], default: 'product' },
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

CategorySchema.index({ slug: 1, type: 1 }, { unique: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function run() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  await mongoose.connect(MONGODB_URI);
  
  const cat = await Category.create({ name: "script_test_blog", slug: "script-test-blog", type: "blog" });
  console.log("Created:", cat.toJSON());
  process.exit(0);
}

run();
