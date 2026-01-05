import { useAppContext } from "@/contexts/AppContext";
import {
  scripts,
  enunciationTypes,
  comparisonMethods,
  enunciationCatalog,
  comparisonCatalog,
} from "@/data/mockData";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getScript, type CustomScript } from "@/data/mockStore";

export function Header() {
  const { selectedScript, setSelectedScript, selectedVersion } =
    useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const seedScript = scripts.find((s) => s.id === selectedScript);
  const [customScript, setCustomScript] = useState<CustomScript | null>(null);
  const displayScript = customScript ?? seedScript ?? null;
  const params = new URLSearchParams(location.search);
  const versionParam = params.get("version");

  // Keep selectedScript in sync with the current route at all times
  useEffect(() => {
    const match = location.pathname.match(
      /^\/(editor|versions|consolidado)\/([^\/?#]+)/
    );
    const routeScriptId = match ? match[2] : null;
    if (routeScriptId && routeScriptId !== selectedScript) {
      setSelectedScript(routeScriptId);
    }
  }, [location.pathname, selectedScript, setSelectedScript]);

  // Load metadata for custom scripts from mock DB when selectedScript changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedScript) {
        if (!cancelled) setCustomScript(null);
        return;
      }
      try {
        const s = await getScript(selectedScript);
        if (!cancelled) setCustomScript(s);
      } catch {
        if (!cancelled) setCustomScript(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedScript]);

  const currentVersion = (() => {
    if (versionParam) return versionParam;
    if (customScript) return customScript.activeVersion;
    if (!seedScript) return undefined;
    const active = seedScript.versions?.find(
      (v) => v.version === seedScript.activeVersion || v.state === "Ativa"
    );
    return active?.version ?? seedScript.activeVersion;
  })();

  const navVersion = versionParam ?? selectedVersion ?? null;
  const versionSuffix = navVersion ? `?version=${navVersion}` : "";

  // Breadcrumb only: 'Scripts' and current script name (filters removed from breadcrumb)

  const refOpen = new URLSearchParams(location.search).get("ref") === "1";

  const getEnunciationLabel = (name: string) =>
    enunciationTypes.find((t) => t.value === name)?.label || name;
  const getComparisonLabel = (name: string) =>
    comparisonMethods.find((t) => t.value === name)?.label || name;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center px-6 gap-6">
          {/* Breadcrumb: Scripts > CompanyName > Type (Editor) when a script is selected */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <NavLink
              to="/scripts"
              className="font-medium text-foreground hover:underline"
              activeClassName="text-foreground"
              onClick={() => setSelectedScript(null)}
            >
              Scripts
            </NavLink>
            {selectedScript && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>
                  {displayScript?.companyName ??
                    displayScript?.companyId ??
                    selectedScript}
                </span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{`${
                  displayScript?.type ?? ""
                } (${
                  location.pathname.startsWith("/versions")
                    ? "Versões"
                    : location.pathname.startsWith("/consolidado")
                    ? "Consolidado"
                    : "Editor"
                })`}</span>
                {(location.pathname.startsWith("/editor") ||
                  location.pathname.startsWith("/consolidado")) &&
                  currentVersion && (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-foreground font-medium">
                        {currentVersion}
                      </span>
                    </>
                  )}
              </>
            )}
          </div>
          {/* Navigation on right (removed Scripts button) */}
          <nav className="ml-auto flex items-center gap-1">
            {selectedScript && (
              <>
                <NavLink
                  to={`/editor/${selectedScript}${versionSuffix}`}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeClassName="text-foreground bg-secondary rounded-md"
                >
                  Editor
                </NavLink>
                <NavLink
                  to={`/consolidado/${selectedScript}${versionSuffix}`}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeClassName="text-foreground bg-secondary rounded-md"
                >
                  Consolidado
                </NavLink>
                <NavLink
                  to={`/versions/${selectedScript}`}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeClassName="text-foreground bg-secondary rounded-md"
                >
                  Versões
                </NavLink>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                const params = new URLSearchParams(location.search);
                params.set("ref", "1");
                navigate(
                  { pathname: location.pathname, search: params.toString() },
                  { replace: true }
                );
              }}
            >
              <BookOpen className="h-3 w-3" />
              Referência Rápida
            </Button>
          </nav>
        </div>
      </header>
      {/* Global Quick Reference Sheet, controlled by ?ref=1 */}
      <Sheet
        open={refOpen}
        onOpenChange={(open) => {
          const p = new URLSearchParams(location.search);
          if (open) p.set("ref", "1");
          else p.delete("ref");
          navigate(
            { pathname: location.pathname, search: p.toString() },
            { replace: true }
          );
        }}
      >
        <SheetContent side="right" className="w-[420px] sm:w-[520px]">
          <SheetHeader>
            <SheetTitle>Referência Rápida</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-8">
            <div>
              <h4 className="text-sm font-medium mb-2">Tipos de Enunciação</h4>
              <div className="space-y-3">
                {enunciationCatalog.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-md border p-3 bg-card"
                  >
                    <div className="text-sm font-semibold">
                      {getEnunciationLabel(item.name)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    {item.example && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Ex.: {item.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">
                Métodos de Comparação
              </h4>
              <div className="space-y-3">
                {comparisonCatalog.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-md border p-3 bg-card"
                  >
                    <div className="text-sm font-semibold">
                      {getComparisonLabel(item.name)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    {item.example && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Ex.: {item.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
