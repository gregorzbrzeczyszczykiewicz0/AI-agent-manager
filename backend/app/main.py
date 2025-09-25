from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


class KeyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class TelegramAccountStatus(str, Enum):
    READY = "ready"
    BANNED = "banned"


class ConversationStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class RadarMetric(str, Enum):
    PERSUASION = "persuasion"
    BRIEF_COMPLIANCE = "brief_compliance"
    ADAPTABILITY = "adaptability"
    ANSWER_QUALITY = "answer_quality"
    RESILIENCE = "resilience"
    MCP_USAGE = "mcp_usage"


class TaskModelScope(str, Enum):
    GLOBAL = "global"
    TASK = "task"


class Attachment(BaseModel):
    filename: str
    description: Optional[str] = None


class MCPFunction(BaseModel):
    name: str
    description: Optional[str] = None


class InstructionSet(BaseModel):
    background: str
    goal: str
    steps: List[str]
    response_rules: List[str]
    communication_style: str
    file_rules: List[str]
    allowed_functions: List[MCPFunction]
    proactivity_level: str
    telegram_account_id: Optional[UUID] = None


class InstructionDiff(BaseModel):
    field: str
    previous: str
    proposed: str


class DialogueRecord(BaseModel):
    conversation_id: UUID
    timestamp: datetime
    status: ConversationStatus
    notes: Optional[str] = None
    metrics: Dict[RadarMetric, int] = Field(default_factory=dict)


class TaskSummary(BaseModel):
    conversion_rate: float
    comments: str
    challenges: str
    fun_facts: List[str]


class TelegramAccount(BaseModel):
    id: UUID
    label: str
    credentials: str
    status: TelegramAccountStatus = TelegramAccountStatus.READY
    key_id: Optional[UUID] = None


class Key(BaseModel):
    id: UUID
    value: str
    status: KeyStatus = KeyStatus.ACTIVE
    user_id: Optional[UUID] = None
    telegram_account_ids: List[UUID] = Field(default_factory=list)
    allow_model_selection: bool = False
    task_model_overrides: Dict[UUID, str] = Field(default_factory=dict)
    default_model: str = "Gemini Flash"


class User(BaseModel):
    id: UUID
    email: EmailStr
    organization: str
    key_id: UUID


class ConversationAssignment(BaseModel):
    id: UUID
    telegram_account_id: UUID
    status: ConversationStatus = ConversationStatus.IN_PROGRESS
    result: Optional[str] = None


