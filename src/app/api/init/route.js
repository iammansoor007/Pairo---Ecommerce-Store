import dbConnect from "@/lib/db";
import SiteConfig from "@/models/SiteConfig";

export async function GET() {
  try {
    await dbConnect();
    const config = await SiteConfig.findOne({ key: 'main' });
    if (!config) {
      return Response.json({ message: "Config not found" }, { status: 404 });
    }
    return Response.json(config);
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
