create extension if not exists pgcrypto;

create type exchange_narrative_type as enum ('shared_event', 'life_period');
create type exchange_method as enum ('tell_first', 'write_together');
create type delivery_mode as enum ('immediate', 'scheduled');
create type source_access_policy as enum ('hidden', 'after_storybook');
create type exchange_status as enum ('draft', 'invited', 'writing', 'generating', 'storybook_ready', 'delivered', 'completed', 'archived');
create type participant_role as enum ('creator', 'partner');
create type draft_status as enum ('editing', 'ai_organizing', 'candidate_ready', 'confirmed', 'submitted');
create type storybook_kind as enum ('personal', 'joint');
create type job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_path text,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.relationship_spaces (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.space_members (
  space_id uuid not null references public.relationship_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role participant_role not null,
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id),
  unique (space_id, role)
);

create table public.exchanges (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete restrict,
  narrative_type exchange_narrative_type not null,
  exchange_method exchange_method not null,
  delivery_mode delivery_mode not null default 'immediate',
  source_access_policy source_access_policy not null default 'after_storybook',
  scheduled_at timestamptz,
  status exchange_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  code_hash text not null unique,
  status text not null default 'active',
  expires_at timestamptz,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.context_cards (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null unique references public.exchanges(id) on delete cascade,
  type exchange_narrative_type not null,
  title text not null,
  description text,
  time_hint text,
  place_hint text,
  theme_key text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.journey_entries (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz,
  title text,
  text text not null,
  place_hint text,
  include_in_story boolean not null default true,
  status text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status draft_status not null default 'editing',
  current_text text not null default '',
  cursor_state jsonb not null default '{}'::jsonb,
  last_saved_at timestamptz not null default now(),
  unique (exchange_id, owner_id)
);

create table public.draft_versions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.drafts(id) on delete cascade,
  kind text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.drafts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  media_type text not null,
  visibility text not null default 'private',
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  capability text not null,
  input_refs jsonb not null default '[]'::jsonb,
  status job_status not null default 'queued',
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.story_sources (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  content text not null,
  source_refs jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  unique (exchange_id, owner_id, version)
);

create table public.storybooks (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  kind storybook_kind not null,
  status job_status not null default 'queued',
  content jsonb not null default '{}'::jsonb,
  layout jsonb not null default '{}'::jsonb,
  source_snapshot jsonb not null default '[]'::jsonb,
  generated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.storybook_approvals (
  storybook_id uuid not null references public.storybooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  feedback text,
  approved_at timestamptz,
  primary key (storybook_id, user_id)
);

create table public.storybook_reading_receipts (
  storybook_id uuid not null references public.storybooks(id) on delete cascade,
  reader_id uuid not null references auth.users(id) on delete cascade,
  opened_at timestamptz,
  completed_at timestamptz,
  last_position jsonb not null default '{}'::jsonb,
  primary key (storybook_id, reader_id)
);

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  reply_to_letter_id uuid references public.letters(id) on delete set null,
  status text not null default 'draft',
  confirmed_text text not null,
  layout jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reading_receipts (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  reader_id uuid not null references auth.users(id) on delete cascade,
  opened_at timestamptz,
  acknowledged_at timestamptz,
  last_position jsonb not null default '{}'::jsonb,
  unique (letter_id, reader_id)
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  reaction_key text not null,
  created_at timestamptz not null default now(),
  unique (letter_id, sender_id)
);

create table public.convergences (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null unique references public.exchanges(id) on delete cascade,
  type exchange_narrative_type not null,
  status job_status not null default 'queued',
  content jsonb not null default '{}'::jsonb,
  source_snapshot jsonb not null default '[]'::jsonb,
  generated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.memory_fragments (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  convergence_id uuid references public.convergences(id) on delete set null,
  story_time timestamptz,
  completed_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.memory_interactions (
  id uuid primary key default gen_random_uuid(),
  fragment_id uuid not null references public.memory_fragments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  unique (fragment_id, user_id, type)
);

create or replace function public.is_space_member(target_space_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.space_members
    where space_id = target_space_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_exchange_member(target_exchange_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.exchanges e
    join public.space_members sm on sm.space_id = e.space_id
    where e.id = target_exchange_id and sm.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.relationship_spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.exchanges enable row level security;
alter table public.invites enable row level security;
alter table public.context_cards enable row level security;
alter table public.journey_entries enable row level security;
alter table public.drafts enable row level security;
alter table public.draft_versions enable row level security;
alter table public.media_assets enable row level security;
alter table public.ai_runs enable row level security;
alter table public.story_sources enable row level security;
alter table public.storybooks enable row level security;
alter table public.storybook_approvals enable row level security;
alter table public.storybook_reading_receipts enable row level security;
alter table public.letters enable row level security;
alter table public.reading_receipts enable row level security;
alter table public.reactions enable row level security;
alter table public.convergences enable row level security;
alter table public.memory_fragments enable row level security;
alter table public.memory_interactions enable row level security;

create policy "profiles own profile" on public.profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "spaces visible to members" on public.relationship_spaces for select using (public.is_space_member(id));
create policy "spaces can be created by owner" on public.relationship_spaces for insert with check (created_by = auth.uid());
create policy "members visible to same space" on public.space_members for select using (public.is_space_member(space_id));
create policy "members can insert self" on public.space_members for insert with check (user_id = auth.uid());
create policy "exchanges visible to members" on public.exchanges for select using (public.is_exchange_member(id));
create policy "exchanges created by member" on public.exchanges for insert with check (creator_id = auth.uid() and public.is_space_member(space_id));
create policy "context visible to exchange members" on public.context_cards for select using (public.is_exchange_member(exchange_id));
create policy "private journey entries owned only" on public.journey_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "private drafts owned only" on public.drafts for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "private draft versions owned only" on public.draft_versions for all using (exists (select 1 from public.drafts d where d.id = draft_id and d.owner_id = auth.uid())) with check (exists (select 1 from public.drafts d where d.id = draft_id and d.owner_id = auth.uid()));
create policy "private media owned only" on public.media_assets for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ai runs owned only" on public.ai_runs for select using (owner_id = auth.uid());
create policy "story sources owned before publication" on public.story_sources for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "storybooks visible to members" on public.storybooks for select using (public.is_exchange_member(exchange_id));
create policy "storybook approvals visible to members" on public.storybook_approvals for select using (exists (select 1 from public.storybooks s where s.id = storybook_id and public.is_exchange_member(s.exchange_id)));
create policy "storybook receipts owned only" on public.storybook_reading_receipts for all using (reader_id = auth.uid()) with check (reader_id = auth.uid());
create policy "letters visible after own or delivered" on public.letters for select using (sender_id = auth.uid() or (recipient_id = auth.uid() and delivered_at is not null));
create policy "letters sent by owner" on public.letters for insert with check (sender_id = auth.uid());
create policy "reading receipts owned only" on public.reading_receipts for all using (reader_id = auth.uid()) with check (reader_id = auth.uid());
create policy "reactions owned only" on public.reactions for all using (sender_id = auth.uid()) with check (sender_id = auth.uid());
create policy "convergences visible to members" on public.convergences for select using (public.is_exchange_member(exchange_id));
create policy "memory fragments visible to members" on public.memory_fragments for select using (public.is_exchange_member(exchange_id));
create policy "memory interactions visible to members" on public.memory_interactions for select using (exists (select 1 from public.memory_fragments mf where mf.id = fragment_id and public.is_exchange_member(mf.exchange_id)));
create policy "memory interactions owned insert" on public.memory_interactions for insert with check (user_id = auth.uid());
