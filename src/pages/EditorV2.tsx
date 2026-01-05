import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  scripts,
  enunciationTypes,
  comparisonMethods,
  enunciationCatalog,
  comparisonCatalog,
} from "@/data/mockData";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TagInput from "@/components/ui/tag-input";
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
import RichTextarea, {
  RichTextareaHandle,
} from "@/components/ui/rich-textarea";
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
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loadSections, saveSections } from "@/data/mockStore";

interface Excerpt {
  id: string;
  label: string;
  expectedStatement: string;
  expectedResponse: string;
  statementEnunciationType: string;
  responseEnunciationType: string;
  statementComparisonMethod: string;
  responseComparisonMethod: string;
  requiresResponse: boolean;
  operatorKeywords: string[];
  donorKeywords: string[];
}

interface Section {
  id: string;
  name: string;
  excerpts: Excerpt[];
}

export default function EditorV2() {
  const { scriptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setSelectedScript, setSelectedVersion } = useAppContext();
  const isNewScript = scriptId === "new";
  const script = scripts.find((s) => s.id === scriptId);

  const selectedVersion = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const versionParam = params.get("version");
    // Fallback: custom scripts (não presentes no seed) usam versão da URL
    if (!script || !script.versions?.length) {
      if (versionParam) {
        return {
          version: versionParam,
          state: "Ativa",
          date: new Date().toISOString(),
          notes: "",
          structure: [],
        } as any;
      }
      return undefined;
    }
    if (versionParam) {
      const found = script.versions.find((v) => v.version === versionParam);
      if (found) return found;
    }
    const active = script.versions.find(
      (v) => v.version === script.activeVersion || v.state === "Ativa"
    );
    if (active) return active;
    const sorted = [...script.versions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  }, [script, location.search]);

  const baseStructure = useMemo(
    () => selectedVersion?.structure ?? [],
    [selectedVersion]
  );

  // Ensure global selectedScript follows the route
  useEffect(() => {
    setSelectedScript(scriptId ?? null);
  }, [scriptId, setSelectedScript]);

  // Persist version to context when present in URL (do not clear otherwise)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get("version");
    if (v) setSelectedVersion(v);
  }, [location.search, setSelectedVersion]);

  // Quick Reference open state, controlled by URL param ?ref=1
  const [refOpen, setRefOpen] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setRefOpen(params.get("ref") === "1");
  }, [location.search]);

  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  // Track focused textarea to allow variable inserts
  const [focusedField, setFocusedField] = useState<{
    excerptId: string;
    field: "expectedStatement" | "expectedResponse";
  } | null>(null);

  // Textarea refs per excerpt for cursor-aware insertions
  const statementRefs = useRef<Record<string, RichTextareaHandle | null>>({});
  const responseRefs = useRef<Record<string, RichTextareaHandle | null>>({});

  // Variable catalog (front does not apply filters)
  const operatorVars = [{ key: "NomeProfissional", label: "Nome do Operador" }];
  const donorVars = [
    { key: "NomePessoa", label: "Nome do Doador" },
    { key: "DataNascimento", label: "Data de Nascimento" },
    { key: "Email", label: "Email" },
    { key: "Mensalidade", label: "Mensalidade" },
    { key: "Documento", label: "Documento" },
    { key: "Endereco", label: "Endereço" },
    { key: "ValorDoacao", label: "Valor da Doação" },
    { key: "DocumentoTitular", label: "Documento do Titular" },
    { key: "TelefoneComDDD", label: "Telefone (com DDD)" },
  ];

  const allVars = useMemo(() => [...operatorVars, ...donorVars], []);

  type FieldName = "expectedStatement" | "expectedResponse";
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, Partial<Record<FieldName, string>>>
  >({});

  const validateBrackets = (
    excerptId: string,
    field: FieldName,
    value: string
  ) => {
    const allowed = new Set(allVars.map((v) => v.label.toLowerCase()));
    const re = /\[([^\[\]\n]+)\]/g; // captures [ ... ] without nesting/newlines
    let match: RegExpExecArray | null;
    let invalid = "";
    while ((match = re.exec(value)) !== null) {
      const content = match[1].trim().toLowerCase();
      if (!allowed.has(content)) {
        invalid = match[1];
        break;
      }
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      const current = { ...(next[excerptId] ?? {}) };
      if (invalid) {
        current[
          field
        ] = `Texto entre colchetes é reservado para variáveis. "${invalid}" não corresponde a nenhuma variável.`;
      } else {
        delete current[field];
      }
      next[excerptId] = current;
      return next;
    });
  };

  // Contextual variable suggestion opened by typing "["
  const [varSuggest, setVarSuggest] = useState<{
    open: boolean;
    excerptId: string | null;
    field: "expectedStatement" | "expectedResponse" | null;
    startIndex: number; // index of the opening '[' in the current value
    query: string;
    highlightedIndex: number;
    x: number;
    y: number;
  }>({
    open: false,
    excerptId: null,
    field: null,
    startIndex: -1,
    query: "",
    highlightedIndex: 0,
    x: 0,
    y: 0,
  });

  const closeVarSuggest = () =>
    setVarSuggest({
      open: false,
      excerptId: null,
      field: null,
      startIndex: -1,
      query: "",
      highlightedIndex: 0,
      x: 0,
      y: 0,
    });

  const computeCaretPosition = (ta: HTMLTextAreaElement, index?: number) => {
    const pos = index ?? ta.selectionStart ?? 0;
    const style = window.getComputedStyle(ta);
    const mirror = document.createElement("div");
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.overflow = "hidden";
    mirror.style.top = "0";
    mirror.style.left = "0";
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontWeight = style.fontWeight as string;
    mirror.style.fontStyle = style.fontStyle;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.textTransform = style.textTransform;
    mirror.style.textAlign = style.textAlign as string;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.boxSizing = style.boxSizing as string;
    mirror.style.width = ta.clientWidth + "px";
    mirror.style.height = "auto";

    const text = ta.value.substring(0, pos);
    mirror.textContent = text;
    const span = document.createElement("span");
    span.textContent = "\u200b"; // zero-width space
    mirror.appendChild(span);
    document.body.appendChild(mirror);

    const lineHeight = parseFloat(style.lineHeight || "16");
    const left = span.offsetLeft; // relative to mirror (includes padding)
    const top = span.offsetTop; // relative to mirror (includes padding, wraps)

    document.body.removeChild(mirror);

    return { left, top, lineHeight };
  };

  const updateSuggestPosition = (
    excerptId: string,
    field: "expectedStatement" | "expectedResponse"
  ) => {
    const refs = field === "expectedStatement" ? statementRefs : responseRefs;
    const handle = refs.current[excerptId];
    if (!handle) return;
    const rect = handle.getCaretClientRect();
    if (!rect) return;
    const crect = handle.getContainerRect();
    const x = crect ? rect.left - crect.left : rect.left;
    const y = crect ? rect.bottom - crect.top : rect.bottom;
    setVarSuggest((s) => ({ ...s, x, y }));
  };

  const completeVarInsertion = (
    excerptId: string,
    field: "expectedStatement" | "expectedResponse",
    label: string
  ) => {
    const sec = sections.find((s) => s.id === selectedSectionId);
    const ex = sec?.excerpts.find((x) => x.id === excerptId);
    const value = ex
      ? field === "expectedStatement"
        ? ex.expectedStatement
        : ex.expectedResponse
      : "";
    const token = makeToken(label);
    const startIdx =
      varSuggest.startIndex >= 0 ? varSuggest.startIndex : value.length;
    const caret = startIdx + 1 + (varSuggest.query?.length || 0);
    const before = value.slice(0, startIdx);
    const after = value.slice(caret);
    const nextVal = `${before}${token}${after}`;
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        excerpts: section.excerpts.map((e) =>
          e.id === excerptId ? ({ ...e, [field]: nextVal } as Excerpt) : e
        ),
      }))
    );
    closeVarSuggest();
  };

  const handleTextareaKeyDown = (
    excerptId: string,
    field: "expectedStatement" | "expectedResponse",
    e: KeyboardEvent<any>
  ) => {
    if (e.key === "[") {
      const refs = field === "expectedStatement" ? statementRefs : responseRefs;
      const handle = refs.current[excerptId];
      const caret = handle?.getCaretIndex() ?? 0;
      setVarSuggest({
        open: true,
        excerptId,
        field,
        startIndex: caret,
        query: "",
        highlightedIndex: 0,
        x: 0,
        y: 0,
      });
      // Wait for the '[' to be inserted, then measure position
      setTimeout(() => updateSuggestPosition(excerptId, field), 0);
      return;
    }

    if (
      varSuggest.open &&
      varSuggest.excerptId === excerptId &&
      varSuggest.field === field
    ) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeVarSuggest();
        return;
      }
      const filtered = allVars.filter((v) =>
        v.label.toLowerCase().includes(varSuggest.query.toLowerCase())
      );
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = filtered.length
          ? (varSuggest.highlightedIndex + 1) % filtered.length
          : 0;
        setVarSuggest((s) => ({ ...s, highlightedIndex: next }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = filtered.length
          ? (varSuggest.highlightedIndex - 1 + filtered.length) %
            filtered.length
          : 0;
        setVarSuggest((s) => ({ ...s, highlightedIndex: next }));
        return;
      }
      if (e.key === "Enter") {
        if (filtered.length) {
          e.preventDefault();
          const pick =
            filtered[
              Math.min(varSuggest.highlightedIndex, filtered.length - 1)
            ];
          completeVarInsertion(excerptId, field, pick.label);
          return;
        }
      }
    }

    // On closing bracket, validate contents inside brackets
    if (e.key === "]") {
      setTimeout(() => {
        const sec = sections.find((s) => s.id === selectedSectionId);
        const ex = sec?.excerpts.find((x) => x.id === excerptId);
        const val = ex
          ? field === "expectedStatement"
            ? ex.expectedStatement
            : ex.expectedResponse
          : "";
        validateBrackets(excerptId, field, val);
      }, 0);
    }
  };

  const handleTextareaChange = (
    excerptId: string,
    field: "expectedStatement" | "expectedResponse",
    e: ChangeEvent<any>
  ) => {
    const val = e.target.value;
    updateExcerpt(selectedSectionId as string, excerptId, field, val);
    // Validate existing bracketed tokens in the value
    validateBrackets(excerptId, field, val);

    // Update suggestion query if it's open for this field/excerpt
    if (
      varSuggest.open &&
      varSuggest.excerptId === excerptId &&
      varSuggest.field === field
    ) {
      const refs = field === "expectedStatement" ? statementRefs : responseRefs;
      const handle = refs.current[excerptId];
      const caret = handle?.getCaretIndex() ?? val.length;
      const start = varSuggest.startIndex;
      // If the original '[' was deleted or moved, close the menu
      if (start < 0 || start >= val.length || val.charAt(start) !== "[") {
        closeVarSuggest();
        return;
      }
      if (start < 0 || caret < start) {
        closeVarSuggest();
        return;
      }
      const slice = val.slice(start + 1, caret); // text after "["
      if (slice.includes("]") || slice.includes("\n")) {
        closeVarSuggest();
        return;
      }
      setVarSuggest((s) => ({ ...s, query: slice }));
      // Update position to follow the caret as user types
      setTimeout(() => updateSuggestPosition(excerptId, field), 0);
    }

    // If menu is not open, but there's an unmatched '[' before the caret,
    // (e.g., user deleted the closing bracket) then auto-open the suggestion.
    if (
      !varSuggest.open ||
      varSuggest.excerptId !== excerptId ||
      varSuggest.field !== field
    ) {
      const refs2 =
        field === "expectedStatement" ? statementRefs : responseRefs;
      const handle2 = refs2.current[excerptId];
      const caret2 = handle2?.getCaretIndex() ?? val.length;
      const openIdx = val.lastIndexOf("[", Math.max(0, caret2 - 1));
      if (openIdx >= 0) {
        const closeIdx = val.indexOf("]", openIdx);
        if (closeIdx === -1 || closeIdx > caret2) {
          const q = val.slice(openIdx + 1, caret2);
          setVarSuggest({
            open: true,
            excerptId,
            field,
            startIndex: openIdx,
            query: q,
            highlightedIndex: 0,
            x: 0,
            y: 0,
          });
          setTimeout(() => updateSuggestPosition(excerptId, field), 0);
        }
      }
    }
  };

  const handleRichChange = (
    excerptId: string,
    field: "expectedStatement" | "expectedResponse",
    val: string
  ) => {
    updateExcerpt(selectedSectionId as string, excerptId, field, val);
    validateBrackets(excerptId, field, val);

    if (
      varSuggest.open &&
      varSuggest.excerptId === excerptId &&
      varSuggest.field === field
    ) {
      const refs = field === "expectedStatement" ? statementRefs : responseRefs;
      const handle = refs.current[excerptId];
      const caret = handle?.getCaretIndex() ?? val.length;
      const start = varSuggest.startIndex;
      if (start < 0 || start >= val.length || val.charAt(start) !== "[") {
        closeVarSuggest();
        return;
      }
      if (start < 0 || caret < start) {
        closeVarSuggest();
        return;
      }
      const slice = val.slice(start + 1, caret);
      if (slice.includes("]") || slice.includes("\n")) {
        closeVarSuggest();
        return;
      }
      setVarSuggest((s) => ({ ...s, query: slice }));
      setTimeout(() => updateSuggestPosition(excerptId, field), 0);
    }

    if (
      !varSuggest.open ||
      varSuggest.excerptId !== excerptId ||
      varSuggest.field !== field
    ) {
      const refs2 =
        field === "expectedStatement" ? statementRefs : responseRefs;
      const handle2 = refs2.current[excerptId];
      const caret2 = handle2?.getCaretIndex() ?? val.length;
      const openIdx = val.lastIndexOf("[", Math.max(0, caret2 - 1));
      if (openIdx >= 0) {
        const closeIdx = val.indexOf("]", openIdx);
        if (closeIdx === -1 || closeIdx > caret2) {
          const q = val.slice(openIdx + 1, caret2);
          setVarSuggest({
            open: true,
            excerptId,
            field,
            startIndex: openIdx,
            query: q,
            highlightedIndex: 0,
            x: 0,
            y: 0,
          });
          setTimeout(() => updateSuggestPosition(excerptId, field), 0);
        }
      }
    }
  };

  // Token format: no outer padding inside brackets, e.g., [Nome do Doador]
  const makeToken = (text: string) => `[${text}]`;

  const insertVariableAtCursor = (
    excerptId: string,
    field: "expectedStatement" | "expectedResponse",
    friendlyText: string
  ) => {
    const refs = field === "expectedStatement" ? statementRefs : responseRefs;
    const handle = refs.current[excerptId];
    if (handle) {
      handle.insertVariable(friendlyText);
      return;
    }
    // Fallback: just append the token to state
    const token = makeToken(friendlyText);
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        excerpts: section.excerpts.map((ex) => {
          if (ex.id !== excerptId) return ex;
          const currentVal =
            field === "expectedStatement"
              ? ex.expectedStatement
              : ex.expectedResponse;
          return { ...ex, [field]: `${currentVal || ""}${token}` } as Excerpt;
        }),
      }))
    );
  };

  type SourceExcerpt = {
    id: string;
    label: string;
    expectedStatement: string;
    expectedResponse: string;
    enunciationType: string;
    comparisonMethod: string;
  };
  type SourceSection = {
    id: string;
    name: string;
    excerpts: SourceExcerpt[];
  };

  useEffect(() => {
    if (isNewScript) {
      setSections([]);
      return;
    }
    // Para novo script, começamos vazio, mas tentamos carregar um draft salvo
    const next = (baseStructure as SourceSection[]).map((s) => ({
      id: s.id,
      name: s.name,
      excerpts: (s.excerpts ?? []).map((e) => ({
        id: e.id,
        label: e.label,
        expectedStatement: e.expectedStatement,
        expectedResponse: e.expectedResponse,
        statementEnunciationType: e.enunciationType,
        responseEnunciationType: e.enunciationType,
        statementComparisonMethod: e.comparisonMethod,
        responseComparisonMethod: e.comparisonMethod,
        requiresResponse: true,
        operatorKeywords: [],
        donorKeywords: [],
      })),
    }));
    setSections(next);
  }, [isNewScript, baseStructure]);

  // Load persisted overrides (simulated file DB) if available
  useEffect(() => {
    if (!scriptId) return;
    const params = new URLSearchParams(location.search);
    const versionParam = params.get("version") || undefined;
    const versionToUse =
      scriptId === "new" ? "draft" : selectedVersion?.version || versionParam;
    if (!versionToUse) return;
    let cancelled = false;
    (async () => {
      try {
        const persisted = await loadSections(scriptId, versionToUse);
        if (!cancelled && Array.isArray(persisted) && persisted.length > 0) {
          setSections(persisted as Section[]);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scriptId, selectedVersion?.version]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  useEffect(() => {
    setExpandedSections(new Set(sections.map((s) => s.id)));
    // Ensure a section is selected
    if (sections.length > 0) {
      if (
        !selectedSectionId ||
        !sections.some((s) => s.id === selectedSectionId)
      ) {
        setSelectedSectionId(sections[0].id);
      }
    } else {
      setSelectedSectionId(null);
    }
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const createDefaultExcerpt = (sectionId: string, label: string): Excerpt => {
    const id = `${sectionId}-e-${Date.now()}`;
    return {
      id,
      label,
      expectedStatement: "",
      expectedResponse: "",
      statementEnunciationType: "Explicit",
      responseEnunciationType: "Explicit",
      statementComparisonMethod: "ExactMatch",
      responseComparisonMethod: "ExactMatch",
      requiresResponse: true,
      operatorKeywords: [],
      donorKeywords: [],
    };
  };

  const addNewSection = () => {
    const newId = `s${Date.now()}`;
    const newSection: Section = {
      id: newId,
      name: "Nova Seção",
      excerpts: [createDefaultExcerpt(newId, "Trecho 1")],
    };
    setSections([...sections, newSection]);
    setExpandedSections((prev) => new Set([...prev, newId]));
    setSelectedSectionId(newId);
    setTimeout(() => {
      const headerEl = document.getElementById(`section-header-${newId}`);
      const blockEl = document.getElementById(`section-block-${newId}`);
      let sidebarViewport: HTMLElement | null = null;
      if (headerEl) {
        sidebarViewport = headerEl.closest(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement | null;
        if (!sidebarViewport) {
          const sidebarRoot = headerEl.closest(".w-72");
          sidebarViewport = (sidebarRoot?.querySelector(
            "[data-radix-scroll-area-viewport]"
          ) ?? null) as HTMLElement | null;
        }
      }
      if (sidebarViewport) {
        sidebarViewport.scrollTo({
          top: sidebarViewport.scrollHeight,
          behavior: "smooth",
        });
      }
      if (blockEl) {
        blockEl.classList.add("flash-highlight");
        setTimeout(() => blockEl.classList.remove("flash-highlight"), 1300);
      }
    }, 0);
    toast.success("Nova seção adicionada");
  };

  const addExcerptToSection = (sectionId: string) => {
    let newExcerptId: string | null = null;
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const newExcerpt = createDefaultExcerpt(
            sectionId,
            `Trecho ${section.excerpts.length + 1}`
          );
          newExcerptId = newExcerpt.id;
          return { ...section, excerpts: [...section.excerpts, newExcerpt] };
        }
        return section;
      })
    );
    setExpandedSections((prev) => new Set([...prev, sectionId]));
    setTimeout(() => {
      if (newExcerptId) {
        const sidebarEl = document.getElementById(
          `excerpt-link-${newExcerptId}`
        );
        if (sidebarEl) {
          sidebarEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          sidebarEl.classList.add("flash-highlight");
          setTimeout(() => sidebarEl.classList.remove("flash-highlight"), 1300);
        }
        const mainEl = document.getElementById(`excerpt-${newExcerptId}`);
        if (mainEl) {
          mainEl.scrollIntoView({ behavior: "smooth", block: "center" });
          mainEl.classList.add("flash-highlight");
          setTimeout(() => mainEl.classList.remove("flash-highlight"), 1300);
        }
      }
    }, 0);
    toast.success("Novo trecho adicionado");
  };

  const addExcerptBetween = (sectionId: string, afterExcerptId: string) => {
    let newExcerptId: string | null = null;
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        const idx = section.excerpts.findIndex((e) => e.id === afterExcerptId);
        if (idx === -1) return section;
        const insertIndex = idx + 1;
        const label = `Trecho ${insertIndex + 1}`;
        const newExcerpt = createDefaultExcerpt(sectionId, label);
        newExcerptId = newExcerpt.id;
        const nextExcerpts = [
          ...section.excerpts.slice(0, insertIndex),
          newExcerpt,
          ...section.excerpts.slice(insertIndex),
        ];
        return { ...section, excerpts: nextExcerpts };
      })
    );
    setExpandedSections((prev) => new Set([...prev, sectionId]));
    setTimeout(() => {
      if (newExcerptId) {
        const sidebarEl = document.getElementById(
          `excerpt-link-${newExcerptId}`
        );
        if (sidebarEl) {
          sidebarEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          sidebarEl.classList.add("flash-highlight");
          setTimeout(() => sidebarEl.classList.remove("flash-highlight"), 1300);
        }
        const mainEl = document.getElementById(`excerpt-${newExcerptId}`);
        if (mainEl) {
          mainEl.scrollIntoView({ behavior: "smooth", block: "center" });
          mainEl.classList.add("flash-highlight");
          setTimeout(() => mainEl.classList.remove("flash-highlight"), 1300);
        }
      }
    }, 0);
    toast.success("Novo trecho adicionado");
  };

  const addExcerptAtStart = (sectionId: string) => {
    let newExcerptId: string | null = null;
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        const label = `Trecho 1`;
        const newExcerpt = createDefaultExcerpt(sectionId, label);
        newExcerptId = newExcerpt.id;
        const nextExcerpts = [newExcerpt, ...section.excerpts];
        return { ...section, excerpts: nextExcerpts };
      })
    );
    setExpandedSections((prev) => new Set([...prev, sectionId]));
    setTimeout(() => {
      if (newExcerptId) {
        const sidebarEl = document.getElementById(
          `excerpt-link-${newExcerptId}`
        );
        if (sidebarEl) {
          sidebarEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          sidebarEl.classList.add("flash-highlight");
          setTimeout(() => sidebarEl.classList.remove("flash-highlight"), 1300);
        }
        const mainEl = document.getElementById(`excerpt-${newExcerptId}`);
        if (mainEl) {
          mainEl.scrollIntoView({ behavior: "smooth", block: "center" });
          mainEl.classList.add("flash-highlight");
          setTimeout(() => mainEl.classList.remove("flash-highlight"), 1300);
        }
      }
    }, 0);
    toast.success("Novo trecho adicionado");
  };

  const updateSection = <K extends keyof Section>(
    sectionId: string,
    field: K,
    value: Section[K]
  ) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
  };

  const updateExcerpt = <K extends keyof Excerpt>(
    sectionId: string,
    excerptId: string,
    field: K,
    value: Excerpt[K]
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          excerpts: section.excerpts.map((excerpt) =>
            excerpt.id === excerptId ? { ...excerpt, [field]: value } : excerpt
          ),
        };
      })
    );
  };

  const deleteExcerpt = (sectionId: string, excerptId: string) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          excerpts: section.excerpts.filter((e) => e.id !== excerptId),
        };
      })
    );
    toast.success("Trecho removido");
  };

  const handleSave = async () => {
    if (!scriptId) {
      toast.error("Script inválido");
      return;
    }
    const params = new URLSearchParams(location.search);
    const versionParam = params.get("version") || undefined;
    const versionToUse =
      scriptId === "new" ? "draft" : selectedVersion?.version || versionParam;
    if (!versionToUse) {
      toast.error("Versão inválida");
      return;
    }
    try {
      await saveSections(scriptId, versionToUse, sections);
      toast.success("Alterações salvas (simulado)");
    } catch (e) {
      toast.error("Falha ao salvar (simulado)");
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // TagInput handles parsing/adding terms; no string helpers needed here

  const getEnunciationLabel = (name: string) =>
    enunciationTypes.find((t) => t.value === name)?.label || name;
  const getComparisonLabel = (name: string) =>
    comparisonMethods.find((t) => t.value === name)?.label || name;

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] fade-in bg-background">
        {/* Left Sidebar */}
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
                  <div
                    key={section.id}
                    id={`section-block-${section.id}`}
                    className="space-y-1"
                  >
                    <div
                      id={`section-header-${section.id}`}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedSectionId === section.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
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
                        {section.excerpts.length}
                      </Badge>
                    </div>
                    {expandedSections.has(section.id) &&
                      section.excerpts?.length > 0 && (
                        <div
                          id={`section-list-${section.id}`}
                          className="ml-6 pl-3 border-l space-y-1"
                        >
                          {section.excerpts.map((excerpt) => (
                            <button
                              key={excerpt.id}
                              id={`excerpt-link-${excerpt.id}`}
                              className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted text-sm text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSectionId(section.id);
                                const el = document.getElementById(
                                  `excerpt-${excerpt.id}`
                                );
                                if (el) {
                                  el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                  el.classList.add("flash-highlight");
                                  setTimeout(
                                    () =>
                                      el.classList.remove("flash-highlight"),
                                    1000
                                  );
                                }
                              }}
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span className="line-clamp-1">
                                {excerpt.label}
                              </span>
                            </button>
                          ))}
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {!selectedSection ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Selecione uma seção
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ou adicione uma nova seção para começar
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-6xl mx-auto space-y-6">
              {/* Section Header */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Nome da Seção
                          </Label>
                          <Input
                            value={selectedSection.name}
                            onChange={(e) =>
                              updateSection(
                                selectedSection.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="mt-1 font-semibold text-lg"
                            placeholder="Nome da seção..."
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Excerpts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Trechos do Diálogo
                  </h3>
                  <div className="flex items-center gap-2" />
                </div>

                {selectedSection.excerpts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Nenhum trecho ainda
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addExcerptToSection(selectedSection.id)}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Primeiro Trecho
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Add-at-top button */}
                    <div className="py-2 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60"
                        onClick={() => addExcerptAtStart(selectedSection.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar trecho aqui
                      </Button>
                    </div>
                    {selectedSection.excerpts.map((excerpt, index) => (
                      <Fragment key={excerpt.id}>
                        <Card id={`excerpt-${excerpt.id}`} className="relative">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                {excerpt.label}
                              </CardTitle>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  deleteExcerpt(selectedSection.id, excerpt.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Nome do Trecho
                              </Label>
                              <Input
                                value={excerpt.label}
                                onChange={(e) =>
                                  updateExcerpt(
                                    selectedSection.id,
                                    excerpt.id,
                                    "label",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                                placeholder="Ex: Trecho 1"
                              />
                            </div>
                            <Separator />
                            {/* Operator Statement */}
                            <div className="space-y-3 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Enunciado do Operador
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">
                                    O que o operador deve dizer
                                  </Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px]"
                                      >
                                        Inserir variável
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64">
                                      <DropdownMenuLabel>
                                        Operador
                                      </DropdownMenuLabel>
                                      <DropdownMenuGroup>
                                        {operatorVars.map((v) => (
                                          <DropdownMenuItem
                                            key={`op-${v.key}`}
                                            onClick={() =>
                                              insertVariableAtCursor(
                                                excerpt.id,
                                                "expectedStatement",
                                                v.label
                                              )
                                            }
                                          >
                                            {v.label}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuGroup>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuLabel>
                                        Doador
                                      </DropdownMenuLabel>
                                      <DropdownMenuGroup>
                                        {donorVars.map((v) => (
                                          <DropdownMenuItem
                                            key={`do-${v.key}`}
                                            onClick={() =>
                                              insertVariableAtCursor(
                                                excerpt.id,
                                                "expectedStatement",
                                                v.label
                                              )
                                            }
                                          >
                                            {v.label}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="relative">
                                  <RichTextarea
                                    value={excerpt.expectedStatement}
                                    onChange={(next) =>
                                      handleRichChange(
                                        excerpt.id,
                                        "expectedStatement",
                                        next
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleTextareaKeyDown(
                                        excerpt.id,
                                        "expectedStatement",
                                        e
                                      )
                                    }
                                    ref={(el) =>
                                      (statementRefs.current[excerpt.id] = el)
                                    }
                                    onFocus={() =>
                                      setFocusedField({
                                        excerptId: excerpt.id,
                                        field: "expectedStatement",
                                      })
                                    }
                                    className={`mt-1 bg-white dark:bg-slate-950 ${
                                      fieldErrors[excerpt.id]?.expectedStatement
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : ""
                                    }`}
                                    placeholder="Digite o que o operador deve dizer..."
                                  />
                                  {fieldErrors[excerpt.id]
                                    ?.expectedStatement && (
                                    <p className="mt-1 text-xs text-destructive">
                                      {
                                        fieldErrors[excerpt.id]
                                          ?.expectedStatement
                                      }
                                    </p>
                                  )}
                                  {varSuggest.open &&
                                    varSuggest.excerptId === excerpt.id &&
                                    varSuggest.field ===
                                      "expectedStatement" && (
                                      <div
                                        className="absolute z-50 w-64 rounded-md border bg-popover text-popover-foreground shadow-md"
                                        style={{
                                          left: varSuggest.x,
                                          top: varSuggest.y,
                                        }}
                                      >
                                        <div className="p-2 text-xs text-muted-foreground">
                                          Variáveis
                                        </div>
                                        <div className="max-h-64 overflow-auto py-1">
                                          {allVars
                                            .filter((v) =>
                                              v.label
                                                .toLowerCase()
                                                .includes(
                                                  varSuggest.query.toLowerCase()
                                                )
                                            )
                                            .map((v, idx) => {
                                              const active =
                                                idx ===
                                                varSuggest.highlightedIndex;
                                              return (
                                                <div
                                                  key={`sugg-op-${excerpt.id}-${v.key}-${idx}`}
                                                  className={`px-2 py-1.5 text-sm cursor-pointer ${
                                                    active
                                                      ? "bg-accent text-accent-foreground"
                                                      : "hover:bg-accent hover:text-accent-foreground"
                                                  }`}
                                                  onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    completeVarInsertion(
                                                      excerpt.id,
                                                      "expectedStatement",
                                                      v.label
                                                    );
                                                  }}
                                                >
                                                  {v.label}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">
                                    Tipo de Enunciação
                                  </Label>
                                  <Select
                                    value={excerpt.statementEnunciationType}
                                    onValueChange={(value) =>
                                      updateExcerpt(
                                        selectedSection.id,
                                        excerpt.id,
                                        "statementEnunciationType",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {enunciationTypes.map((type) => (
                                        <SelectItem
                                          key={type.value}
                                          value={type.value}
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">
                                    Método de Comparação
                                  </Label>
                                  <Select
                                    value={excerpt.statementComparisonMethod}
                                    onValueChange={(value) =>
                                      updateExcerpt(
                                        selectedSection.id,
                                        excerpt.id,
                                        "statementComparisonMethod",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {comparisonMethods.map((method) => (
                                        <SelectItem
                                          key={method.value}
                                          value={method.value}
                                        >
                                          {method.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Palavras‑chave ou termos‑chave do Operador
                                  (opcional)
                                </Label>
                                <TagInput
                                  value={excerpt.operatorKeywords}
                                  onChange={(tags) =>
                                    updateExcerpt(
                                      selectedSection.id,
                                      excerpt.id,
                                      "operatorKeywords",
                                      tags
                                    )
                                  }
                                  placeholder="Digite e pressione enter, tab ou separe por vírgula. Ex.: todos os meses, reais"
                                  className="mt-1"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  Termos que devem estar presentes na
                                  transcrição do operador. Esses termos não são
                                  sensíveis a maiúsculas ou minúsculas.
                                </p>
                              </div>
                            </div>
                            {/* Donor Response */}
                            <div className="space-y-3 p-4 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                    Resposta Esperada do Doador
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor={`requires-response-${excerpt.id}`}
                                    className="text-xs text-muted-foreground cursor-pointer"
                                  >
                                    Resposta esperada?
                                  </Label>
                                  <Switch
                                    id={`requires-response-${excerpt.id}`}
                                    checked={excerpt.requiresResponse}
                                    onCheckedChange={(checked) =>
                                      updateExcerpt(
                                        selectedSection.id,
                                        excerpt.id,
                                        "requiresResponse",
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">
                                    O que o doador deve responder
                                  </Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px]"
                                        disabled={!excerpt.requiresResponse}
                                      >
                                        Inserir variável
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64">
                                      <DropdownMenuLabel>
                                        Operador
                                      </DropdownMenuLabel>
                                      <DropdownMenuGroup>
                                        {operatorVars.map((v) => (
                                          <DropdownMenuItem
                                            key={`op2-${v.key}`}
                                            onClick={() =>
                                              insertVariableAtCursor(
                                                excerpt.id,
                                                "expectedResponse",
                                                v.label
                                              )
                                            }
                                          >
                                            {v.label}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuGroup>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuLabel>
                                        Doador
                                      </DropdownMenuLabel>
                                      <DropdownMenuGroup>
                                        {donorVars.map((v) => (
                                          <DropdownMenuItem
                                            key={`do2-${v.key}`}
                                            onClick={() =>
                                              insertVariableAtCursor(
                                                excerpt.id,
                                                "expectedResponse",
                                                v.label
                                              )
                                            }
                                          >
                                            {v.label}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="relative">
                                  <RichTextarea
                                    value={excerpt.expectedResponse}
                                    onChange={(next) =>
                                      handleRichChange(
                                        excerpt.id,
                                        "expectedResponse",
                                        next
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleTextareaKeyDown(
                                        excerpt.id,
                                        "expectedResponse",
                                        e
                                      )
                                    }
                                    className={`mt-1 bg-white dark:bg-slate-950 ${
                                      fieldErrors[excerpt.id]?.expectedResponse
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : ""
                                    }`}
                                    placeholder="Digite a resposta esperada do doador..."
                                    disabled={!excerpt.requiresResponse}
                                    ref={(el) =>
                                      (responseRefs.current[excerpt.id] = el)
                                    }
                                    onFocus={() =>
                                      setFocusedField({
                                        excerptId: excerpt.id,
                                        field: "expectedResponse",
                                      })
                                    }
                                  />
                                  {fieldErrors[excerpt.id]
                                    ?.expectedResponse && (
                                    <p className="mt-1 text-xs text-destructive">
                                      {
                                        fieldErrors[excerpt.id]
                                          ?.expectedResponse
                                      }
                                    </p>
                                  )}
                                  {varSuggest.open &&
                                    varSuggest.excerptId === excerpt.id &&
                                    varSuggest.field === "expectedResponse" && (
                                      <div
                                        className="absolute z-50 w-64 rounded-md border bg-popover text-popover-foreground shadow-md"
                                        style={{
                                          left: varSuggest.x,
                                          top: varSuggest.y,
                                        }}
                                      >
                                        <div className="p-2 text-xs text-muted-foreground">
                                          Variáveis
                                        </div>
                                        <div className="max-h-64 overflow-auto py-1">
                                          {allVars
                                            .filter((v) =>
                                              v.label
                                                .toLowerCase()
                                                .includes(
                                                  varSuggest.query.toLowerCase()
                                                )
                                            )
                                            .map((v, idx) => {
                                              const active =
                                                idx ===
                                                varSuggest.highlightedIndex;
                                              return (
                                                <div
                                                  key={`sugg-rsp-${excerpt.id}-${v.key}-${idx}`}
                                                  className={`px-2 py-1.5 text-sm cursor-pointer ${
                                                    active
                                                      ? "bg-accent text-accent-foreground"
                                                      : "hover:bg-accent hover:text-accent-foreground"
                                                  }`}
                                                  onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    completeVarInsertion(
                                                      excerpt.id,
                                                      "expectedResponse",
                                                      v.label
                                                    );
                                                  }}
                                                >
                                                  {v.label}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">
                                    Tipo de Enunciação
                                  </Label>
                                  <Select
                                    value={excerpt.responseEnunciationType}
                                    onValueChange={(value) =>
                                      updateExcerpt(
                                        selectedSection.id,
                                        excerpt.id,
                                        "responseEnunciationType",
                                        value
                                      )
                                    }
                                    disabled={!excerpt.requiresResponse}
                                  >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {enunciationTypes.map((type) => (
                                        <SelectItem
                                          key={type.value}
                                          value={type.value}
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">
                                    Método de Comparação
                                  </Label>
                                  <Select
                                    value={excerpt.responseComparisonMethod}
                                    onValueChange={(value) =>
                                      updateExcerpt(
                                        selectedSection.id,
                                        excerpt.id,
                                        "responseComparisonMethod",
                                        value
                                      )
                                    }
                                    disabled={!excerpt.requiresResponse}
                                  >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-950">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {comparisonMethods.map((method) => (
                                        <SelectItem
                                          key={method.value}
                                          value={method.value}
                                        >
                                          {method.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Palavras‑chave ou termos‑chave do Doador
                                  (opcional)
                                </Label>
                                <TagInput
                                  value={excerpt.donorKeywords}
                                  onChange={(tags) =>
                                    updateExcerpt(
                                      selectedSection.id,
                                      excerpt.id,
                                      "donorKeywords",
                                      tags
                                    )
                                  }
                                  placeholder="Digite e pressione enter, tab ou separe por vírgula. Ex.: todos os meses, reais"
                                  className="mt-1"
                                  disabled={!excerpt.requiresResponse}
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  Termos que devem estar presentes na
                                  transcrição do doador. Esses termos não são
                                  sensíveis a maiúsculas ou minúsculas.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {index < selectedSection.excerpts.length - 1 && (
                          <div className="py-2 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-xs border border-dashed border-muted-foreground/30 hover:border-muted-foreground/60"
                              onClick={() =>
                                addExcerptBetween(
                                  selectedSection.id,
                                  excerpt.id
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                              Adicionar trecho aqui
                            </Button>
                          </div>
                        )}
                      </Fragment>
                    ))}
                    {/* Add-at-bottom primary button */}
                    <div className="py-2 flex justify-center">
                      <Button
                        size="sm"
                        onClick={() => addExcerptToSection(selectedSection.id)}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Adicionar Trecho
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference Sheet moved to Header for global availability */}
    </>
  );
}

// Quick Reference Sheet rendered outside main return to keep overlay
// Note: This component depends on EditorV2's state; ensure it's within the same file scope
