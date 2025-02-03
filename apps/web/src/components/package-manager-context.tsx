"use client";

import { createContext, useContext, useEffect, useState } from "react";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

interface PackageManagerContextType {
  packageManager: PackageManager;
  setPackageManager: (pm: PackageManager) => void;
}

const PackageManagerContext = createContext<
  PackageManagerContextType | undefined
>(undefined);

export function PackageManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [packageManager, setPackageManagerState] =
    useState<PackageManager>("npm");

  useEffect(() => {
    const stored = localStorage.getItem("preferred-pm");
    if (stored && ["npm", "yarn", "pnpm", "bun"].includes(stored)) {
      setPackageManagerState(stored as PackageManager);
    }
  }, []);

  const setPackageManager = (pm: PackageManager) => {
    setPackageManagerState(pm);
    localStorage.setItem("preferred-pm", pm);
  };

  return (
    <PackageManagerContext.Provider
      value={{ packageManager, setPackageManager }}
    >
      {children}
    </PackageManagerContext.Provider>
  );
}

export function usePackageManager() {
  const context = useContext(PackageManagerContext);
  if (context === undefined) {
    throw new Error(
      "usePackageManager must be used within a PackageManagerProvider",
    );
  }
  return context;
}
