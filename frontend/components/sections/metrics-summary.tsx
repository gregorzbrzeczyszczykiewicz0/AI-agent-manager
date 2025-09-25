import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/types";

interface MetricsSummaryProps {
  tasks: Task[];
}

const metricNames: Record<string, string> = {
  persuasion: "Убедительность",
  brief_compliance: "Следование вводным",
  adaptability: "Адаптивность",
  answer_quality: "Качество ответов",
  resilience: "Отказоустойчивость",
  mcp_usage: "Использование MCP"
};

export function MetricsSummary({ tasks }: MetricsSummaryProps) {
  const totals: Record<string, { sum: number; count: number }> = {};

  for (const task of tasks) {
    for (const dialogue of task.dialogues) {
      for (const [metric, score] of Object.entries(dialogue.metrics)) {
        if (typeof score !== "number") continue;
        totals[metric] ??= { sum: 0, count: 0 };
        totals[metric].sum += score;
        totals[metric].count += 1;
      }
    }
  }

  const entries = Object.keys(metricNames).map((metric) => {
    const record = totals[metric] ?? { sum: 0, count: 0 };
    const value = record.count ? record.sum / record.count : 0;
    return { metric, value: Number(value.toFixed(1)) };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Качество диалогов</CardTitle>
        <CardDescription>Средние оценки каждых 10 диалогов по методике менеджера.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map(({ metric, value }) => (
            <div key={metric} className="rounded-lg border border-dashed p-4">
              <p className="text-sm font-medium">{metricNames[metric]}</p>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (value / 4) * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{value.toFixed(1)} / 4</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
