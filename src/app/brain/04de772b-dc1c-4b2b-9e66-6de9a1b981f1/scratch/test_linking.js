const mongoose = require('mongoose');

async function testUpdate() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: String,
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
    }));

    // Find any product
    const product = await Product.findOne({});
    if (!product) { console.log("no product found"); return process.exit(0); }
    
    console.log("Found product:", product.name, product._id);
    
    // Attempt update
    const categoryId = new mongoose.Types.ObjectId().toString(); // random id as string
    
    const res = await Product.updateMany(
      { _id: product._id },
      { $addToSet: { categories: categoryId } }
    );
    console.log("Update result:", res);
    
    const updated = await Product.findById(product._id);
    console.log("Updated categories:", updated.categories);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testUpdate();
