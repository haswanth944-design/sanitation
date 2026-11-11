-- Smart Sanitation Complaint Management System: run in Supabase SQL Editor
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null,
  mobile_number text check (mobile_number ~ '^[0-9]{10}$'),
  village text default 'Chendra Gudem',
  role text not null default 'villager' check (role in ('villager','officer','admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id serial primary key,
  name text unique not null,
  is_active boolean not null default true
);
insert into public.categories(name) values
('Waste Accumulation'),('Improper Waste Disposal'),('Drainage Blockage'),
('Overflowing Drains'),('Water Stagnation'),('Street Cleanliness'),('Other Sanitation Issues');

create sequence public.complaint_seq start 1001;

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_number text unique not null default ('CG-' || to_char(now(),'YYYY') || '-' || nextval('public.complaint_seq')),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null references public.categories(name),
  description text not null check (char_length(description) between 10 and 1000),
  location text not null check (char_length(location) between 3 and 200),
  landmark text,
  image_url text,
  priority text not null default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  status text not null default 'Pending' check (status in ('Pending','In Progress','Resolved','Rejected')),
  assigned_officer uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.complaints(user_id);
create index on public.complaints(status);
create index on public.complaints(created_at desc);

create table public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  updated_by uuid references public.profiles(id),
  old_status text, new_status text not null, remarks text,
  created_at timestamptz not null default now()
);
create index on public.complaint_updates(complaint_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  complaint_id uuid references public.complaints(id) on delete cascade,
  title text not null, message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, is_read);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null, entity_type text, entity_id text,
  created_at timestamptz not null default now()
);

-- Helpers (security definer avoids RLS recursion)
create or replace function public.current_role_name() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- Signup always creates a villager; role in metadata is ignored
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email, mobile_number, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','Villager'), new.email,
          nullif(new.raw_user_meta_data->>'mobile_number',''), 'villager');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Block self-promotion: only admins may change role
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and coalesce(public.current_role_name(),'') <> 'admin' then
    raise exception 'Only a super admin can change roles';
  end if;
  return new;
end $$;
create trigger protect_role_trg before update on public.profiles
for each row execute function public.protect_role();

create or replace function public.touch_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;
create trigger complaints_touch before update on public.complaints
for each row execute function public.touch_updated_at();

-- Officer/admin action: status + priority + remarks, with history, notification, log
create or replace function public.update_complaint(p_id uuid, p_status text, p_priority text, p_remarks text)
returns void language plpgsql security definer set search_path = public as $$
declare c public.complaints; r text := public.current_role_name();
begin
  if r not in ('officer','admin') then raise exception 'Not authorized'; end if;
  select * into c from public.complaints where id = p_id for update;
  if not found then raise exception 'Complaint not found'; end if;
  update public.complaints set status = p_status, priority = p_priority,
         assigned_officer = auth.uid() where id = p_id;
  insert into public.complaint_updates(complaint_id, updated_by, old_status, new_status, remarks)
  values (p_id, auth.uid(), c.status, p_status, p_remarks);
  if c.status is distinct from p_status then
    insert into public.notifications(user_id, complaint_id, title, message)
    values (c.user_id, p_id, 'Complaint ' || c.complaint_number || ' updated',
            'Status changed from ' || c.status || ' to ' || p_status ||
            coalesce('. Remarks: ' || nullif(p_remarks,''), ''));
  end if;
  insert into public.activity_logs(actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'Status -> ' || p_status, 'complaint', c.complaint_number);
end $$;

-- Admin action: assign role to an existing account (create officers this way)
create or replace function public.admin_set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.current_role_name() <> 'admin' then raise exception 'Not authorized'; end if;
  if p_role not in ('villager','officer','admin') then raise exception 'Invalid role'; end if;
  update public.profiles set role = p_role where id = p_user;
  insert into public.activity_logs(actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'Role set to ' || p_role, 'profile', p_user::text);
end $$;

-- Public tracking by complaint number (limited fields only)
create or replace function public.track_complaint(p_number text)
returns table(complaint_number text, category text, status text, priority text, created_at timestamptz, updated_at timestamptz)
language sql security definer set search_path = public as
$$ select complaint_number, category, status, priority, created_at, updated_at
   from complaints where complaint_number = upper(trim(p_number)) $$;
grant execute on function public.track_complaint(text) to anon, authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "profile read own or staff" on public.profiles for select
  using (id = auth.uid() or public.current_role_name() in ('officer','admin'));
create policy "profile update own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admin update profiles" on public.profiles for update
  using (public.current_role_name() = 'admin');

create policy "categories read" on public.categories for select using (true);
create policy "admin manage categories" on public.categories for all
  using (public.current_role_name() = 'admin') with check (public.current_role_name() = 'admin');

create policy "complaints read" on public.complaints for select
  using (user_id = auth.uid() or public.current_role_name() in ('officer','admin'));
create policy "villager insert own" on public.complaints for insert
  with check (user_id = auth.uid() and status = 'Pending' and priority = 'Medium');
create policy "villager delete own pending" on public.complaints for delete
  using (user_id = auth.uid() and status = 'Pending');
create policy "admin delete complaints" on public.complaints for delete
  using (public.current_role_name() = 'admin');

create policy "updates read" on public.complaint_updates for select
  using (exists (select 1 from public.complaints c where c.id = complaint_id
        and (c.user_id = auth.uid() or public.current_role_name() in ('officer','admin'))));

create policy "notif read own" on public.notifications for select using (user_id = auth.uid());
create policy "notif update own" on public.notifications for update using (user_id = auth.uid());

create policy "logs admin read" on public.activity_logs for select
  using (public.current_role_name() = 'admin');

-- Storage: private bucket, files stored as <user_id>/<file>
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-images','complaint-images', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'complaint-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own or staff" on storage.objects for select to authenticated
  using (bucket_id = 'complaint-images' and ((storage.foldername(name))[1] = auth.uid()::text
         or public.current_role_name() in ('officer','admin')));

-- FIRST SUPER ADMIN: register normally, then run once in SQL editor (as postgres):
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
