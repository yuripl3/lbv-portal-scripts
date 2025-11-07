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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  ChevronDown, 
  ChevronRight,
  MessageSquare,
  UserCircle,
  Settings2,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Excerpt {
  id: string;
  label: string;
  expectedStatement: string;
  expectedResponse: string;
  statementEnunciationType: string;
  responseEnunciationType: string;
  statementComparisonMethod: string;
  responseComparisonMethod: string;
}

interface Step {
  id: string;
  name: string;
  description?: string;
  excerpts: Excerpt[];
}

interface Section {
  id: string;
  name: string;
  steps: Step[];
}

export default function EditorV2() {
  const { scriptId } = useParams();
  const isNewScript = scriptId === "new";
  
  const [sections, setSections] = useState<Section[]>(isNewScript ? [] : scriptStructure.map(s => ({
    ...s,
    steps: s.steps.map(st => ({
      ...st,
      excerpts: st.excerpts.map(e => ({
        ...e,
        statementEnunciationType: e.enunciationType,
        responseEnunciationType: e.enunciationType,
        statementComparisonMethod: e.comparisonMethod,
        responseComparisonMethod: e.comparisonMethod,
      }))
    }))
  })));
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sections[0]?.id || null
  );
  
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    sections[0]?.steps[0]?.id || null
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const addNewSection = () => {
    const newId = `s${Date.now()}`;
    const newSection: Section = {
      id: newId,
      name: "Nova Seção",
      steps: [
        {
          id: `${newId}p1`,
          name: "Novo Passo",
          description: "Descrição do passo",
          excerpts: [
            {
              id: `${newId}p1e1`,
              label: "Trecho 1",
              expectedStatement: "",
              expectedResponse: "",
              statementEnunciationType: "ExplicitAnswer",
              responseEnunciationType: "ExplicitAnswer",
              statementComparisonMethod: "PartialMatch",
              responseComparisonMethod: "PartialMatch",
            },
          ],
        },
      ],
    };
    setSections([...sections, newSection]);
    setExpandedSections(prev => new Set([...prev, newId]));
    setSelectedSectionId(newId);
    setSelectedStepId(newSection.steps[0].id);
    toast.success("Nova seção adicionada");
  };

  const addStepToSection = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newStepId = `${sectionId}p${Date.now()}`;
        const newStep: Step = {
          id: newStepId,
          name: "Novo Passo",
          description: "Descrição do passo",
          excerpts: [
            {
              id: `${newStepId}e1`,
              label: "Trecho 1",
              expectedStatement: "",
              expectedResponse: "",
              statementEnunciationType: "ExplicitAnswer",
              responseEnunciationType: "ExplicitAnswer",
              statementComparisonMethod: "PartialMatch",
              responseComparisonMethod: "PartialMatch",
            },
          ],
        };
        return {
          ...section,
          steps: [...section.steps, newStep]
        };
      }
      return section;
    }));
    toast.success("Novo passo adicionado");
  };

  const addExcerptToStep = (sectionId: string, stepId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          steps: section.steps.map(step => {
            if (step.id === stepId) {
              const newExcerpt: Excerpt = {
                id: `${stepId}e${Date.now()}`,
                label: `Trecho ${step.excerpts.length + 1}`,
                expectedStatement: "",
                expectedResponse: "",
                statementEnunciationType: "ExplicitAnswer",
                responseEnunciationType: "ExplicitAnswer",
                statementComparisonMethod: "PartialMatch",
                responseComparisonMethod: "PartialMatch",
              };
              return {
                ...step,
                excerpts: [...step.excerpts, newExcerpt]
              };
            }
            return step;
          })
        };
      }
      return section;
    }));
    toast.success("Novo trecho adicionado");
  };

  const updateSection = (sectionId: string, field: keyof Section, value: any) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
  };

  const updateStep = (sectionId: string, stepId: string, field: keyof Step, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          steps: section.steps.map(step => 
            step.id === stepId ? { ...step, [field]: value } : step
          )
        };
      }
      return section;
    }));
  };

  const updateExcerpt = (sectionId: string, stepId: string, excerptId: string, field: keyof Excerpt, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          steps: section.steps.map(step => {
            if (step.id === stepId) {
              return {
                ...step,
                excerpts: step.excerpts.map(excerpt =>
                  excerpt.id === excerptId ? { ...excerpt, [field]: value } : excerpt
                )
              };
            }
            return step;
          })
        };
      }
      return section;
    }));
  };

  const deleteExcerpt = (sectionId: string, stepId: string, excerptId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          steps: section.steps.map(step => {
            if (step.id === stepId) {
              const newExcerpts = step.excerpts.filter(e => e.id !== excerptId);
              return { ...step, excerpts: newExcerpts };
            }
            return step;
          })
        };
      }
      return section;
    }));
    toast.success("Trecho removido");
  };

  const handleSave = () => {
    toast.success("Alterações salvas (mock)");
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedStep = selectedSection?.steps.find(st => st.id === selectedStepId);

  return (
    <div className="flex h-[calc(100vh-4rem)] fade-in bg-background">
      {/* Left Sidebar - Navigation Tree */}
      <div className="w-72 border-r bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Estrutura
            </h3>
            <Button size="sm" variant="ghost" onClick={addNewSection}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Seções do script</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {sections.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhuma seção ainda
                </p>
                <Button size="sm" variant="outline" onClick={addNewSection}>
                  <Plus className="h-3 w-3 mr-2" />
                  Primeira Seção
                </Button>
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedSectionId === section.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      if (section.steps[0]) {
                        setSelectedStepId(section.steps[0].id);
                      }
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(section.id);
                      }}
                      className="hover:bg-muted/50 rounded p-0.5"
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1 line-clamp-1">
                      {section.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {section.steps.length}
                    </Badge>
                  </div>
                  
                  {expandedSections.has(section.id) && (
                    <div className="ml-6 space-y-1 border-l-2 border-border/50 pl-2">
                      {section.steps.map((step) => (
                        <div
                          key={step.id}
                          onClick={() => {
                            setSelectedSectionId(section.id);
                            setSelectedStepId(step.id);
                          }}
                          className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                            selectedStepId === step.id
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <div className="font-medium line-clamp-1">{step.name}</div>
                          {step.description && (
                            <div className="text-xs opacity-70 line-clamp-1 mt-0.5">
                              {step.description}
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          addStepToSection(section.id);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Novo Passo
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <Button className="w-full gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {!selectedSection || !selectedStep ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Selecione uma seção e passo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ou adicione uma nova seção para começar
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Section & Step Header */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome da Seção</Label>
                        <Input
                          value={selectedSection.name}
                          onChange={(e) => updateSection(selectedSection.id, "name", e.target.value)}
                          className="mt-1 font-semibold text-lg"
                          placeholder="Nome da seção..."
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nome do Passo</Label>
                      <Input
                        value={selectedStep.name}
                        onChange={(e) => updateStep(selectedSection.id, selectedStep.id, "name", e.target.value)}
                        className="mt-1 font-medium"
                        placeholder="Nome do passo..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Descrição</Label>
                      <Textarea
                        value={selectedStep.description || ""}
                        onChange={(e) => updateStep(selectedSection.id, selectedStep.id, "description", e.target.value)}
                        className="mt-1"
                        placeholder="Descreva o objetivo deste passo..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Excerpts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Trechos do Diálogo</h3>
                <Button
                  size="sm"
                  onClick={() => addExcerptToStep(selectedSection.id, selectedStep.id)}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Adicionar Trecho
                </Button>
              </div>

              {selectedStep.excerpts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum trecho ainda
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addExcerptToStep(selectedSection.id, selectedStep.id)}
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Primeiro Trecho
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                selectedStep.excerpts.map((excerpt, index) => (
                  <Card key={excerpt.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          {excerpt.label}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteExcerpt(selectedSection.id, selectedStep.id, excerpt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome do Trecho</Label>
                        <Input
                          value={excerpt.label}
                          onChange={(e) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "label", e.target.value)}
                          className="mt-1"
                          placeholder="Ex: Trecho 1"
                        />
                      </div>

                      <Separator />

                      {/* Professional Statement */}
                      <div className="space-y-3 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Enunciado do Profissional
                          </span>
                        </div>
                        <div>
                          <Label className="text-xs">O que o profissional deve dizer</Label>
                          <Textarea
                            value={excerpt.expectedStatement}
                            onChange={(e) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "expectedStatement", e.target.value)}
                            className="mt-1 bg-white dark:bg-slate-950"
                            placeholder="Digite o que o profissional deve dizer..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Tipo de Enunciação</Label>
                            <Select
                              value={excerpt.statementEnunciationType}
                              onValueChange={(value) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "statementEnunciationType", value)}
                            >
                              <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
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
                          <div>
                            <Label className="text-xs">Método de Comparação</Label>
                            <Select
                              value={excerpt.statementComparisonMethod}
                              onValueChange={(value) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "statementComparisonMethod", value)}
                            >
                              <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
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
                      </div>

                      {/* Donor Response */}
                      <div className="space-y-3 p-4 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            Resposta Esperada do Doador
                          </span>
                        </div>
                        <div>
                          <Label className="text-xs">O que o doador deve responder</Label>
                          <Textarea
                            value={excerpt.expectedResponse}
                            onChange={(e) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "expectedResponse", e.target.value)}
                            className="mt-1 bg-white dark:bg-slate-950"
                            placeholder="Digite a resposta esperada do doador..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Tipo de Enunciação</Label>
                            <Select
                              value={excerpt.responseEnunciationType}
                              onValueChange={(value) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "responseEnunciationType", value)}
                            >
                              <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
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
                          <div>
                            <Label className="text-xs">Método de Comparação</Label>
                            <Select
                              value={excerpt.responseComparisonMethod}
                              onValueChange={(value) => updateExcerpt(selectedSection.id, selectedStep.id, excerpt.id, "responseComparisonMethod", value)}
                            >
                              <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Quick Reference */}
      <div className="w-80 border-l bg-card/50 backdrop-blur-sm overflow-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Referência Rápida</h3>
          <p className="text-xs text-muted-foreground mt-1">Tipos e métodos</p>
        </div>
        
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Tipos de Enunciação</h4>
              {enunciationTypes.map((type) => (
                <Card key={type.value}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{type.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {type.value === "ExplicitAnswer" && "Informação dita explicitamente"}
                      {type.value === "ComplementaryAnswer" && "Conteúdo + complemento"}
                      {type.value === "ConfirmationAnswer" && "Confirmação simples"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Métodos de Comparação</h4>
              {comparisonMethods.map((method) => (
                <Card key={method.value}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{method.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {method.value === "ExactMatch" && "Igualdade literal"}
                      {method.value === "PartialMatch" && "Pequenas divergências ok"}
                      {method.value === "SemanticMatch" && "Equivalência semântica"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
