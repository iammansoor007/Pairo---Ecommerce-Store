"use client";
import { useParams } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";

export default function EditBlogCategory() {
  const params = useParams();
  return <CategoryForm categoryId={params.id} type="blog" />;
}
