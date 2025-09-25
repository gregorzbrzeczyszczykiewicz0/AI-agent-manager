import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/types";

interface ReportingPanelProps {
  tasks: Task[];
}

export function ReportingPanel({ tasks }: ReportingPanelProps) {
  const completed = tasks.flatMap((task) => task.dialogues.filter((dialogue) => dialogue.status === "completed"));
  const failed = tasks.flatMap((task) => task.dialogues.filter((dialogue) => dialogue.status === "failed"));
  const total = completed.length + failed.length || 1;
  const conversion = ((completed.length / total) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отчётность</CardTitle>
        <CardDescription>Следите за качеством и выгружайте отчёты для команды и клиента.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-xs uppercase text-muted-foreground">Завершённых диалогов</p>
            <p className="text-2xl font-semibold">{completed.length}</p>
          </div>
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-xs uppercase text-muted-foreground">Провалено</p>
            <p className="text-2xl font-semibold">{failed.length}</p>
          </div>
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-xs uppercase text-muted-foreground">Конверсия</p>
            <p className="text-2xl font-semibold">{conversion}%</p>
          </div>
        </div>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Просматривайте диалоги, оставляйте комментарии и отправляйте отчёты на почту.</li>
          <li>Экспортируйте PDF и Word версии для клиента в один клик.</li>
          <li>Сопоставляйте эффективность по задачам и неделям.</li>
        </ul>
      </CardContent>
    </Card>
  );
}
