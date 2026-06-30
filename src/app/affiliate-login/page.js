import AffiliateLoginClient from "@/components/affiliate/AffiliateLoginClient";

export const metadata = {
  title: "Partner Portal Login — PAIRO Lifestyle",
  description: "Access your PAIRO partner dashboard to track referrals, conversions, and commissions.",
  robots: { index: false, follow: false }
};

export default function AffiliateLoginPage() {
  return <AffiliateLoginClient />;
}
