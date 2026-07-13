import React from "react";
import SectionRenderer from "@/components/common/SectionRenderer";
import { TEMPLATE_REGISTRY } from "@/lib/templates";

export default function GalleryTemplate({ page, sections = [] }) {
  const allowed = TEMPLATE_REGISTRY["gallery"].allowedSections;
  const filtered = sections.filter((s) => s && allowed.includes(s.type));

  return (
    <main className="bg-background gallery-template" data-template="gallery">
      <SectionRenderer sections={filtered} />
    </main>
  );
}
