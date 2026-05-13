const mongoose = require('mongoose');

async function testFetch() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: String,
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
    }));
    const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({
      title: String,
      category: String
    }));

    const p = await Product.findOne({ categories: { $exists: true, $not: { $size: 0 } } }).lean();
    console.log("Product categories:", p ? p.categories : 'none');
    
    const b = await Blog.findOne({ category: { $ne: null } }).lean();
    console.log("Blog category:", b ? b.category : 'none');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testFetch();
