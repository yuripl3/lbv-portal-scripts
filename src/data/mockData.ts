export interface Company {
  id: string;
  name: string;
  scriptTypes: string[];
}

export interface Script {
  id: string;
  companyId: string;
  type: string;
  name: string;
  description: string;
  activeVersion: string;
  status: "Ativo" | "Inativo";
  lastModified: string;
}

export interface ScriptVersion {
  version: string;
  state: "Rascunho" | "Publicada" | "Ativa";
  date: string;
  notes: string;
}

export interface Section {
  id: string;
  name: string;
  steps: Step[];
}

export interface Step {
  id: string;
  name: string;
  excerpts: Excerpt[];
}

export interface Excerpt {
  id: string;
  label: string;
  expectedStatement: string;
  expectedResponse: string;
  enunciationType: string;
  comparisonMethod: string;
}

export const companies: Company[] = [
  { id: "alfa", name: "Companhia Alfa", scriptTypes: ["Prospecção", "Retenção"] },
  { id: "beta", name: "Companhia Beta", scriptTypes: ["Prospecção", "Cobrança"] },
];

export const scripts: Script[] = [
  {
    id: "a1",
    companyId: "alfa",
    type: "Prospecção",
    name: "Script A1 – Prospecção",
    description: "Abordagem inicial para novos clientes em potencial",
    activeVersion: "v1.2",
    status: "Ativo",
    lastModified: "2025-01-15",
  },
  {
    id: "a2",
    companyId: "alfa",
    type: "Prospecção",
    name: "Script A2 – Prospecção",
    description: "Abordagem alternativa para leads qualificados",
    activeVersion: "v1.0",
    status: "Inativo",
    lastModified: "2024-12-20",
  },
  {
    id: "a3",
    companyId: "alfa",
    type: "Retenção",
    name: "Script A3 – Retenção",
    description: "Manutenção de relacionamento com clientes ativos",
    activeVersion: "v2.0",
    status: "Ativo",
    lastModified: "2025-01-10",
  },
  {
    id: "b1",
    companyId: "beta",
    type: "Prospecção",
    name: "Script B1 – Prospecção",
    description: "Captação de novos clientes via telefone",
    activeVersion: "v1.1",
    status: "Ativo",
    lastModified: "2025-01-12",
  },
  {
    id: "b2",
    companyId: "beta",
    type: "Cobrança",
    name: "Script B2 – Cobrança",
    description: "Recuperação de valores em atraso",
    activeVersion: "v0.9",
    status: "Inativo",
    lastModified: "2024-11-30",
  },
];

export const enunciationTypes = [
  { value: "ExplicitAnswer", label: "ExplicitAnswer" },
  { value: "ComplementaryAnswer", label: "ComplementaryAnswer" },
  { value: "ConfirmationAnswer", label: "ConfirmationAnswer" },
];

export const comparisonMethods = [
  { value: "ExactMatch", label: "ExactMatch" },
  { value: "PartialMatch", label: "PartialMatch" },
  { value: "SemanticMatch", label: "SemanticMatch" },
];

export const scriptStructure: Section[] = [
  {
    id: "s1",
    name: "Abertura",
    steps: [
      {
        id: "s1p1",
        name: "Consentimento",
        excerpts: [
          {
            id: "s1p1e1",
            label: "Trecho 1.1",
            expectedStatement: "Informar que a ligação está sendo gravada e pedir consentimento",
            expectedResponse: "Sim, autorizo a gravação",
            enunciationType: "ConfirmationAnswer",
            comparisonMethod: "SemanticMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s2",
    name: "Identificação",
    steps: [
      {
        id: "s2p1",
        name: "Nome e instituição",
        excerpts: [
          {
            id: "s2p1e1",
            label: "Trecho 2.1",
            expectedStatement: "Profissional se apresenta e cita a instituição",
            expectedResponse: "Nome completo do profissional e nome da empresa",
            enunciationType: "ExplicitAnswer",
            comparisonMethod: "PartialMatch",
          },
        ],
      },
    ],
  },
];

export const versions: ScriptVersion[] = [
  { version: "v2.0", state: "Ativa", date: "2025-01-10", notes: "Ajustes na seção de fechamento" },
  { version: "v1.2", state: "Publicada", date: "2024-12-15", notes: "Revisão de conformidade LGPD" },
  { version: "v1.1", state: "Publicada", date: "2024-11-20", notes: "Melhorias no script de abertura" },
  { version: "v1.0", state: "Publicada", date: "2024-10-01", notes: "Versão inicial aprovada" },
  { version: "v0.9", state: "Rascunho", date: "2024-09-15", notes: "Versão de testes internos" },
];

export const enunciationCatalog = [
  {
    name: "ExplicitAnswer",
    description: "Informação dita explicitamente",
    example: "CPF dígito a dígito",
  },
  {
    name: "ComplementaryAnswer",
    description: "Conteúdo + complemento",
    example: "15 reais",
  },
  {
    name: "ConfirmationAnswer",
    description: "Confirmação simples",
    example: "sim / não",
  },
];

export const comparisonCatalog = [
  {
    name: "ExactMatch",
    description: "Igualdade literal",
    example: "sim ≠ aham",
  },
  {
    name: "PartialMatch",
    description: "Pequenas divergências",
    example: "Adalberto vs Adalberto C. Pereira",
  },
  {
    name: "SemanticMatch",
    description: "Equivalência semântica",
    example: "sim / positivo / correto",
  },
];