class Task(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str
    attachments: List[Attachment] = Field(default_factory=list)
    instruction_history: List[InstructionSet] = Field(default_factory=list)
    current_instruction: InstructionSet
    diffs: List[InstructionDiff] = Field(default_factory=list)
    conversations: List[ConversationAssignment] = Field(default_factory=list)
    dialogues: List[DialogueRecord] = Field(default_factory=list)
    summary: Optional[TaskSummary] = None


class ModelSelectionUpdate(BaseModel):
    scope: TaskModelScope
    model_name: str
    task_id: Optional[UUID] = None


class AdminKeyCreateRequest(BaseModel):
    email: EmailStr
    organization: str
    status: KeyStatus = KeyStatus.ACTIVE


class AdminKeyResponse(BaseModel):
    key: Key
    user: User


class AdminTelegramAccountRequest(BaseModel):
    label: str
    credentials: str
    status: TelegramAccountStatus = TelegramAccountStatus.READY


class AdminTelegramAssignmentRequest(BaseModel):
    telegram_account_id: UUID
    key_id: UUID


class LoginRequest(BaseModel):
    key_value: str


class LoginResponse(BaseModel):
    key_id: UUID
    user_id: UUID
    allow_model_selection: bool
    default_model: str


class TaskCreateRequest(BaseModel):
    title: str
    description: str
    attachments: List[Attachment] = Field(default_factory=list)
    instruction: InstructionSet


class TaskUpdateInstructionRequest(BaseModel):
    instruction: InstructionSet


class TaskDiffActionRequest(BaseModel):
    diff: InstructionDiff
    action: str


class ConversationCreateRequest(BaseModel):
    telegram_account_ids: List[UUID]


class ConversationUpdateRequest(BaseModel):
    status: ConversationStatus
    result: Optional[str] = None
    notes: Optional[str] = None
    metrics: Optional[Dict[RadarMetric, int]] = None


class SummaryRequest(BaseModel):
    conversion_rate: float
    comments: str
    challenges: str
    fun_facts: List[str]


@dataclass
class DataStore:
    keys: Dict[UUID, Key] = field(default_factory=dict)
    users: Dict[UUID, User] = field(default_factory=dict)
    telegram_accounts: Dict[UUID, TelegramAccount] = field(default_factory=dict)
    tasks: Dict[UUID, Task] = field(default_factory=dict)

    def create_user_and_key(self, email: EmailStr, organization: str, status: KeyStatus) -> AdminKeyResponse:
        key_id = uuid4()
        user_id = uuid4()
        key = Key(id=key_id, value=str(uuid4()), status=status, user_id=user_id)
        user = User(id=user_id, email=email, organization=organization, key_id=key_id)
        self.keys[key_id] = key
        self.users[user_id] = user
        return AdminKeyResponse(key=key, user=user)

    def get_user_by_key_value(self, key_value: str) -> Optional[User]:
        for key in self.keys.values():
            if key.value == key_value and key.user_id:
                return self.users[key.user_id]
        return None


store = DataStore()
app = FastAPI(title="AI Agent Manager")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_key(key_id: UUID) -> Key:
    if key_id not in store.keys:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Key not found")
    return store.keys[key_id]


def get_current_key(x_api_key: Optional[str]) -> Key:
    if not x_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key")
    for key in store.keys.values():
        if key.value == x_api_key:
            if key.status != KeyStatus.ACTIVE:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Key inactive")
            return key
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


def current_key_dependency(x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")) -> Key:
    return get_current_key(x_api_key)


@app.post("/admin/keys", response_model=AdminKeyResponse)
def create_key(request: AdminKeyCreateRequest) -> AdminKeyResponse:
    return store.create_user_and_key(request.email, request.organization, request.status)


@app.get("/admin/keys", response_model=List[Key])
def list_keys() -> List[Key]:
    return list(store.keys.values())


@app.patch("/admin/keys/{key_id}", response_model=Key)
def update_key(key_id: UUID, allow_model_selection: Optional[bool] = None, status_value: Optional[KeyStatus] = None) -> Key:
    key = get_key(key_id)
    if allow_model_selection is not None:
        key.allow_model_selection = allow_model_selection
    if status_value is not None:
        key.status = status_value
    store.keys[key_id] = key
    return key


@app.get("/admin/telegram-accounts", response_model=List[TelegramAccount])
def list_telegram_accounts() -> List[TelegramAccount]:
    return list(store.telegram_accounts.values())


@app.post("/admin/telegram-accounts", response_model=TelegramAccount)
def create_telegram_account(request: AdminTelegramAccountRequest) -> TelegramAccount:
    account = TelegramAccount(id=uuid4(), label=request.label, credentials=request.credentials, status=request.status)
    store.telegram_accounts[account.id] = account
    return account


@app.patch("/admin/telegram-accounts/{account_id}", response_model=TelegramAccount)
def update_telegram_assignment(account_id: UUID, request: AdminTelegramAssignmentRequest) -> TelegramAccount:
    if account_id not in store.telegram_accounts:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Telegram account not found")
    account = store.telegram_accounts[account_id]
    account.key_id = request.key_id
    store.telegram_accounts[account_id] = account
    key = get_key(request.key_id)
    if account_id not in key.telegram_account_ids:
        key.telegram_account_ids.append(account_id)
    store.keys[key.id] = key
    return account


@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest) -> LoginResponse:
    user = store.get_user_by_key_value(request.key_value)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    key = store.keys[user.key_id]
    return LoginResponse(
        key_id=key.id,
        user_id=user.id,
        allow_model_selection=key.allow_model_selection,
        default_model=key.default_model,
    )


@app.get("/tasks", response_model=List[Task])
def list_tasks(current_key: Key = Depends(current_key_dependency)) -> List[Task]:
    return [task for task in store.tasks.values() if task.user_id == current_key.user_id]


def get_task(task_id: UUID) -> Task:
    if task_id not in store.tasks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return store.tasks[task_id]


@app.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(request: TaskCreateRequest, current_key: Key = Depends(current_key_dependency)) -> Task:
    task_id = uuid4()
    task = Task(
        id=task_id,
        user_id=current_key.user_id,
        title=request.title,
        description=request.description,
        attachments=request.attachments,
        instruction_history=[request.instruction],
        current_instruction=request.instruction,
    )
    store.tasks[task_id] = task
    return task


@app.get("/tasks/{task_id}", response_model=Task)
def retrieve_task(task_id: UUID, current_key: Key = Depends(current_key_dependency)) -> Task:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return task


@app.post("/tasks/{task_id}/instruction", response_model=Task)
def update_instruction(task_id: UUID, request: TaskUpdateInstructionRequest, current_key: Key = Depends(current_key_dependency)) -> Task:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    task.instruction_history.append(request.instruction)
    task.current_instruction = request.instruction
    store.tasks[task_id] = task
    return task


@app.post("/tasks/{task_id}/diffs", response_model=Task)
def handle_diff(task_id: UUID, request: TaskDiffActionRequest, current_key: Key = Depends(current_key_dependency)) -> Task:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if request.action == "accept":
        task.current_instruction = task.current_instruction.copy(update={request.diff.field: request.diff.proposed})
    elif request.action == "reject":
        pass
    else:
        task.diffs.append(request.diff)
    store.tasks[task_id] = task
    return task


@app.get("/tasks/{task_id}/conversations")
def list_conversations(task_id: UUID, ids: Optional[List[UUID]] = Query(default=None), current_key: Key = Depends(current_key_dependency)) -> Dict[str, object]:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    conversations = task.conversations
    if ids:
        ids_set = set(ids)
        conversations = [conv for conv in conversations if conv.id in ids_set]
    if all(conv.status == ConversationStatus.COMPLETED for conv in conversations) and conversations:
        task_status = ConversationStatus.COMPLETED
    elif any(conv.status == ConversationStatus.FAILED for conv in conversations):
        task_status = ConversationStatus.FAILED
    else:
        task_status = ConversationStatus.IN_PROGRESS
    return {"task_id": str(task.id), "status": task_status, "conversations": conversations}


@app.post("/tasks/{task_id}/conversations", response_model=Task)
def create_conversations(task_id: UUID, request: ConversationCreateRequest, current_key: Key = Depends(current_key_dependency)) -> Task:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    for account_id in request.telegram_account_ids:
        conversation = ConversationAssignment(id=uuid4(), telegram_account_id=account_id)
        task.conversations.append(conversation)
    store.tasks[task_id] = task
    return task


@app.patch("/tasks/{task_id}/conversations/{conversation_id}", response_model=Task)
def update_conversation(
    task_id: UUID,
    conversation_id: UUID,
    request: ConversationUpdateRequest,
    current_key: Key = Depends(current_key_dependency),
) -> Task:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    conversation = next((c for c in task.conversations if c.id == conversation_id), None)
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    conversation.status = request.status
    conversation.result = request.result
    task.dialogues.append(
        DialogueRecord(
            conversation_id=conversation_id,
            timestamp=datetime.utcnow(),
            status=request.status,
            notes=request.notes,
            metrics={metric: score for metric, score in (request.metrics or {}).items()},
        )
    )
    if len(task.dialogues) % 10 == 0:
        task.diffs.append(
            InstructionDiff(
                field="steps",
                previous="; ".join(task.current_instruction.steps),
                proposed="; ".join(task.current_instruction.steps + ["Add onboarding reminder"]),
            )
        )
    store.tasks[task_id] = task
    return task


@app.post("/tasks/{task_id}/summary", response_model=Task)
def update_summary(task_id: UUID, request: SummaryRequest, current_key: Key = Depends(current_key_dependency)) -> Task:
    task = get_task(task_id)
    if task.user_id != current_key.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    task.summary = TaskSummary(**request.dict())
    store.tasks[task_id] = task
    return task


@app.post("/admin/model-selection/{key_id}", response_model=Key)
def update_model_selection(key_id: UUID, request: ModelSelectionUpdate) -> Key:
    key = get_key(key_id)
    if request.scope == TaskModelScope.GLOBAL:
        key.default_model = request.model_name
    else:
        if not request.task_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task id required for task scope")
        key.task_model_overrides[request.task_id] = request.model_name
    store.keys[key_id] = key
    return key


@app.get("/reports/overview")
def reports_overview() -> Dict[str, Dict[str, float]]:
    weekly_conversion: Dict[str, float] = {}
    for task in store.tasks.values():
        for dialogue in task.dialogues:
            week_key = dialogue.timestamp.strftime("%Y-W%U")
            weekly_conversion.setdefault(week_key, 0)
            if dialogue.status == ConversationStatus.COMPLETED:
                weekly_conversion[week_key] += 1
    return {"weekly_conversion": weekly_conversion}


@app.get("/reports/tasks", response_model=List[Task])
def reports_tasks() -> List[Task]:
    return list(store.tasks.values())


@app.get("/reports/metrics")
def reports_metrics() -> Dict[str, float]:
    metrics_totals = {metric: 0 for metric in RadarMetric}
    counts = {metric: 0 for metric in RadarMetric}
    for task in store.tasks.values():
        for dialogue in task.dialogues:
            for metric, score in dialogue.metrics.items():
                metrics_totals[metric] += score
                counts[metric] += 1
    averages = {}
    for metric, total in metrics_totals.items():
        averages[metric.value] = total / counts[metric] if counts[metric] else 0
    return averages


@app.get("/reports/export")
def reports_export() -> Dict[str, str]:
    return {"pdf": "https://example.com/report.pdf", "docx": "https://example.com/report.docx"}


@app.get("/reports/email")
def reports_email() -> Dict[str, str]:
    return {"status": "queued"}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


__all__ = ["app"]
