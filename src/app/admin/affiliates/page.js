import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import AffiliatesManagerClient from "@/components/admin/AffiliatesManagerClient";

export const metadata = {
  title: "Affiliate System — Pairo Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminAffiliatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.isStaff) {
    redirect("/login");
  }

  await dbConnect();

  return <AffiliatesManagerClient userSession={session} />;
}
