"use client";

import { createContext, useContext } from "react";

const SiteContext = createContext(null);

export function SiteProvider({ children, initialData }) {
  return (
    <SiteContext.Provider value={initialData}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSiteData must be used within a SiteProvider");
  }
  return context;
}
