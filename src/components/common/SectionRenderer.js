"use client";

import React from "react";
import { getSectionComponent } from "@/lib/section-registry";
import Reveal from "@/components/common/Reveal";

const SectionWrapper = ({ section, children }) => {
  const { overrides = {} } = section;
  // Force removal of the old default culprit if it exists in the DB
  let padding = overrides.padding || "py-0";
  if (padding === "py-12 md:py-20") padding = "py-0";
  
  const background = overrides.background || "transparent";
  const customClasses = overrides.customClasses || "";

  return (
    <div 
      className={`${padding} ${customClasses}`} 
      style={{ backgroundColor: background }}
    >
      <Reveal>
        {children}
      </Reveal>
    </div>
  );
};

export default function SectionRenderer({ sections = [] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const Component = getSectionComponent(section.type);
          if (!Component) {
            console.warn(`Section type "${section.type}" not found in registry.`);
            return null;
          }

          return (
            <SectionWrapper key={section.id} section={section}>
              <Component {...section.config} sectionId={section.id} />
            </SectionWrapper>
          );
        })}
    </>
  );
}
