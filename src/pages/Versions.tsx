import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { scripts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare, Play, Copy, Plus, FileEdit } from "lucide-react";
import { getScript, type CustomScript } from "@/data/mockStore";

export default function Versions() {
  const { scriptId } = useParams();
  const navigate = useNavigate();
  const { setSelectedScript, setSelectedVersion } = useAppContext();
  const seedScript = scripts.find((s) => s.id === scriptId);
  const [customScript, setCustomScript] = useState<CustomScript | null>(null);
  const script = seedScript ?? customScript ?? null;
  const versionsList = script?.versions ?? [];
  const activeVersion = versionsList.find((v: any) => v.state === "Ativa");

  useEffect(() => {
    let cancelled = false;
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

  // Ensure global selectedScript follows the route
  useEffect(() => {
    setSelectedScript(scriptId ?? null);
  }, [scriptId, setSelectedScript]);

  // Do not override selectedVersion here; it remains what Editor/Consolidado set.
  // When user clicks a version card, we navigate with ?version and Editor will persist it.

  return (
    <div className="flex-1 p-6 fade-in">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">Versões</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as versões do script{" "}
              {script
                ? `${script.companyName ?? script.companyId} - ${script.type}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeVersion && (
              <Badge variant="default" className="text-sm">
                Versão ativa: {activeVersion.version}
              </Badge>
            )}
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Publicar nova versão
            </Button>
          </div>
        </div>

        {/* Versions List */}
        <div className="space-y-4">
          {versionsList.map((version) => (
            <Card
              key={version.version}
              className={version.state === "Ativa" ? "border-accent" : ""}
              onClick={() => {
                // Open editor for this specific version
                setSelectedScript(scriptId ?? null);
                navigate(`/editor/${scriptId}?version=${version.version}`);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">
                        {version.version}
                      </CardTitle>
                      <Badge
                        variant={
                          version.state === "Ativa"
                            ? "default"
                            : version.state === "Publicada"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {version.state}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {version.notes}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(version.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <GitCompare className="h-4 w-4" />
                        Comparar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Comparação de Versões</DialogTitle>
                        <DialogDescription>
                          Diferenças entre {version.version} e a versão anterior
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                        <div className="space-y-2 font-mono text-sm">
                          <div className="flex gap-2">
                            <span className="text-success">+</span>
                            <span>
                              Adicionado: "Seção de Fechamento" com 3 novos
                              trechos
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-destructive">-</span>
                            <span>
                              Removido: Trecho 2.3 "Confirmação de endereço"
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-warning">~</span>
                            <span>
                              Alterado: Trecho 1.1 - Atualizado texto de
                              consentimento LGPD
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-success">+</span>
                            <span>
                              Adicionado: Validação semântica em 5 trechos
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-warning">~</span>
                            <span>
                              Alterado: Método de comparação do Trecho 3.2
                              (ExactMatch → PartialMatch)
                            </span>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>

                  {version.state !== "Ativa" && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Play className="h-4 w-4" />
                      Ativar
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      navigate(`/editor/${scriptId}?version=${version.version}`)
                    }
                  >
                    <FileEdit className="h-4 w-4" />
                    Abrir no Editor
                  </Button>

                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
