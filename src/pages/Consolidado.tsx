import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { scripts, enunciationTypes, comparisonMethods } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getScript, loadSections, type CustomScript } from "@/data/mockStore";
import { useAppContext } from "@/contexts/AppContext";

export default function Consolidado() {
  const { scriptId } = useParams();
  const location = useLocation();
  const { setSelectedScript, setSelectedVersion } = useAppContext();
  const seedScript = scripts.find((s) => s.id === scriptId);
  const [customScript, setCustomScript] = useState<CustomScript | null>(null);
  const script = seedScript ?? customScript ?? null;

  // Resolve version to use: URL ?version or active/latest or default v1.0
  const versionToUse = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const versionParam = params.get("version");
    if (versionParam) return versionParam;
    if (script && script.versions?.length) {
      const active = script.versions.find(
        (v) =>
          v.version === script.activeVersion || (v as any).state === "Ativa"
      );
      if (active) return active.version;
      const sorted = [...script.versions].sort(
        (a, b) =>
          new Date((b as any).date).getTime() -
          new Date((a as any).date).getTime()
      );
      return sorted[0]?.version;
    }
    return "v1.0";
  }, [script, location.search]);

  // Ensure global selectedScript follows the route
  useEffect(() => {
    setSelectedScript(scriptId ?? null);
  }, [scriptId, setSelectedScript]);

  // Persist version to context when present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get("version");
    if (v) setSelectedVersion(v);
  }, [location.search, setSelectedVersion]);

  // Sections: fallback to seed structure then override with persisted
  type SeedSection = { id: string; name: string; excerpts: any[] };
  const [sections, setSections] = useState<SeedSection[]>([]);

  useEffect(() => {
    let cancelled = false;
    // Fetch script metadata if not in seed
    (async () => {
      if (!seedScript && scriptId) {
        try {
          const s = await getScript(scriptId);
          if (!cancelled) setCustomScript(s);
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seedScript, scriptId]);

  useEffect(() => {
    // set fallback from seed structure when available
    if (seedScript && versionToUse) {
      const v =
        seedScript.versions.find((vv) => vv.version === versionToUse) ??
        seedScript.versions[0];
      const base = (v?.structure ?? []) as SeedSection[];
      setSections(base);
    } else {
      setSections([]);
    }
  }, [seedScript, versionToUse]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!scriptId || !versionToUse) return;
      try {
        const persisted = await loadSections(scriptId, versionToUse);
        if (!cancelled && Array.isArray(persisted) && persisted.length > 0) {
          setSections(persisted as any);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [scriptId, versionToUse]);

  const rows = useMemo(() => {
    const data: Array<{
      key: string;
      section: string;
      trecho: string;
      interlocutor: string;
      frase: string;
      enunciacao: string;
      comparacao: string;
      operatorKeywords?: string[];
      donorKeywords?: string[];
      requiresResponse?: boolean;
      // removida coluna 'Resposta esperada' da tabela
    }> = [];
    const structure = sections ?? [];
    for (const section of structure as any[]) {
      for (const ex of section.excerpts ?? []) {
        // Suporta tanto o modelo antigo (enunciationType/comparisonMethod)
        // quanto o modelo novo com campos separados para statement/response
        const stmtEnunc = ex.statementEnunciationType ?? ex.enunciationType;
        const stmtComp = ex.statementComparisonMethod ?? ex.comparisonMethod;
        const respEnunc = ex.responseEnunciationType ?? ex.enunciationType;
        const respComp = ex.responseComparisonMethod ?? ex.comparisonMethod;
        const requiresResp =
          typeof ex.requiresResponse === "boolean" ? ex.requiresResponse : !!ex.expectedResponse;

        // Linha 1: Operador (enunciado)
        data.push({
          key: `${section.id}-${ex.id}-stmt`,
          section: section.name,
          trecho: ex.label,
          interlocutor: "Operador",
          frase: ex.expectedStatement || "",
          enunciacao: stmtEnunc,
          comparacao: stmtComp,
          operatorKeywords: ex.operatorKeywords ?? [],
          donorKeywords: ex.donorKeywords ?? [],
          requiresResponse: requiresResp,
        });

        // Linha 2 (opcional): Doador (resposta esperada)
        if (requiresResp) {
          data.push({
            key: `${section.id}-${ex.id}-resp`,
            section: section.name,
            trecho: ex.label,
            interlocutor: "Doador",
            frase: ex.expectedResponse ?? "",
            enunciacao: respEnunc,
            comparacao: respComp,
            operatorKeywords: ex.operatorKeywords ?? [],
            donorKeywords: ex.donorKeywords ?? [],
            requiresResponse: requiresResp,
          });
        }
      }
    }
    return data;
  }, [sections]);

  if (!script) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Script não encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Visão Consolidada — {script.companyName ?? script.companyId} ·{" "}
              {script.type}
              {versionToUse ? ` · ${versionToUse}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6">Seção</TableHead>
                  <TableHead className="w-1/6">Trecho</TableHead>
                  <TableHead className="w-1/12">Interlocutor</TableHead>
                  <TableHead>Frase que deve ser dita/resposta</TableHead>
                  <TableHead className="w-1/12">Enunciação</TableHead>
                  <TableHead className="w-1/12">Comparação</TableHead>
                  <TableHead className="w-1/6">Palavras‑chave</TableHead>
                  <TableHead className="w-24">Req. resp.?</TableHead>
                  {/* Coluna 'Resposta esperada' removida */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Nenhum trecho disponível nesta versão.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => {
                    const isOperator = r.interlocutor === "Operador";
                    const enuncLabel =
                      enunciationTypes.find((t) => t.value === r.enunciacao)?.label || r.enunciacao;
                    const compLabel =
                      comparisonMethods.find((t) => t.value === r.comparacao)?.label || r.comparacao;
                    const keywords = isOperator
                      ? r.operatorKeywords ?? []
                      : r.donorKeywords ?? [];
                    return (
                      <TableRow
                        key={r.key}
                        className={
                          isOperator
                            ? "bg-blue-50/50 dark:bg-blue-950/10"
                            : "bg-green-50/50 dark:bg-green-950/10"
                        }
                      >
                        <TableCell className="align-top">{r.section}</TableCell>
                        <TableCell className="align-top">{r.trecho}</TableCell>
                        <TableCell className="align-top">
                          {r.interlocutor}
                        </TableCell>
                        <TableCell className="align-top whitespace-pre-wrap">
                          {r.frase}
                        </TableCell>
                        <TableCell className="align-top">{enuncLabel}</TableCell>
                        <TableCell className="align-top">{compLabel}</TableCell>
                        <TableCell className="align-top">
                          {keywords && keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {keywords.map((k, i) => (
                                <span
                                  key={`${r.key}-kw-${i}`}
                                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="align-top">
                          {isOperator ? (r.requiresResponse ? "Sim" : "Não") : ""}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
