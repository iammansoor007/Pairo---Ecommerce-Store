"use client";

import React from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import SizeChartForm from "@/components/admin/SizeChartForm";
import { useParams } from "next/navigation";

export default function EditSizeChartPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <AdminPageLayout
      title="Edit Size Chart"
      subtitle="Modify measurements, columns, rows, or update assignment rules"
      breadcrumbs={[
        { label: "Products", href: "/admin/products" },
        { label: "Size Charts", href: "/admin/products/size-charts" },
        { label: "Edit" }
      ]}
    >
      {id ? (
        <SizeChartForm initialId={id} />
      ) : (
        <div className="text-center py-10 text-gray-500 font-medium">Invalid ID provided.</div>
      )}
    </AdminPageLayout>
  );
}
