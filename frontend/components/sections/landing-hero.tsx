import { KeyRound, MessageCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyLoginForm } from "./key-login-form";

const features = [
  {
    title: "Гибкий контроль",
    description: "Привязывайте ключи, Telegram-аккаунты и задачи к клиенту в пару кликов.",
    icon: KeyRound
  },
  {
    title: "Осмысленные вводные",
    description: "ИИ помогает оформить бриф, подсказывает шаги и следит за качеством каждые 10 диалогов.",
    icon: MessageCircle
  },
  {
    title: "Админка для команды",
    description: "Менеджеры управляют ключами, ротацией аккаунтов и доступом к выбору моделей.",
    icon: ShieldCheck
  }
];

export function LandingHero() {
  return (
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">AI agent manager</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Telegram-агенты под контролем</h1>
          <p className="text-lg text-muted-foreground">
            Управляйте ключами доступа, брифами и метриками эффективности. Стартуйте диалоги и анализируйте результаты в едином интерфейсе.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-dashed">
              <CardHeader className="space-y-2">
                <feature.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Войти по ключу</CardTitle>
          <CardDescription>Получите ключ у менеджера и подключите своего агента.</CardDescription>
        </CardHeader>
        <CardContent>
          <KeyLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
