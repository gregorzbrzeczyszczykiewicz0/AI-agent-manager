import { LandingHero } from "@/components/sections/landing-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const highlights = [
  {
    title: "Версионность вводных",
    content: "Просматривайте историю инструкций, согласовывайте diff и возвращайтесь к предыдущим версиям задачи."
  },
  {
    title: "Контроль каналов",
    content: "Назначайте Telegram-аккаунты на ключи и задачи, отслеживайте статус собеседников."
  },
  {
    title: "Отчётность",
    content: "Получайте конверсию по неделям, радары качества и экспортируйте результаты в PDF/Word."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
      <LandingHero />
      <section className="space-y-8">
        <div className="space-y-2">
          <Badge variant="secondary">Возможности платформы</Badge>
          <h2 className="text-3xl font-semibold">Контроль задач от брифа до отчётности</h2>
          <p className="text-muted-foreground">
            Менеджеры выпускают ключи, настраивают модели и управляют Telegram-аккаунтами. Пользователи формируют задачи, добавляют собеседников и следят за качеством ИИ-агента.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.content}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
