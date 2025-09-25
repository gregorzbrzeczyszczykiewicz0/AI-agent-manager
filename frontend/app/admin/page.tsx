import { AdminKeysPanel } from "@/components/sections/admin-keys";
import { AdminTelegramPanel } from "@/components/sections/admin-telegram";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <section className="space-y-3">
        <p className="text-sm uppercase text-muted-foreground">Админка</p>
        <h1 className="text-4xl font-bold">Управление платформой</h1>
        <p className="max-w-3xl text-muted-foreground">
          Выпускайте ключи, назначайте Telegram-аккаунты и управляйте доступом к выбору моделей для пользователей. Все изменения сразу доступны в пользовательской части.
        </p>
      </section>
      <AdminKeysPanel />
      <AdminTelegramPanel />
      <Card>
        <CardHeader>
          <CardTitle>API и интеграции</CardTitle>
          <CardDescription>Используйте REST API для массовой загрузки собеседников и выгрузки результатов.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>POST /tasks/{`{id}`}/conversations — добавление собеседников списком или по одному.</p>
          <p>GET /tasks/{`{id}`}/conversations — статус и результаты по каждому собеседнику.</p>
          <p>GET /reports/export — ссылки на PDF и Word отчёты.</p>
        </CardContent>
      </Card>
    </main>
  );
}
