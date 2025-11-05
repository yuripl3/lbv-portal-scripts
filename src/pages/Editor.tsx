import { useState } from "react";
import { useParams } from "react-router-dom";
import { scriptStructure, enunciationTypes, comparisonMethods } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Plus, GripVertical, Beaker, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Editor() {
  const { scriptId } = useParams();
  const [selectedExcerpt, setSelectedExcerpt] = useState(scriptStructure[0].steps[0].excerpts[0]);
  const [testResult, setTestResult] = useState<"approved" | "rejected" | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] fade-in">
      {/* Column 1: Structure Tree */}
      <div className="w-80 border-r bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold text-foreground">Estrutura do Script</h3>
          <p className="text-xs text-muted-foreground mt-1">Seções, Passos e Trechos</p>
        </div>
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-4 space-y-3">
            {scriptStructure.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span>{section.name}</span>
                </div>
                {section.steps.map((step) => (
                  <div key={step.id} className="ml-6 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-3 w-3" />
                      <span>{step.name}</span>
                    </div>
                    {step.excerpts.map((excerpt) => (
                      <button
                        key={excerpt.id}
                        onClick={() => setSelectedExcerpt(excerpt)}
                        className={`ml-9 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selectedExcerpt.id === excerpt.id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {excerpt.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
              <Plus className="h-3 w-3" />
              Adicionar Seção
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Column 2: Form */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{selectedExcerpt.label}</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure os parâmetros do trecho selecionado</p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="statement">Enunciado esperado</Label>
                <Input
                  id="statement"
                  value={selectedExcerpt.expectedStatement}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="response">Resposta esperada do doador</Label>
                <Input
                  id="response"
                  value={selectedExcerpt.expectedResponse}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enunciation">Tipo de Enunciação</Label>
                  <Select value={selectedExcerpt.enunciationType} disabled>
                    <SelectTrigger id="enunciation" className="bg-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enunciationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparison">Método de Comparação</Label>
                  <Select value={selectedExcerpt.comparisonMethod} disabled>
                    <SelectTrigger id="comparison" className="bg-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {comparisonMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>Selecione os tipos apenas para demonstração visual. Nenhum dado será salvo.</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Test Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Beaker className="h-4 w-4" />
                Teste Rápido
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Teste Rápido</DialogTitle>
                <DialogDescription>
                  Simule a execução de um trecho para visualizar o resultado da análise
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="test-excerpt">Trecho a testar</Label>
                  <Select disabled value={selectedExcerpt.id}>
                    <SelectTrigger id="test-excerpt" className="bg-muted">
                      <SelectValue placeholder="Selecione um trecho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selectedExcerpt.id}>{selectedExcerpt.label}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-input">Texto de entrada (simulado)</Label>
                  <Textarea
                    id="test-input"
                    placeholder="Digite o texto a ser testado..."
                    className="min-h-[100px] bg-muted"
                    disabled
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => setTestResult(Math.random() > 0.5 ? "approved" : "rejected")}
                >
                  Executar Teste
                </Button>

                {testResult && (
                  <Card className={testResult === "approved" ? "border-success" : "border-destructive"}>
                    <CardContent className="flex items-center gap-3 pt-6">
                      {testResult === "approved" ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <div>
                            <p className="font-medium text-success">Teste Aprovado</p>
                            <p className="text-sm text-muted-foreground">
                              A resposta corresponde aos critérios definidos
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="font-medium text-destructive">Teste Reprovado</p>
                            <p className="text-sm text-muted-foreground">
                              A resposta não atende aos critérios esperados
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Column 3: Tips & Examples */}
      <div className="w-80 border-l bg-card overflow-auto">
        <div className="border-b p-4">
          <h3 className="font-semibold text-foreground">Dicas & Exemplos</h3>
          <p className="text-xs text-muted-foreground mt-1">Referência rápida</p>
        </div>
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Tipos de Enunciação</h4>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ExplicitAnswer</CardTitle>
                <CardDescription className="text-xs">Informação dita explicitamente</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">CPF dígito a dígito</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ComplementaryAnswer</CardTitle>
                <CardDescription className="text-xs">Conteúdo + complemento</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">15 reais</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ConfirmationAnswer</CardTitle>
                <CardDescription className="text-xs">Confirmação simples</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">sim / não</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Métodos de Comparação</h4>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ExactMatch</CardTitle>
                <CardDescription className="text-xs">Igualdade literal</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">sim ≠ aham</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">PartialMatch</CardTitle>
                <CardDescription className="text-xs">Pequenas divergências ok</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">Adalberto vs Adalberto C.</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">SemanticMatch</CardTitle>
                <CardDescription className="text-xs">Equivalência semântica</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">sim / positivo</Badge>
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            Inserir exemplo
          </Button>
        </div>
      </div>
    </div>
  );
}
