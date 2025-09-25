"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { TelegramAccount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

async function fetchAccounts(): Promise<TelegramAccount[]> {
  return apiFetch<TelegramAccount[]>("/admin/telegram-accounts").catch(() => []);
}

export function AdminTelegramPanel() {
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [label, setLabel] = useState("");
  const [credentials, setCredentials] = useState("");

  useEffect(() => {
    fetchAccounts().then(setAccounts);
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await apiFetch<TelegramAccount>("/admin/telegram-accounts", {
      method: "POST",
      body: { label, credentials, status: "ready" }
    });
    setAccounts((prev) => [...prev, created]);
    setLabel("");
    setCredentials("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram-аккаунты</CardTitle>
        <CardDescription>Фиксируйте креды и отслеживайте привязку к ключам.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Название" value={label} onChange={(event) => setLabel(event.target.value)} required />
          <Input placeholder="Телефон / токен" value={credentials} onChange={(event) => setCredentials(event.target.value)} required />
          <Button type="submit">Добавить</Button>
        </form>
        <div className="space-y-3">
          {accounts.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-4">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.credentials}</p>
              </div>
              <Badge variant="outline">{item.key_id ? `привязан к ${item.key_id.slice(0, 4)}...` : "свободен"}</Badge>
            </div>
          ))}
          {accounts.length === 0 ? <p className="text-sm text-muted-foreground">Нет подключённых аккаунтов.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
