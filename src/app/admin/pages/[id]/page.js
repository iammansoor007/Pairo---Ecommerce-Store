"use client";

import PageForm from "@/components/admin/PageForm";
import { use } from "react";

export default function EditPage({ params }) {
  const { id } = use(params);
  return <PageForm pageId={id} />;
}
