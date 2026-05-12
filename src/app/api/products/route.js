import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Always filter for Published and not Deleted for public API
    const baseQuery = { status: 'Published', isDeleted: { $ne: true } };

    if (id) {
      const product = await Product.findOne({ ...baseQuery, id: parseInt(id) });
      return Response.json(product);
    }

    let query = { ...baseQuery };
    if (category && category !== 'all') query.category = { $regex: new RegExp(category, 'i') };
    if (type) query.type = type;

    const products = await Product.find(query);
    
    // Group them like data.json for compatibility if no specific query
    if (!category && !type && !id) {
      const newArrivals = await Product.find({ ...baseQuery, type: 'newArrival' });
      const topSelling = await Product.find({ ...baseQuery, type: 'topSelling' });
      return Response.json({ newArrivals, topSelling });
    }

    return Response.json(products);
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
