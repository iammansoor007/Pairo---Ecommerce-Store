const mongoose = require('mongoose');

async function dropIndex() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");
    
    const collection = mongoose.connection.collection('categories');
    console.log("Dropping index slug_1...");
    try {
      await collection.dropIndex("slug_1");
      console.log("Successfully dropped index slug_1");
    } catch (e) {
      console.log("Index slug_1 error:", e.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

dropIndex();
