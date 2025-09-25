"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithKey } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function KeyLoginForm() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await loginWithKey(key.trim());
      localStorage.setItem("agent-manager-key", key.trim());
      localStorage.setItem("agent-manager-user", JSON.stringify(response));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="Введите ключ доступа" value={key} onChange={(event) => setKey(event.target.value)} required />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Проверяем..." : "Войти"}
      </Button>
    </form>
  );
}
