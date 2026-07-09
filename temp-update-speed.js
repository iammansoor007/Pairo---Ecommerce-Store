const mongoose = require('mongoose');

const uri = "mongodb://pairolifestyle_user:mD%26tEam%2FpLs-19yY@127.0.0.1:27017/pairo?authSource=pairo&replicaSet=rs0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const Page = mongoose.model('Page', new mongoose.Schema({}, { strict: false }));
  
  const pages = await Page.find({ "sections.type": "feature_marquee" });
  console.log(`Found ${pages.length} pages containing feature_marquee`);

  for (const page of pages) {
    let updated = false;
    const sections = page.toObject().sections || [];
    const newSections = sections.map(section => {
      if (section.type === "feature_marquee") {
        if (!section.config) section.config = {};
        console.log(`Found section on page '${page.slug}', current speed: ${section.config.speed}`);
        section.config.speed = 80;
        updated = true;
      }
      return section;
    });

    if (updated) {
      await Page.updateOne({ _id: page._id }, { $set: { sections: newSections } });
      console.log(`Successfully updated page: ${page.slug}`);
    }
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

run().catch(console.error);
