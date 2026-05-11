import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (id) {
      const product = await Product.findOne({ id: parseInt(id) });
      return Response.json(product);
    }

    let query = {};
    if (category && category !== 'all') query.category = { $regex: new RegExp(category, 'i') };
    if (type) query.type = type;

    const products = await Product.find(query);
    
    // Group them like data.json for compatibility if no query
    if (!category && !type && !id) {
      const newArrivals = await Product.find({ type: 'newArrival' });
      const topSelling = await Product.find({ type: 'topSelling' });
      return Response.json({ newArrivals, topSelling });
    }

    return Response.json(products);
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
