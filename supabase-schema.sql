-- BotPress AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Businesses
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  logo_url text,
  contact_info jsonb default '{}'::jsonb,
  story text,
  tone text default 'friendly' check (tone in ('formal', 'friendly', 'professional', 'casual', 'custom')),
  tone_custom text,
  widget_token text unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_biz_widget_token ON public.businesses(widget_token);

-- FAQs
create table public.faqs (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  category text,
  question text not null,
  answer text not null,
  "order" integer default 0,
  created_at timestamptz default now()
);

-- Policies
create table public.policies (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  type text not null check (type in ('returns', 'shipping', 'hours', 'payment', 'custom')),
  title text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Response Templates
create table public.response_templates (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  type text not null check (type in ('greeting', 'no_answer', 'transfer', 'goodbye')),
  content text not null
);

-- Customers
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  identifier text not null,
  display_name text,
  language text,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  total_conversations integer default 0
);

-- Conversations
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  channel text not null check (channel in ('whatsapp', 'email', 'widget')),
  customer_identifier text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  satisfaction_rating integer check (satisfaction_rating between 1 and 5),
  detected_language text
);

-- Messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('customer', 'bot', 'agent')),
  content text not null,
  response_layer text check (response_layer in ('faq', 'ai', 'transfer')),
  intent text,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative', 'angry')),
  created_at timestamptz default now()
);

-- Summary Settings
create table public.summary_settings (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null unique,
  frequency text default 'weekly' check (frequency in ('daily', 'weekly', 'monthly')),
  email text not null,
  enabled boolean default false
);

-- Escalations
create table public.escalations (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  reason text,
  assigned_to text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Unanswered Questions
create table public.unanswered_questions (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  question text not null,
  times_asked integer default 1,
  added_to_faq boolean default false,
  created_at timestamptz default now()
);

-- Plans
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  tier text not null check (tier in ('free', 'basic', 'premium')),
  message_limit integer not null,
  features jsonb default '{}'::jsonb,
  price_monthly numeric(10,2) default 0
);

-- Subscriptions
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  plan_id uuid references public.plans(id) not null,
  messages_used integer default 0,
  period_start timestamptz default now(),
  period_end timestamptz,
  status text default 'active'
);

