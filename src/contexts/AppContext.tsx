import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  selectedCompany: string;
  setSelectedCompany: (id: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedScript: string | null;
  setSelectedScript: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState("vivo");
  const [selectedType, setSelectedType] = useState("Prospecção");
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        selectedType,
        setSelectedType,
        selectedScript,
        setSelectedScript,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
