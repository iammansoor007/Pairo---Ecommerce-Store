const mongoose = require('mongoose');

async function findDBs() {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017");
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases found:', dbs.databases.map(d => d.name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
findDBs();
