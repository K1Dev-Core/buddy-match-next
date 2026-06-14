-- ============================================
-- Buddy Match Next — Supabase Setup
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. TABLES
-- ============================================
create table if not exists public.seniors (
  id text primary key,
  full_name text not null,
  contact text not null default '',
  hints text[] not null default '{}',
  updated_at timestamptz not null default now(),
  assignment_cap int not null default 1,
  created_at timestamptz not null default now()
);

-- migration: add column if table existed before this column
alter table public.seniors add column if not exists assignment_cap int default 1;
update public.seniors set assignment_cap = 1 where assignment_cap is null;
alter table public.seniors alter column assignment_cap set not null;
alter table public.seniors add column if not exists greeting text not null default '';
alter table public.seniors add column if not exists is_admin boolean not null default false;

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  junior_id text not null unique,
  junior_code4 text not null,
  senior_id text not null references public.seniors(id),
  assigned_at timestamptz not null default now()
);

create index if not exists idx_assignments_junior_id on public.assignments(junior_id);
create index if not exists idx_assignments_senior_id on public.assignments(senior_id);

-- ============================================
-- 2. RPC: assign_senior_to_junior
-- ใช้ตอนน้องกดสุ่มพี่รหัส
-- ============================================
create or replace function public.assign_senior_to_junior(
  p_junior_code4 text,
  p_junior_id text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing record;
  v_available int;
  v_senior record;
begin
  select a.senior_id, a.assigned_at, s.full_name, s.contact, s.hints, s.greeting, s.updated_at
  into v_existing
  from public.assignments a
  join public.seniors s on s.id = a.senior_id
  where a.junior_id = p_junior_id;
  if found then
    return json_build_object('status','existing','assignment',json_build_object('assignedAt',v_existing.assigned_at,'juniorCode4',p_junior_code4,'juniorId',p_junior_id,'seniorId',v_existing.senior_id),'profile',json_build_object('seniorId',v_existing.senior_id,'fullName',v_existing.full_name,'contact',v_existing.contact,'hints',v_existing.hints,'greeting',v_existing.greeting,'updatedAt',to_char(v_existing.updated_at,'YYYY-MM-DD"T"HH24:MI:SS"Z"')));
  end if;
  select count(*) into v_available from public.seniors where coalesce(array_length(hints,1),0)>=1;
  if v_available=0 then
    return json_build_object('status','empty','message','ยังไม่มีพี่รหัสเปิดรับน้อง');
  end if;
  select s.id,s.full_name,s.contact,s.hints,s.greeting,s.updated_at,s.assignment_cap,coalesce(a.c,0) as current_count
  into v_senior
  from public.seniors s
  left join(select senior_id,count(*)as c from public.assignments group by senior_id)a on a.senior_id=s.id
  where coalesce(a.c,0)<s.assignment_cap and coalesce(array_length(s.hints,1),0)>=1
  order by hashtext(p_junior_id||s.id)limit 1;
  if not found then
    return json_build_object('status','exhausted','message','พี่รหัสถูกสุ่มหมดแล้ว');
  end if;
  insert into public.assignments(junior_id,junior_code4,senior_id)values(p_junior_id,p_junior_code4,v_senior.id);
  return json_build_object('status','assigned','assignment',json_build_object('assignedAt',now(),'juniorCode4',p_junior_code4,'juniorId',p_junior_id,'seniorId',v_senior.id),'profile',json_build_object('seniorId',v_senior.id,'fullName',v_senior.full_name,'contact',v_senior.contact,'hints',v_senior.hints,'greeting',v_senior.greeting,'updatedAt',to_char(v_senior.updated_at,'YYYY-MM-DD"T"HH24:MI:SS"Z"')));
end;
$$;

-- ============================================
-- 3. RPC: lookup_junior_assignment
-- ใช้เช็คว่าน้องเคยสุ่มไว้หรือยัง
-- ============================================
create or replace function public.lookup_junior_assignment(
  p_junior_id text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result record;
begin
  select 
    a.senior_id,
    a.junior_code4,
    a.assigned_at,
    s.full_name,
    s.contact,
    s.hints,
    s.greeting,
    s.updated_at
  into v_result
  from public.assignments a
  join public.seniors s on s.id = a.senior_id
  where a.junior_id = p_junior_id;

  if not found then
    return null;
  end if;

  return json_build_object(
    'status', 'existing',
    'assignment', json_build_object(
      'assignedAt', v_result.assigned_at,
      'juniorCode4', v_result.junior_code4,
      'juniorId', p_junior_id,
      'seniorId', v_result.senior_id
    ),
    'profile', json_build_object(
      'seniorId', v_result.senior_id,
      'fullName', v_result.full_name,
      'contact', v_result.contact,
      'hints', v_result.hints,
      'greeting', v_result.greeting,
      'updatedAt', to_char(v_result.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );
end;
$$;

-- ============================================
-- 4. RPC: get_senior_count
-- ใช้แสดงจำนวนพี่รหัสที่พร้อมรับน้องหน้าแรก
-- ============================================
create or replace function public.get_senior_count()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  select count(*) into v_count
  from public.seniors s
  left join (
    select senior_id, count(*) as assignment_count
    from public.assignments
    group by senior_id
  ) a on a.senior_id = s.id
  where coalesce(a.assignment_count, 0) < s.assignment_cap
    and coalesce(array_length(s.hints, 1), 0) >= 1;

  return v_count;
end;
$$;

-- ============================================
-- 5. RPC: upsert_senior_profile
-- ใช้ตอนรุ่นพี่บันทึกข้อมูลจาก Senior Dashboard
-- security definer = bypass RLS
-- ============================================
create or replace function public.upsert_senior_profile(
  p_id text,
  p_full_name text,
  p_contact text,
  p_hints text[],
  p_greeting text default ''
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.seniors (id, full_name, contact, hints, greeting, updated_at)
  values (p_id, p_full_name, p_contact, p_hints, p_greeting, now())
  on conflict (id)
  do update set
    full_name = excluded.full_name,
    contact = excluded.contact,
    hints = excluded.hints,
    greeting = excluded.greeting,
    updated_at = now();

  return json_build_object('status', 'ok');
end;
$$;

-- ============================================
-- 6. RPC: get_all_seniors
-- ใช้ในหน้า Admin Dashboard
-- ============================================
create or replace function public.get_all_seniors()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  select json_agg(
    json_build_object(
      'id', s.id,
      'fullName', s.full_name,
      'contact', s.contact,
      'hints', s.hints,
      'greeting', s.greeting,
      'updatedAt', to_char(s.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'isAdmin', s.is_admin,
      'assignmentCap', s.assignment_cap,
      'currentCount', coalesce(a.c, 0),
      'juniorId', a2.junior_id,
      'juniorCode4', a2.junior_code4,
      'assignedAt', to_char(a2.assigned_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    ) order by s.full_name
  ) into v_result
  from public.seniors s
  left join (select senior_id, count(*) as c from public.assignments group by senior_id) a on a.senior_id = s.id
  left join lateral (select junior_id, junior_code4, assigned_at from public.assignments where senior_id = s.id limit 1) a2 on true;

  return coalesce(v_result, '[]'::json);
end;
$$;

-- ============================================
-- 7. RPC: get_admin_stats
-- ใช้แสดงภาพรวมใน Admin Dashboard
-- ============================================
create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_assigned int;
  v_unassigned int;
begin
  select count(*) into v_total from public.seniors;
  select count(distinct senior_id) into v_assigned from public.assignments;
  select count(*) into v_unassigned
  from public.seniors s
  left join public.assignments a on a.senior_id = s.id
  where a.id is null;

  return json_build_object(
    'totalSeniors', v_total,
    'assignedSeniors', v_assigned,
    'unassignedSeniors', v_unassigned
  );
end;
$$;

-- ============================================
-- 8. RPC: get_matching_open, set_matching_open
-- ใช้เปิด/ปิดระบบสุ่มพี่รหัสจากหน้า Admin
-- ============================================
create table if not exists public.admin_settings (
  id int primary key default 1,
  matching_open boolean not null default true,
  constraint single_row check (id = 1)
);
insert into public.admin_settings (id, matching_open) values (1, true) on conflict (id) do nothing;

create or replace function public.get_matching_open()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open boolean;
begin
  select matching_open into v_open from public.admin_settings where id = 1;
  return coalesce(v_open, true);
end;
$$;

create or replace function public.set_matching_open(
  p_open boolean
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_settings (id, matching_open) values (1, p_open)
  on conflict (id) do update set matching_open = p_open;
  return json_build_object('status', 'ok', 'open', p_open);
end;
$$;

-- ============================================
-- 9. RPC: clear_assignment
-- ใช้ใน Admin Dashboard เพื่อลบน้องออกจากพี่
-- ============================================
create or replace function public.clear_assignment(
  p_senior_id text
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.assignments where senior_id = p_senior_id;
  return json_build_object('status', 'ok');
end;
$$;

-- ============================================
-- 10. RPC: set_senior_admin
-- ใช้ใน auth callback สำหรับกำหนด is_admin
-- ============================================
create or replace function public.set_senior_admin(
  p_id text,
  p_admin boolean
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.seniors set is_admin = p_admin where id = p_id;
  return json_build_object('status', 'ok');
end;
$$;

-- ============================================
-- 11. DISABLE RLS (ใช้ security definer RPC แทน)
-- ============================================
alter table public.seniors disable row level security;
alter table public.assignments disable row level security;

-- ============================================
-- 12. GRANT PERMISSIONS
-- ให้ anon key เรียก RPC เท่านั้น (อ่าน table โดยตรงผ่าน JS client ไม่ได้)
-- ============================================
grant usage on schema public to anon;
grant select on public.seniors to anon;
grant select on public.assignments to anon;
grant execute on function public.assign_senior_to_junior(text, text) to anon;
grant execute on function public.lookup_junior_assignment(text) to anon;
grant execute on function public.get_senior_count() to anon;
grant execute on function public.upsert_senior_profile(text, text, text, text[], text) to anon;
grant execute on function public.get_all_seniors() to anon;
grant execute on function public.get_admin_stats() to anon;
grant execute on function public.clear_assignment(text) to anon;
grant execute on function public.set_senior_admin(text, boolean) to anon;
grant execute on function public.get_matching_open() to anon;
grant execute on function public.set_matching_open(boolean) to anon;
