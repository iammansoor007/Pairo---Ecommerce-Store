const mongoose = require('/var/www/pairolifestyle.com/node_modules/mongoose');

async function main() {
  const uri = 'mongodb://pairolifestyle_user:mD%26tEam%2FpLs-19yY@127.0.0.1:27017/pairo?authSource=pairo&replicaSet=rs0';
  
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // 1. Check redirects schema and document format
    const redirectsCollection = db.collection('redirects');
    const redirectDoc = await redirectsCollection.findOne({});
    console.log('\n--- REDIRECT DOCUMENT STRUCTURE ---');
    if (redirectDoc) {
      console.log("Keys in redirects doc:", Object.keys(redirectDoc));
      console.log("Sample doc:", JSON.stringify(redirectDoc, null, 2));
    } else {
      console.log("No redirects found.");
    }

    // 2. Scan all redirects for old URLs
    const redirects = await redirectsCollection.find({}).toArray();
    console.log(`\nFound ${redirects.length} redirects. Checking for invalid fields...`);
    
    // Find fields that have 'localhost', 'shopify', 'wordpress', 'shop?', or 'pages'
    const targetPattern = /localhost|shopify|wordpress|temp-url|\/shop\?|\/pages\//i;
    let matchCount = 0;

    redirects.forEach(r => {
      const fromUrl = r.from || r.source || r.oldUrl || r.path || '';
      const toUrl = r.to || r.destination || r.newUrl || r.target || '';
      
      if (targetPattern.test(fromUrl) || targetPattern.test(toUrl)) {
        console.log(` - Invalid Redirect: "${fromUrl}" -> "${toUrl}"`);
        matchCount++;
      }
    });

    if (matchCount === 0) {
      console.log("No invalid or old URLs found in the redirects collection!");
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
