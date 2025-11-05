import { enunciationCatalog, comparisonCatalog } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Catalog() {
  return (
    <div className="flex-1 p-6 fade-in">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Catálogo de Análise</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Referência completa de tipos de enunciação e métodos de comparação
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Enunciation Types */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Enunciação</CardTitle>
              <CardDescription>
                Categorias que classificam como a informação deve ser comunicada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Exemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enunciationCatalog.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {item.example}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right Column: Comparison Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Comparação</CardTitle>
              <CardDescription>
                Estratégias para validar se a resposta atende ao esperado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Exemplo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonCatalog.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {item.example}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="border-muted bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-2">Sobre os Tipos de Enunciação</h3>
                <p className="text-sm text-muted-foreground">
                  Os tipos de enunciação definem a natureza da resposta esperada do interlocutor. 
                  Eles ajudam o sistema a identificar se uma informação foi comunicada corretamente 
                  conforme o script planejado.
                </p>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-2">Sobre os Métodos de Comparação</h3>
                <p className="text-sm text-muted-foreground">
                  Os métodos de comparação determinam o rigor da validação. Use ExactMatch para 
                  precisão máxima, PartialMatch para flexibilidade moderada, e SemanticMatch 
                  quando sinônimos e variações são aceitáveis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
