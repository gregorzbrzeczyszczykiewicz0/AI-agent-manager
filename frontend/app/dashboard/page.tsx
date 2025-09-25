"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Task } from "@/lib/types";
import { TaskTable } from "@/components/sections/task-table";
import { InstructionPanel } from "@/components/sections/instruction-panel";
import { MetricsSummary } from "@/components/sections/metrics-summary";
import { ReportingPanel } from "@/components/sections/reporting-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("agent-manager-key");
    if (!savedKey) {
      router.replace("/");
      return;
    }
    apiFetch<Task[]>("/tasks", { authKey: savedKey })
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить задачи"))
      .finally(() => setLoading(false));
  }, [router]);

  const activeTask = useMemo(() => tasks[0], [tasks]);

  function handleRefresh() {
    const savedKey = localStorage.getItem("agent-manager-key");
    if (!savedKey) return;
    setLoading(true);
    apiFetch<Task[]>("/tasks", { authKey: savedKey })
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить задачи"))
      .finally(() => setLoading(false));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase text-muted-foreground">Рабочее место</p>
          <h1 className="text-4xl font-bold">Мои задачи</h1>
          <p className="max-w-2xl text-muted-foreground">
            Управляйте вводными, добавляйте собеседников и отслеживайте аналитику. Каждые 10 диалогов система предложит улучшения к брифу.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          Обновить данные
        </Button>
      </section>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Загрузка...</p> : null}
      {!loading && tasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Начните с постановки задачи</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Создайте задачу через API или обратитесь к менеджеру, чтобы оформить вводные и прикрепить файлы.
          </CardContent>
        </Card>
      ) : null}
      {tasks.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-8">
            <TaskTable tasks={tasks} />
            <ReportingPanel tasks={tasks} />
          </div>
          <div className="space-y-8">
            {activeTask ? <InstructionPanel instruction={activeTask.current_instruction} diffs={activeTask.diffs} /> : null}
            <MetricsSummary tasks={tasks} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