-- Widget Settings
create table public.widget_settings (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null unique,
  position text default 'bottom-right' check (position in ('bottom-right', 'bottom-left')),
  primary_color text default '#000000',
  welcome_message text default '',
  custom_logo_url text,
  white_label boolean default false
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.faqs enable row level security;
alter table public.policies enable row level security;
alter table public.response_templates enable row level security;
alter table public.customers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.summary_settings enable row level security;
alter table public.escalations enable row level security;
alter table public.unanswered_questions enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.widget_settings enable row level security;

-- RLS Policies: Users can only access their own business data
-- Users
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
-- SECURITY: Prevent role escalation — users can update their own profile but NOT their role
create policy "Users can update own profile (no role change)" on public.users for update using (auth.uid() = id) with check (role = 'user');

-- Businesses
create policy "Users can view own businesses" on public.businesses for select using (auth.uid() = user_id);
create policy "Users can create businesses" on public.businesses for insert with check (auth.uid() = user_id);
create policy "Users can update own businesses" on public.businesses for update using (auth.uid() = user_id);

-- FAQs
create policy "Users can manage own faqs" on public.faqs for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Policies
create policy "Users can manage own policies" on public.policies for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Response Templates
create policy "Users can manage own templates" on public.response_templates for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Customers
create policy "Users can manage own customers" on public.customers for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Conversations
create policy "Users can view own conversations" on public.conversations for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Messages
create policy "Users can manage messages" on public.messages for all using (
  conversation_id in (
    select id from public.conversations where business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  )
);

-- Summary Settings
create policy "Users can manage own summary settings" on public.summary_settings for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Escalations
create policy "Users can view own escalations" on public.escalations for all using (
  conversation_id in (
    select id from public.conversations where business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  )
);

-- Unanswered Questions
create policy "Users can manage own unanswered" on public.unanswered_questions for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Plans (public read)
create policy "Anyone can view plans" on public.plans for select using (true);

-- Subscriptions
create policy "Users can view own subscriptions" on public.subscriptions for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Widget Settings
create policy "Users can manage own widget settings" on public.widget_settings for all using (
  business_id in (select id from public.businesses where user_id = auth.uid())
);

-- Admin policies (for admin role)
create policy "Admins can view all businesses" on public.businesses for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can view all faqs" on public.faqs for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can view all policies" on public.policies for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can view all conversations" on public.conversations for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can view all messages" on public.messages for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Trigger to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert default plans
insert into public.plans (name, tier, message_limit, features, price_monthly) values
  ('חינם', 'free', 100, '{"basic_analytics": true, "single_channel": true}'::jsonb, 0),
  ('בסיסי', 'basic', 1000, '{"full_analytics": true, "all_channels": true, "memory": true, "summaries": true}'::jsonb, 99),
  ('פרימיום', 'premium', -1, '{"full_analytics": true, "all_channels": true, "memory": true, "summaries": true, "white_label": true, "priority_support": true}'::jsonb, 299);

-- Performance Indexes (added from architecture review)
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON public.conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started ON public.conversations(business_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_business_id ON public.faqs(business_id, "order");
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_policies_business_id ON public.policies(business_id);
CREATE INDEX IF NOT EXISTS idx_templates_business_id ON public.response_templates(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_escalations_conversation_id ON public.escalations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON public.escalations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_unanswered_business_id ON public.unanswered_questions(business_id);

-- ═══════════════════════════════════════════════════════════════
-- RPC Functions (required by dashboard pages)
-- ═══════════════════════════════════════════════════════════════

-- get_business_analytics: Dashboard analytics KPIs + lists
create or replace function public.get_business_analytics(
  p_business_id uuid,
  p_start_date timestamptz,
  p_prev_start timestamptz,
  p_prev_end timestamptz
) returns json as $$
declare
  result json;
begin
  -- Ownership check: verify calling user owns this business
  if not exists (select 1 from businesses where id = p_business_id and user_id = auth.uid()) then
    raise exception 'forbidden: not your business';
  end if;

  select json_build_object(
    'conversations', (select count(*) from conversations where business_id = p_business_id and started_at >= p_start_date),
    'prev_conversations', (select count(*) from conversations where business_id = p_business_id and started_at >= p_prev_start and started_at < p_prev_end),
    'messages', (select count(*) from messages m join conversations c on m.conversation_id = c.id where c.business_id = p_business_id and m.created_at >= p_start_date),
    'prev_messages', (select count(*) from messages m join conversations c on m.conversation_id = c.id where c.business_id = p_business_id and m.created_at >= p_prev_start and m.created_at < p_prev_end),
    'escalations', (select count(*) from escalations e join conversations c on e.conversation_id = c.id where c.business_id = p_business_id and e.created_at >= p_start_date),
    'prev_escalations', (select count(*) from escalations e join conversations c on e.conversation_id = c.id where c.business_id = p_business_id and e.created_at >= p_prev_start and e.created_at < p_prev_end),
    'satisfaction', (select coalesce(avg(satisfaction_rating), 0) from conversations where business_id = p_business_id and started_at >= p_start_date and satisfaction_rating is not null),
    'prev_satisfaction', (select coalesce(avg(satisfaction_rating), 0) from conversations where business_id = p_business_id and started_at >= p_prev_start and started_at < p_prev_end and satisfaction_rating is not null),
    'sentiment', (
      select json_build_object(
        'positive', coalesce(round(100.0 * count(*) filter (where m.sentiment = 'positive') / nullif(count(*), 0)), 0),
        'neutral', coalesce(round(100.0 * count(*) filter (where m.sentiment = 'neutral') / nullif(count(*), 0)), 0),
        'negative', coalesce(round(100.0 * count(*) filter (where m.sentiment = 'negative') / nullif(count(*), 0)), 0),
        'angry', coalesce(round(100.0 * count(*) filter (where m.sentiment = 'angry') / nullif(count(*), 0)), 0)
      )
      from messages m join conversations c on m.conversation_id = c.id
      where c.business_id = p_business_id and m.created_at >= p_start_date and m.role = 'customer'
    ),
    'channels', (
      select json_build_object(
        'widget', coalesce(round(100.0 * count(*) filter (where channel = 'widget') / nullif(count(*), 0)), 0),
        'whatsapp', coalesce(round(100.0 * count(*) filter (where channel = 'whatsapp') / nullif(count(*), 0)), 0),
        'email', coalesce(round(100.0 * count(*) filter (where channel = 'email') / nullif(count(*), 0)), 0)
      )
      from conversations where business_id = p_business_id and started_at >= p_start_date
    ),
    'top_questions', (
      select coalesce(json_agg(row_to_json(tq)), '[]'::json) from (
        select m.content as question, count(*) as count
        from messages m join conversations c on m.conversation_id = c.id
        where c.business_id = p_business_id and m.created_at >= p_start_date and m.role = 'customer'
        group by m.content order by count desc limit 5
      ) tq
    ),
    'recent_conversations', (
      select coalesce(json_agg(row_to_json(rc)), '[]'::json) from (
        select c.*, (
          select coalesce(json_agg(row_to_json(msg)), '[]'::json)
          from (select * from messages where conversation_id = c.id order by created_at limit 3) msg
        ) as messages
        from conversations c where c.business_id = p_business_id
        order by c.started_at desc limit 5
      ) rc
    ),
    'open_escalations', (
      select coalesce(json_agg(row_to_json(oe)), '[]'::json) from (
        select e.*, row_to_json(c) as conversation
        from escalations e join conversations c on e.conversation_id = c.id
        where c.business_id = p_business_id and e.status in ('open', 'in_progress')
        order by e.created_at desc
      ) oe
    )
  ) into result;
  return result;
end;
$$ language plpgsql security definer;

-- get_conversations_list: Paginated conversation list with filters
create or replace function public.get_conversations_list(
  p_business_id uuid,
  p_start_date timestamptz default null,
  p_channel text default null,
  p_status text default null,
  p_limit int default 50
) returns json as $$
declare
  result json;
begin
  -- Ownership check
  if not exists (select 1 from businesses where id = p_business_id and user_id = auth.uid()) then
    raise exception 'forbidden: not your business';
  end if;

  select json_build_object(
    'conversations', (
      select coalesce(json_agg(row_to_json(cv)), '[]'::json) from (
        select c.*
        from conversations c
        where c.business_id = p_business_id
          and (p_start_date is null or c.started_at >= p_start_date)
          and (p_channel is null or c.channel = p_channel)
          and (p_status = 'needs_agent' and exists (
            select 1 from escalations e where e.conversation_id = c.id and e.status in ('open', 'in_progress')
          ) or p_status = 'resolved' and exists (
            select 1 from escalations e where e.conversation_id = c.id and e.status = 'resolved'
          ) or p_status is null or p_status = 'all')
        order by c.started_at desc
        limit p_limit
      ) cv
    ),
    'escalated_ids', (
      select coalesce(json_agg(e.conversation_id), '[]'::json)
      from escalations e join conversations c on e.conversation_id = c.id
      where c.business_id = p_business_id and e.status in ('open', 'in_progress')
    ),
    'resolved_ids', (
      select coalesce(json_agg(e.conversation_id), '[]'::json)
      from escalations e join conversations c on e.conversation_id = c.id
      where c.business_id = p_business_id and e.status = 'resolved'
    )
  ) into result;
  return result;
end;
$$ language plpgsql security definer;

-- resolve_escalation: Mark an escalation as resolved
create or replace function public.resolve_escalation(p_escalation_id uuid)
returns void as $$
begin
  -- Ownership check: verify user owns the business this escalation belongs to
  if not exists (
    select 1 from escalations e
    join conversations c on e.conversation_id = c.id
    join businesses b on c.business_id = b.id
    where e.id = p_escalation_id and b.user_id = auth.uid()
  ) then
    raise exception 'forbidden: not your escalation';
  end if;

  update escalations set status = 'resolved', resolved_at = now()
  where id = p_escalation_id;
end;
$$ language plpgsql security definer;

-- delete_conversation: Delete a conversation and its messages
create or replace function public.delete_conversation(p_conversation_id uuid)
returns void as $$
begin
  -- Ownership check
  if not exists (
    select 1 from conversations c
    join businesses b on c.business_id = b.id
    where c.id = p_conversation_id and b.user_id = auth.uid()
  ) then
    raise exception 'forbidden: not your conversation';
  end if;

  delete from messages where conversation_id = p_conversation_id;
  delete from escalations where conversation_id = p_conversation_id;
  delete from conversations where id = p_conversation_id;
end;
$$ language plpgsql security definer;

-- JSONB indexes for O(1) business lookup by channel identifier
CREATE INDEX IF NOT EXISTS idx_biz_whatsapp_phone ON public.businesses ((contact_info->>'whatsapp_phone_id')) WHERE contact_info->>'whatsapp_phone_id' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_biz_email ON public.businesses ((contact_info->>'email')) WHERE contact_info->>'email' IS NOT NULL;
