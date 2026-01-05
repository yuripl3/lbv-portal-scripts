import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { companies } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Trash2, FileEdit, Filter } from "lucide-react";
import {
  listScripts,
  createScript,
  deleteScript,
  type CustomScript,
} from "@/data/mockStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Scripts() {
  const navigate = useNavigate();
  const {
    selectedCompany,
    selectedType,
    setSelectedCompany,
    setSelectedType,
    setSelectedScript,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [items, setItems] = useState<CustomScript[]>([]);
  const [loading, setLoading] = useState(true);

  // Creation dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newType, setNewType] = useState("");
  // no script name field anymore
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomScript | null>(null);
  const [deleting, setDeleting] = useState(false);

  const company = companies.find((c) => c.id === selectedCompany);
  // All unique types across companies for global population when no company is selected
  const allTypes = Array.from(new Set(companies.flatMap((c) => c.scriptTypes)));

  // Load scripts from mock DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await listScripts();
        if (!cancelled) setItems(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    // Reset selected type when company changes so user explicitly chooses
    setSelectedType("");
  };

  // Mostrar apenas scripts personalizados do mock DB
  const filteredScripts = useMemo(() => {
    return items.filter((s) => {
      const text = `${s.companyId} ${s.type} ${s.description}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesCompany =
        !selectedCompany ||
        selectedCompany === "all" ||
        s.companyId === selectedCompany;
      const matchesType =
        !selectedType || selectedType === "all" || s.type === selectedType;
      return matchesSearch && matchesStatus && matchesCompany && matchesType;
    });
  }, [items, searchTerm, statusFilter, selectedCompany, selectedType]);

  const handleOpenScript = (scriptId: string) => {
    setSelectedScript(scriptId);
    const script = items.find((s) => s.id === scriptId);
    const version = script?.activeVersion || "v1.0";
    navigate(`/editor/${scriptId}?version=${encodeURIComponent(version)}`);
  };

  const openCreate = () => {
    setNewCompanyId(
      selectedCompany && selectedCompany !== "all" ? selectedCompany : ""
    );
    setNewType(selectedType && selectedType !== "all" ? selectedType : "");
    setNewDescription("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!newCompanyId.trim() || !newType.trim()) return;
    setCreating(true);
    try {
      const created = await createScript({
        companyId: newCompanyId.trim(),
        type: newType.trim(),
        description: newDescription.trim(),
      });
      if (created) {
        // refresh list
        const list = await listScripts();
        setItems(list);
        setCreateOpen(false);
        navigate(
          `/editor/${created.id}?version=${encodeURIComponent(
            created.activeVersion
          )}`
        );
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 p-6 fade-in">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">Scripts</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os scripts da sua companhia
            </p>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Script
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Icon + label aligned with selects */}
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium h-10">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </div>
              <div className="sm:w-[260px]">
                <Select
                  value={selectedCompany}
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a operadora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as operadoras</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-[220px]">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {(selectedCompany && selectedCompany !== "all"
                      ? company?.scriptTypes
                      : allTypes
                    )?.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:ml-auto sm:w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Table or Empty State */}
        {loading ? (
          <Card>
            <CardContent className="py-10 text-sm text-muted-foreground text-center">
              Carregando scripts...
            </CardContent>
          </Card>
        ) : filteredScripts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileEdit className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum script encontrado
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Não há scripts para esta combinação de companhia e tipo. Crie o
                primeiro script para começar.
              </p>
              <Button className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Criar Primeiro Script
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operadora</TableHead>
                  <TableHead>Tipo de Script</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Versão Ativa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Modificação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScripts.map((script) => {
                  const companyName =
                    companies.find((c) => c.id === script.companyId)?.name ||
                    script.companyId;
                  return (
                    <TableRow
                      key={script.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpenScript(script.id)}
                    >
                      <TableCell className="font-medium">
                        {companyName}
                      </TableCell>
                      <TableCell>{script.type}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {script.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {script.activeVersion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            script.status === "Ativo" ? "default" : "secondary"
                          }
                        >
                          {script.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(script.lastModified).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(script);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Create Script Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Script</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo script.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Operadora</Label>
              <Input
                value={newCompanyId}
                onChange={(e) => setNewCompanyId(e.target.value)}
                placeholder="Ex.: Vivo"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Ex.: Prospecção"
              />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Breve descrição do objetivo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreate}
              disabled={creating || !newCompanyId.trim() || !newType.trim()}
            >
              {creating ? "Criando..." : "Criar e abrir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir script</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "
              {deleteTarget
                ? `${deleteTarget.companyId} · ${deleteTarget.type}`
                : ""}
              "? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;
                setDeleting(true);
                try {
                  const ok = await deleteScript(deleteTarget.id);
                  if (ok) {
                    toast.success("Script excluído");
                    const list = await listScripts();
                    setItems(list);
                  } else {
                    toast.error("Falha ao excluir");
                  }
                } finally {
                  setDeleting(false);
                  setDeleteTarget(null);
                }
              }}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
