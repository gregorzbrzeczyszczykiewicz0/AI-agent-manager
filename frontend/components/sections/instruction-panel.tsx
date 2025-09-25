import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InstructionSet, InstructionDiff } from "@/lib/types";

interface InstructionPanelProps {
  instruction: InstructionSet;
  diffs: InstructionDiff[];
}

export function InstructionPanel({ instruction, diffs }: InstructionPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Текущие вводные</CardTitle>
        <CardDescription>Просматривайте активную версию и предложения по обновлениям.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Текущая версия</TabsTrigger>
            <TabsTrigger value="diff">Предложения ({diffs.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="space-y-4">
            <InstructionSection title="Бекграунд" value={instruction.background} />
            <InstructionSection title="Цель" value={instruction.goal} />
            <InstructionSection title="Шаги" value={instruction.steps.join(" → ")} />
            <InstructionSection title="Правила ответа" value={instruction.response_rules.join("; ")} />
            <InstructionSection title="Стиль" value={instruction.communication_style} />
            <InstructionSection title="Файлы" value={instruction.file_rules.join("; ")} />
          </TabsContent>
          <TabsContent value="diff">
            {diffs.length === 0 ? <p className="text-sm text-muted-foreground">Новых предложений нет.</p> : null}
            <ul className="space-y-3">
              {diffs.map((diff) => (
                <li key={`${diff.field}-${diff.proposed}`} className="rounded-md border border-dashed p-3">
                  <p className="text-sm font-medium">{diff.field}</p>
                  <p className="text-xs text-muted-foreground">{diff.previous}</p>
                  <p className="text-xs text-primary">{diff.proposed}</p>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function InstructionSection({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase text-muted-foreground">{title}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
