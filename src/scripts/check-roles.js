const mongoose = require('mongoose');
require('dotenv').config({path:'.env.local'});
const uri = process.env.MONGODB_URI.trim().replace(/^["'](.+)["']$/, '$1');

mongoose.connect(uri).then(async () => {
  const roles = await mongoose.connection.db.collection('roles').find({}).toArray();
  console.log('Role sizes:', roles.map(r => JSON.stringify(r).length));
  process.exit(0);
}).catch(console.error);
