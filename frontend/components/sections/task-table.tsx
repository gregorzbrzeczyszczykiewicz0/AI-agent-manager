import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Собеседники</TableHead>
              <TableHead>Диалоги</TableHead>
              <TableHead>Последний диалог</TableHead>
              <TableHead>Diff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const lastDialogue = task.dialogues[task.dialogues.length - 1];
              const flagged = task.diffs.length > 0;
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{task.conversations.length}</TableCell>
                  <TableCell>{task.dialogues.length}</TableCell>
                  <TableCell>{lastDialogue ? formatDate(lastDialogue.timestamp) : "—"}</TableCell>
                  <TableCell>{flagged ? <Badge variant="secondary">на проверке</Badge> : <Badge variant="outline">чисто</Badge>}</TableCell>
                </TableRow>
              );
            })}
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Задачи пока не созданы.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
