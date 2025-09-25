export type KeyStatus = "active" | "inactive";
export type ConversationStatus = "in_progress" | "completed" | "failed";
export type RadarMetric = "persuasion" | "brief_compliance" | "adaptability" | "answer_quality" | "resilience" | "mcp_usage";

export interface Attachment {
  filename: string;
  description?: string | null;
}

export interface MCPFunction {
  name: string;
  description?: string | null;
}

export interface InstructionSet {
  background: string;
  goal: string;
  steps: string[];
  response_rules: string[];
  communication_style: string;
  file_rules: string[];
  allowed_functions: MCPFunction[];
  proactivity_level: string;
  telegram_account_id?: string | null;
}

export interface InstructionDiff {
  field: string;
  previous: string;
  proposed: string;
}

export interface ConversationAssignment {
  id: string;
  telegram_account_id: string;
  status: ConversationStatus;
  result?: string | null;
}

export interface DialogueRecord {
  conversation_id: string;
  timestamp: string;
  status: ConversationStatus;
  notes?: string | null;
  metrics: Partial<Record<RadarMetric, number>>;
}

export interface TaskSummary {
  conversion_rate: number;
  comments: string;
  challenges: string;
  fun_facts: string[];
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  attachments: Attachment[];
  instruction_history: InstructionSet[];
  current_instruction: InstructionSet;
  diffs: InstructionDiff[];
  conversations: ConversationAssignment[];
  dialogues: DialogueRecord[];
  summary?: TaskSummary | null;
}

export interface TelegramAccount {
  id: string;
  label: string;
  status: string;
  credentials: string;
  key_id?: string | null;
}

export interface Key {
  id: string;
  value: string;
  status: KeyStatus;
  user_id?: string | null;
  telegram_account_ids: string[];
  allow_model_selection: boolean;
  default_model: string;
}
