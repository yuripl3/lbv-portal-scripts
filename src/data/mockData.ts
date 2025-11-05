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
  { id: "vivo", name: "Vivo", scriptTypes: ["Prospecção", "Avulso"] },
  { id: "claro", name: "Claro", scriptTypes: ["Prospecção"] },
];

export const scripts: Script[] = [
  {
    id: "vivo_prospeccao",
    companyId: "vivo",
    type: "Prospecção",
    name: "SCRIPT VIVO PROSPECÇÃO",
    description: "Script completo de prospecção para operadora Vivo",
    activeVersion: "v1.0",
    status: "Ativo",
    lastModified: "2025-01-20",
  },
  {
    id: "vivo_avulso",
    companyId: "vivo",
    type: "Avulso",
    name: "SCRIPT VIVO AVULSO",
    description: "Script de contato avulso para operadora Vivo",
    activeVersion: "v1.0",
    status: "Ativo",
    lastModified: "2025-01-18",
  },
  {
    id: "claro_prospeccao",
    companyId: "claro",
    type: "Prospecção",
    name: "SCRIPT CLARO PROSPECÇÃO",
    description: "Script completo de prospecção para operadora Claro",
    activeVersion: "v1.0",
    status: "Ativo",
    lastModified: "2025-01-15",
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
    name: "1. Abertura e Consentimento",
    steps: [
      {
        id: "s1p1",
        name: "A ligação precisa informar que será gravada e obter um sim claro antes de coletar dados sensíveis.",
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
    name: "2. Identificação Agente/Instituição",
    steps: [
      {
        id: "s2p1",
        name: "O profissional deve dizer o próprio nome e citar a instituição.",
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
  {
    id: "s3",
    name: "3. Canal de Contato Institucional",
    steps: [
      {
        id: "s3p1",
        name: "Informar ao cliente o telefone 0800 055 50 99 para dúvidas futuras.",
        excerpts: [
          {
            id: "s3p1e1",
            label: "Trecho 3.1",
            expectedStatement: "Informar canal de contato 0800 055 50 99",
            expectedResponse: "Cliente confirma recebimento da informação",
            enunciationType: "ComplementaryAnswer",
            comparisonMethod: "PartialMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s4",
    name: "4. Confirmação Nome Completo",
    steps: [
      {
        id: "s4p1",
        name: "O cliente precisa falar o nome completo com suas próprias palavras.",
        excerpts: [
          {
            id: "s4p1e1",
            label: "Trecho 4.1",
            expectedStatement: "Solicitar nome completo do cliente",
            expectedResponse: "Cliente fala o nome completo",
            enunciationType: "ExplicitAnswer",
            comparisonMethod: "PartialMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s5",
    name: "5. Confirmação Data de Nascimento",
    steps: [
      {
        id: "s5p1",
        name: "O cliente deve confirmar a data de nascimento; não vale apenas o agente repetir.",
        excerpts: [
          {
            id: "s5p1e1",
            label: "Trecho 5.1",
            expectedStatement: "Solicitar confirmação de data de nascimento",
            expectedResponse: "Cliente confirma data de nascimento",
            enunciationType: "ExplicitAnswer",
            comparisonMethod: "ExactMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s6",
    name: "6. Captura CPF (opcional)",
    steps: [
      {
        id: "s6p1",
        name: "Pode ser solicitado, mas nunca aprovado apenas com dados do payload.",
        excerpts: [
          {
            id: "s6p1e1",
            label: "Trecho 6.1",
            expectedStatement: "Solicitar CPF do cliente",
            expectedResponse: "Cliente fala CPF completo",
            enunciationType: "ExplicitAnswer",
            comparisonMethod: "ExactMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s7",
    name: "7. Captura Telefone com DDD",
    steps: [
      {
        id: "s7p1",
        name: "Perguntar o número completo com DDD; número da operadora Vivo, 2+9 dígitos começando em 9.",
        excerpts: [
          {
            id: "s7p1e1",
            label: "Trecho 7.1",
            expectedStatement: "Solicitar número de telefone completo com DDD",
            expectedResponse: "Cliente informa telefone com DDD",
            enunciationType: "ExplicitAnswer",
            comparisonMethod: "ExactMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s8",
    name: "8. Confirmação Operadora Vivo",
    steps: [
      {
        id: "s8p1",
        name: "Obter confirmação de que a linha usada é da Vivo.",
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
    ],
  },
  {
    id: "s9",
    name: "9. Confirmação Pós-Paga",
    steps: [
      {
        id: "s9p1",
        name: "Buscar sinalização de fatura ou pagamento mensal.",
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
    ],
  },
  {
    id: "s10",
    name: "10. Verificação de Titularidade",
    steps: [
      {
        id: "s10p1",
        name: "Validar que o doador é o titular da linha ou entender o vínculo.",
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
    ],
  },
  {
    id: "s11",
    name: "11. Apresentação Valor de Doação",
    steps: [
      {
        id: "s11p1",
        name: "Informar claramente o valor em reais.",
        excerpts: [
          {
            id: "s11p1e1",
            label: "Trecho 11.1",
            expectedStatement: "Apresentar valor da doação em reais",
            expectedResponse: "Cliente reconhece o valor",
            enunciationType: "ComplementaryAnswer",
            comparisonMethod: "PartialMatch",
          },
        ],
      },
    ],
  },
  {
    id: "s12",
    name: "12. Leitura Final (Readback)",
    steps: [
      {
        id: "s12p1",
        name: "Reforçar operador, operadora, valor, recorrência e quando ocorre a cobrança.",
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
    ],
  },
  {
    id: "s13",
    name: "13. Autorização Explícita",
    steps: [
      {
        id: "s13p1",
        name: "Colher um aceite direto do cliente para a doação.",
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
    ],
  },
  {
    id: "s14",
    name: "14. Encerramento e Canais",
    steps: [
      {
        id: "s14p1",
        name: "Agradecer e lembrar os contatos disponíveis.",
        excerpts: [
          {
            id: "s14p1e1",
            label: "Trecho 14.1",
            expectedStatement: "Agradecimento e informação de canais de contato",
            expectedResponse: "Cliente reconhece e encerra",
            enunciationType: "ComplementaryAnswer",
            comparisonMethod: "SemanticMatch",
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
