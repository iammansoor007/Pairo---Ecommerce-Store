import React from "react";
import SectionRenderer from "@/components/common/SectionRenderer";
import { TEMPLATE_REGISTRY } from "@/lib/templates";

export default function SizeChartTemplate({ page, sections = [] }) {
  const allowed = TEMPLATE_REGISTRY["size-chart"].allowedSections;
  const filtered = sections.filter((s) => s && allowed.includes(s.type));

  return (
    <main className="bg-background size-chart-template" data-template="size-chart">
      <SectionRenderer sections={filtered} />
    </main>
  );
}
