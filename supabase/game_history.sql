-- One-time archive of the original game records; new games come from settlement_sessions.rounds.
create table public.game_history (
  id uuid primary key,
  game text not null,
  amount bigint not null,
  date date,
  title text not null,
  completed boolean not null default false,
  my_team text[] not null default '{}',
  opp_team text[] not null default '{}'
);
alter table public.game_history enable row level security;
revoke all on public.game_history from anon, authenticated;
grant select, insert on public.game_history to service_role;
