"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Key } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

async function fetchKeys(): Promise<Key[]> {
  return apiFetch<Key[]>("/admin/keys");
}

export function AdminKeysPanel() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");

  useEffect(() => {
    fetchKeys()
      .then(setKeys)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await apiFetch<{ key: Key }>("/admin/keys", {
      method: "POST",
      body: { email, organization, status: "active" }
    });
    setKeys((prev) => [...prev, response.key]);
    setEmail("");
    setOrganization("");
  }

  async function toggleModelSelection(key: Key) {
    const updated = await apiFetch<Key>(`/admin/keys/${key.id}?allow_model_selection=${(!key.allow_model_selection).toString()}`, {
      method: "PATCH"
    });
    setKeys((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ключи доступа</CardTitle>
        <CardDescription>Создавайте ключи и управляйте правом выбора модели.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required type="email" />
          <Input placeholder="Организация" value={organization} onChange={(event) => setOrganization(event.target.value)} required />
          <Button type="submit">Выпустить</Button>
        </form>
        <div className="space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Загрузка...</p> : null}
          {keys.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-4">
              <div>
                <p className="font-medium">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.default_model}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.status === "active" ? "secondary" : "outline"}>{item.status}</Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Switch checked={item.allow_model_selection} onCheckedChange={() => toggleModelSelection(item)} />
                  <span>Выбор модели</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
