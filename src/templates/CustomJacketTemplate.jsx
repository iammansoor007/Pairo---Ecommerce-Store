import React from "react";
import SectionRenderer from "@/components/common/SectionRenderer";
import { TEMPLATE_REGISTRY } from "@/lib/templates";

export default function CustomJacketTemplate({ page, sections = [] }) {
  const allowed = TEMPLATE_REGISTRY["custom-jacket"].allowedSections;
  const filtered = sections.filter((s) => s && allowed.includes(s.type));

  return (
    <main className="bg-background custom-jacket-template" data-template="custom-jacket">
      <SectionRenderer sections={filtered} />
    </main>
  );
}
