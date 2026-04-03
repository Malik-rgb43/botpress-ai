export type UserRole = 'user' | 'admin'

export type Channel = 'whatsapp' | 'email' | 'widget'

export type TonePreset = 'formal' | 'friendly' | 'professional' | 'casual' | 'custom'

export type TemplateType = 'greeting' | 'no_answer' | 'transfer' | 'goodbye'

export type PolicyType = 'returns' | 'shipping' | 'hours' | 'payment' | 'custom'

export type MessageRole = 'customer' | 'bot' | 'agent'

export type ResponseLayer = 'faq' | 'ai' | 'transfer'

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'angry'

export type EscalationStatus = 'open' | 'in_progress' | 'resolved'

export type SummaryFrequency = 'daily' | 'weekly' | 'monthly'

export type PlanTier = 'free' | 'basic' | 'premium'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Business {
  id: string
  user_id: string
  name: string
  logo_url: string | null
  contact_info: {
    phone?: string
    email?: string
    address?: string
    website?: string
    gmail_connected?: boolean
    gmail_refresh_token?: string
    gmail_access_token?: string
    gmail_token_expiry?: number
  }
  story: string | null
  tone: TonePreset
  tone_custom: string | null
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  business_id: string
  category: string | null
  question: string
  answer: string
  order: number
  created_at: string
}

export interface Policy {
  id: string
  business_id: string
  type: PolicyType
  title: string
  content: string
  created_at: string
}

export interface ResponseTemplate {
  id: string
  business_id: string
  type: TemplateType
  content: string
}

export interface Conversation {
  id: string
  business_id: string
  channel: Channel
  customer_identifier: string
  started_at: string
  ended_at: string | null
  satisfaction_rating: number | null
  detected_language: string | null
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  response_layer: ResponseLayer | null
  intent: string | null
  sentiment: Sentiment | null
  created_at: string
}

export interface Customer {
  id: string
  business_id: string
  identifier: string
  display_name: string | null
  language: string | null
  first_seen: string
  last_seen: string
  total_conversations: number
}

export interface SummarySettings {
  id: string
  business_id: string
  frequency: SummaryFrequency
  email: string
  enabled: boolean
}

export interface Escalation {
  id: string
  conversation_id: string
  reason: string
  assigned_to: string | null
  status: EscalationStatus
  created_at: string
  resolved_at: string | null
}

export interface UnansweredQuestion {
  id: string
  business_id: string
  question: string
  times_asked: number
  added_to_faq: boolean
  created_at: string
}

export interface Plan {
  id: string
  name: string
  tier: PlanTier
  message_limit: number
  features: Record<string, boolean>
  price_monthly: number
}

export interface Subscription {
  id: string
  business_id: string
  plan_id: string
  messages_used: number
  period_start: string
  period_end: string
  status: string
}

export interface WidgetSettings {
  id: string
  business_id: string
  position: 'bottom-right' | 'bottom-left'
  primary_color: string
  welcome_message: string
  custom_logo_url: string | null
  white_label: boolean
}
