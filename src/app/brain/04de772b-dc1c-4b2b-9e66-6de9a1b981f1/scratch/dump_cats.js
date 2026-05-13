const mongoose = require('mongoose');

async function dumpCats() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    const collection = mongoose.connection.collection('categories');
    const all = await collection.find({ isDeleted: false }).toArray();
    console.log("Active Categories Count:", all.length);
    console.log("Data:", JSON.stringify(all.map(c => ({ name: c.name, slug: c.slug, type: c.type })), null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpCats();
