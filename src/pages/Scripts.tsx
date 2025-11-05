import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { scripts } from "@/data/mockData";
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
import { Plus, Search, Copy, Trash2, FileEdit } from "lucide-react";

export default function Scripts() {
  const navigate = useNavigate();
  const { selectedCompany, selectedType, setSelectedScript } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredScripts = scripts.filter(
    (s) =>
      s.companyId === selectedCompany &&
      s.type === selectedType &&
      (statusFilter === "all" || s.status === statusFilter) &&
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenScript = (scriptId: string) => {
    setSelectedScript(scriptId);
    navigate(`/editor/${scriptId}`);
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Script
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table or Empty State */}
        {filteredScripts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileEdit className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum script encontrado</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Não há scripts para esta combinação de companhia e tipo. Crie o primeiro script para começar.
              </p>
              <Button className="gap-2">
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Versão Ativa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Modificação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScripts.map((script) => (
                  <TableRow
                    key={script.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpenScript(script.id)}
                  >
                    <TableCell className="font-medium">{script.name}</TableCell>
                    <TableCell className="text-muted-foreground">{script.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{script.activeVersion}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={script.status === "Ativo" ? "default" : "secondary"}>
                        {script.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(script.lastModified).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenScript(script.id);
                          }}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
