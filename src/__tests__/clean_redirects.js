const mongoose = require('/var/www/pairolifestyle.com/node_modules/mongoose');

async function main() {
  const uri = 'mongodb://pairolifestyle_user:mD%26tEam%2FpLs-19yY@127.0.0.1:27017/pairo?authSource=pairo&replicaSet=rs0';
  
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const redirectsCollection = db.collection('redirects');

    const invalidRedirects = [
      "/product/pairo-womens-brown-hooded-shearling-leather-jacket-b3-bomber",
      "/product/pairo-womens-black-shearling-leather-jacket-b3-biker-style",
      "/product/pairo-womens-brown-shearling-leather-jacket-b3-bomber",
      "/product/pairo-womens-black-fur-black-leather-shearling-jacket-b3-bomber",
      "/product/pairo-womens-black-leather-white-fur-collar-shearling-jacket-b3-bomber",
      "/product/pairo-womens-brown-belted-shearling-leather-long-coat-b3-style",
      "/product/pairo-womens-warm-brown-belted-shearling-leather-long-coat-b3-style",
      "/product/pairo-womens-black-white-shearling-leather-long-coat-b3-style",
      "/product/pairo-womens-long-brown-shearling-leather-long-coat-b3-style"
    ];

    console.log('\n--- CLEANING INVALID PRODUCT REDIRECTS ON VPS ---');
    
    const result = await redirectsCollection.deleteMany({
      oldPath: { $in: invalidRedirects }
    });

    console.log(`Successfully deleted ${result.deletedCount} invalid product redirects!`);
    console.log('--- CLEANUP COMPLETED ---');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
