const mongoose = require('mongoose');

async function checkCols() {
  const MONGODB_URI = "mongodb://ammansoor0077_db_user:ZYW27mQw7femXreQ@ac-aoukvtk-shard-00-00.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-01.qlku7y7.mongodb.net:27017,ac-aoukvtk-shard-00-02.qlku7y7.mongodb.net:27017/pairo?ssl=true&authSource=admin&retryWrites=true&w=majority";
  
  try {
    await mongoose.connect(MONGODB_URI);
    const admin = mongoose.connection.db.admin();
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", cols.map(c => c.name));
    
    for (const col of cols) {
       const indexes = await mongoose.connection.db.collection(col.name).indexes();
       console.log(`Indexes for ${col.name}:`, indexes.map(i => i.name));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCols();
