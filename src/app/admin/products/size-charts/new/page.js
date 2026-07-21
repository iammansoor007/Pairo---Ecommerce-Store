"use client";

import React from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import SizeChartForm from "@/components/admin/SizeChartForm";

export default function NewSizeChartPage() {
  return (
    <AdminPageLayout
      title="Add New Size Chart"
      subtitle="Configure a master size chart and assign it to categories or products"
      breadcrumbs={[
        { label: "Products", href: "/admin/products" },
        { label: "Size Charts", href: "/admin/products/size-charts" },
        { label: "Add New" }
      ]}
    >
      <SizeChartForm />
    </AdminPageLayout>
  );
}
