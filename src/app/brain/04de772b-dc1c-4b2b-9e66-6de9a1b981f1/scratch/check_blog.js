const mongoose = require('mongoose');

async function checkBlog() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  await mongoose.connect(MONGODB_URI);
  
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({
    title: String,
    category: String
  }));

  const b = await Blog.findOne({}).lean();
  console.log("Blog:", b ? b.title : 'none');
  
  if (b) {
    const res = await Blog.updateMany({ _id: b._id }, { $set: { category: "TestCat123" } });
    console.log("Update result:", res);
    const b2 = await Blog.findById(b._id);
    console.log("Updated category:", b2.category);
  }

  process.exit(0);
}

checkBlog();
