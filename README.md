# AI Agent Manager

Полноценное демо веб-платформы для управления Telegram-агентами на стеке **FastAPI + Next.js (App Router) + shadcn/ui**.

## Структура

- `backend/` — FastAPI-приложение с in-memory хранилищем. Описаны сущности ключей, пользователей, задач, Telegram-аккаунтов и аналитики.
- `frontend/` — Next.js + Tailwind + shadcn/ui. Реализованы лэндинг, пользовательский дашборд и админка для менеджеров.

## Backend

### Запуск
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Основные endpoints

- `POST /admin/keys` — выпуск ключа и создание пользователя
- `GET /admin/keys` / `PATCH /admin/keys/{id}` — список и управление ключами
- `POST /admin/telegram-accounts` / `GET /admin/telegram-accounts` — управление Telegram-аккаунтами
- `POST /auth/login` — вход по ключу
- `GET /tasks` / `POST /tasks` — список и создание задач
- `POST /tasks/{id}/instruction` — новая версия вводных
- `POST /tasks/{id}/diffs` — обработка предложений ИИ
- `POST /tasks/{id}/conversations` — запуск общения с собеседниками
- `PATCH /tasks/{id}/conversations/{conversation_id}` — фиксация результатов диалога
- `GET /tasks/{id}/conversations` — проверка статусов собеседников
- `GET /reports/*` — отчётность и экспорт

## Frontend

### Запуск
```bash
cd frontend
npm install
npm run dev
```

### Возможности интерфейса

- Лэндинг с описанием платформы и формой входа по ключу.
- Пользовательский дашборд: список задач, актуальные вводные, метрики качества, отчётность.
- Админка: выпуск ключей, управление Telegram-аккаунтами, подсказки по API.

## Переменные окружения

- `NEXT_PUBLIC_API_BASE` — базовый URL backend (по умолчанию `http://localhost:8000`).

## Тестовые данные

Приложение хранит данные в памяти. После перезапуска сервера состояние очищается. Используйте админку, чтобы выпустить ключ и продолжить работу.
