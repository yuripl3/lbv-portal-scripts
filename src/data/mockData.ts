export interface Company {
  id: string;
  name: string;
  scriptTypes: string[];
  scripts: (Script & { versions: ScriptVersion[] })[];
}

export interface Script {
  id: string;
  companyId: string;
  // Convenience denormalized name for display without lookup
  companyName?: string;
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
  // Estrutura do script nesta versão
  structure: Section[];
}

export interface Section {
  id: string;
  name: string;
  // Simplificado: uma seção contém diretamente seus trechos (sem múltiplos passos)
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

// NOTE: `companies` é definido DEPOIS de `scriptStructure` para evitar 'used before declaration'.

// Função utilitária para deep clone simples
const cloneStructure = (base: Section[]): Section[] =>
  JSON.parse(JSON.stringify(base));

// Estrutura base (poderia ser expandida futuramente)
export const scriptStructure: Section[] = [
  {
    id: "s1",
    name: "1. Abertura e Consentimento",
    excerpts: [
      {
        id: "s1p1e1",
        label: "Trecho 1.1",
        expectedStatement:
          "Informar que a ligação está sendo gravada e pedir consentimento",
        expectedResponse: "Sim, autorizo a gravação",
        enunciationType: "ConfirmationAnswer",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
  {
    id: "s2",
    name: "2. Identificação Agente/Instituição",
    excerpts: [
      {
        id: "s2p1e1",
        label: "Trecho 2.1",
        expectedStatement: "Operador se apresenta e cita a instituição",
        expectedResponse: "Nome completo do operador e nome da empresa",
        enunciationType: "Explicit",
        comparisonMethod: "PartialMatch",
      },
    ],
  },
  {
    id: "s3",
    name: "3. Canal de Contato Institucional",
    excerpts: [
      {
        id: "s3p1e1",
        label: "Trecho 3.1",
        expectedStatement: "Informar canal de contato 0800 055 50 99",
        expectedResponse: "Cliente confirma recebimento da informação",
        enunciationType: "Explicit",
        comparisonMethod: "PartialMatch",
      },
    ],
  },
  {
    id: "s4",
    name: "4. Confirmação Nome Completo",
    excerpts: [
      {
        id: "s4p1e1",
        label: "Trecho 4.1",
        expectedStatement: "Solicitar nome completo do cliente",
        expectedResponse: "Cliente fala o nome completo",
        enunciationType: "Explicit",
        comparisonMethod: "PartialMatch",
      },
    ],
  },
  {
    id: "s5",
    name: "5. Confirmação Data de Nascimento",
    excerpts: [
      {
        id: "s5p1e1",
        label: "Trecho 5.1",
        expectedStatement: "Solicitar confirmação de data de nascimento",
        expectedResponse: "Cliente confirma data de nascimento",
        enunciationType: "Explicit",
        comparisonMethod: "ExactMatch",
      },
    ],
  },
  {
    id: "s6",
    name: "6. Captura CPF (opcional)",
    excerpts: [
      {
        id: "s6p1e1",
        label: "Trecho 6.1",
        expectedStatement: "Solicitar CPF do cliente",
        expectedResponse: "Cliente fala CPF completo",
        enunciationType: "Explicit",
        comparisonMethod: "ExactMatch",
      },
    ],
  },
  {
    id: "s7",
    name: "7. Captura Telefone com DDD",
    excerpts: [
      {
        id: "s7p1e1",
        label: "Trecho 7.1",
        expectedStatement: "Solicitar número de telefone completo com DDD",
        expectedResponse: "Cliente informa telefone com DDD",
        enunciationType: "Explicit",
        comparisonMethod: "ExactMatch",
      },
    ],
  },
  {
    id: "s8",
    name: "8. Confirmação Operadora Vivo",
    excerpts: [
      {
        id: "s8p1e1",
        label: "Trecho 8.1",
        expectedStatement: "Confirmar que a linha é da operadora Vivo",
        expectedResponse: "Sim, é Vivo",
        enunciationType: "ConfirmationAnswer",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
  {
    id: "s9",
    name: "9. Confirmação Pós-Paga",
    excerpts: [
      {
        id: "s9p1e1",
        label: "Trecho 9.1",
        expectedStatement: "Confirmar se o plano é pós-pago",
        expectedResponse: "Sim, é pós-pago / recebo fatura",
        enunciationType: "ConfirmationAnswer",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
  {
    id: "s10",
    name: "10. Verificação de Titularidade",
    excerpts: [
      {
        id: "s10p1e1",
        label: "Trecho 10.1",
        expectedStatement: "Confirmar titularidade da linha",
        expectedResponse: "Sim, sou titular / sou responsável",
        enunciationType: "ConfirmationAnswer",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
  {
    id: "s11",
    name: "11. Apresentação Valor de Doação",
    excerpts: [
      {
        id: "s11p1e1",
        label: "Trecho 11.1",
        expectedStatement: "Apresentar valor da doação em reais",
        expectedResponse: "Cliente reconhece o valor",
        enunciationType: "Explicit",
        comparisonMethod: "PartialMatch",
      },
    ],
  },
  {
    id: "s12",
    name: "12. Leitura Final (Readback)",
    excerpts: [
      {
        id: "s12p1e1",
        label: "Trecho 12.1",
        expectedStatement: "Realizar leitura final completa dos dados",
        expectedResponse: "Cliente confirma todos os dados",
        enunciationType: "ConfirmationAnswer",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
  {
    id: "s13",
    name: "13. Autorização Explícita",
    excerpts: [
      {
        id: "s13p1e1",
        label: "Trecho 13.1",
        expectedStatement: "Solicitar autorização explícita",
        expectedResponse: "Sim, autorizo / aceito",
        enunciationType: "ConfirmationAnswer",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
  {
    id: "s14",
    name: "14. Encerramento e Canais",
    excerpts: [
      {
        id: "s14p1e1",
        label: "Trecho 14.1",
        expectedStatement: "Agradecimento e informação de canais de contato",
        expectedResponse: "Cliente reconhece e encerra",
        enunciationType: "Explicit",
        comparisonMethod: "SemanticMatch",
      },
    ],
  },
];

// scripts definido abaixo usando a estrutura base

export const enunciationTypes = [
  { value: "Explicit", label: "Explícita" },
  { value: "ConfirmationAnswer", label: "Confirmação" },
];

export const comparisonMethods = [
  { value: "ExactMatch", label: "Igualdade Exata" },
  { value: "PartialMatch", label: "Equivalência Parcial" },
  { value: "SemanticMatch", label: "Equivalência Semântica" },
];

// (bloco scriptStructure detalhado removido para evitar duplicação)

// A lista global de versões foi incorporada em cada Script.

// Definição das companhias (após scriptStructure e clone util):
export const companies: Company[] = [
  {
    id: "vivo",
    name: "Vivo",
    scriptTypes: ["Prospecção", "Avulso"],
    scripts: [
      {
        id: "vivo_prospeccao",
        companyId: "vivo",
        companyName: "Vivo",
        type: "Prospecção",
        name: "VIVO PROSPECÇÃO",
        description: "Script completo de prospecção para operadora Vivo",
        activeVersion: "v1.0",
        status: "Ativo",
        lastModified: "2025-01-20",
        versions: [
          {
            version: "v2.0",
            state: "Ativa",
            date: "2025-01-10",
            notes: "Ajustes na seção de fechamento",
            structure: cloneStructure(scriptStructure),
          },
          {
            version: "v1.2",
            state: "Publicada",
            date: "2024-12-15",
            notes: "Revisão de conformidade LGPD",
            structure: cloneStructure(scriptStructure),
          },
          {
            version: "v1.1",
            state: "Publicada",
            date: "2024-11-20",
            notes: "Melhorias no script de abertura",
            structure: cloneStructure(scriptStructure),
          },
          {
            version: "v1.0",
            state: "Publicada",
            date: "2024-10-01",
            notes: "Versão inicial aprovada",
            structure: cloneStructure(scriptStructure),
          },
          {
            version: "v0.9",
            state: "Rascunho",
            date: "2024-09-15",
            notes: "Versão de testes internos",
            structure: cloneStructure(scriptStructure),
          },
        ],
      },
      {
        id: "vivo_avulso",
        companyId: "vivo",
        companyName: "Vivo",
        type: "Avulso",
        name: "SCRIPT VIVO AVULSO",
        description: "Script de contato avulso para operadora Vivo",
        activeVersion: "v1.0",
        status: "Ativo",
        lastModified: "2025-01-18",
        versions: [
          {
            version: "v1.0",
            state: "Ativa",
            date: "2025-01-18",
            notes: "Estrutura inicial",
            structure: cloneStructure(scriptStructure),
          },
        ],
      },
    ],
  },
  {
    id: "claro",
    name: "Claro",
    scriptTypes: ["Prospecção"],
    scripts: [
      {
        id: "claro_prospeccao",
        companyId: "claro",
        companyName: "Claro",
        type: "Prospecção",
        name: "SCRIPT CLARO PROSPECÇÃO",
        description: "Script completo de prospecção para operadora Claro",
        activeVersion: "v1.0",
        status: "Ativo",
        lastModified: "2025-01-15",
        versions: [
          {
            version: "v1.0",
            state: "Ativa",
            date: "2025-01-15",
            notes: "Estrutura inicial",
            structure: cloneStructure(scriptStructure),
          },
        ],
      },
    ],
  },
];

// Flatten convenience export (optional). Keeps backwards-compat for some consumers.
export const scripts: (Script & { versions: ScriptVersion[] })[] =
  companies.flatMap((c) =>
    c.scripts.map((s) => ({
      ...s,
      companyId: s.companyId || c.id,
      companyName: s.companyName || c.name,
    }))
  );

export const enunciationCatalog = [
  {
    name: "Explicit",
    description: "Informação dita explicitamente",
    example: "CPF dígito a dígito",
  },
  {
    name: "ConfirmationAnswer",
    description: "Confirmação simples",
    example: "sim / não",
  },
];

// A lista global de versões foi incorporada em cada Script.
// Catálogo de métodos de comparação utilizados para validar respostas.
export const comparisonCatalog = [
  {
    name: "ExactMatch",
    description:
      "Resposta deve ser exatamente igual ao esperado, sem variações.",
    example: "'123.456.789-00' corresponde exatamente ao CPF informado.",
  },
  {
    name: "PartialMatch",
    description:
      "Trechos ou partes principais devem aparecer, permitindo variações irrelevantes.",
    example: "Cliente diz: 'Meu CPF termina em 00' (contém parte principal).",
  },
  {
    name: "SemanticMatch",
    description:
      "Aceita sinônimos ou construções equivalentes com mesmo significado semântico.",
    example: "'Sim, é pós-pago' ≈ 'Tenho uma conta mensal'",
  },
];
