"use client";

import ProductForm from "@/components/admin/ProductForm";
import { use } from "react";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  return <ProductForm productId={id} />;
}
