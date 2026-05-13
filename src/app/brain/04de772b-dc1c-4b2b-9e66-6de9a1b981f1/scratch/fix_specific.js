const mongoose = require('mongoose');

async function fixSpecific() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    const collection = mongoose.connection.collection('categories');
    
    console.log("Fixing categories that have 'blog' in name but wrong type...");
    const res = await collection.updateMany(
      { name: /blog/i },
      { $set: { type: 'blog' } }
    );
    console.log(`Updated ${res.modifiedCount} categories to 'blog'.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixSpecific();
