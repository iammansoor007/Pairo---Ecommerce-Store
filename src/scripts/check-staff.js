const mongoose = require('mongoose');
require('dotenv').config({path:'.env.local'});
const uri = process.env.MONGODB_URI.trim().replace(/^["'](.+)["']$/, '$1');

mongoose.connect(uri).then(async () => {
  const staff = await mongoose.connection.db.collection('staffs').find({}).toArray();
  console.log('Staff members:', staff.map(s => ({ email: s.email, status: s.status })));
  process.exit(0);
}).catch(console.error);
