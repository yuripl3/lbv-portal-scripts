import { useAppContext } from "@/contexts/AppContext";
import { companies, scripts } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavLink } from "@/components/NavLink";
import { ChevronRight } from "lucide-react";

export function Header() {
  const {
    selectedCompany,
    setSelectedCompany,
    selectedType,
    setSelectedType,
    selectedScript,
  } = useAppContext();

  const company = companies.find((c) => c.id === selectedCompany);
  const script = scripts.find((s) => s.id === selectedScript);

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    const newCompany = companies.find((c) => c.id === value);
    if (newCompany && newCompany.scriptTypes.length > 0) {
      setSelectedType(newCompany.scriptTypes[0]);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center gap-6 px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">CS</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Console de Scripts</h1>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          <Select value={selectedCompany} onValueChange={handleCompanyChange}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Companhia" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {company?.scriptTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink
            to="/scripts"
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeClassName="text-foreground bg-secondary rounded-md"
          >
            Scripts
          </NavLink>
          <NavLink
            to={selectedScript ? `/editor/${selectedScript}` : "/scripts"}
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeClassName="text-foreground bg-secondary rounded-md"
          >
            Editor
          </NavLink>
          <NavLink
            to={selectedScript ? `/versions/${selectedScript}` : "/scripts"}
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeClassName="text-foreground bg-secondary rounded-md"
          >
            Versões
          </NavLink>
          <NavLink
            to="/catalog"
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeClassName="text-foreground bg-secondary rounded-md"
          >
            Catálogo de Análise
          </NavLink>
        </nav>

        {/* Breadcrumbs */}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span>{company?.name}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{selectedType}</span>
          {script && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{script.name}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
