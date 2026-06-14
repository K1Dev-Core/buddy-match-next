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
  v_available_seniors bigint;
  v_senior_record record;
begin
  -- เช็คว่าเคยสุ่มแล้วหรือยัง
  select 
    a.senior_id as assigned_senior_id,
    a.assigned_at as assigned_at,
    s.full_name,
    s.contact,
    s.hints,
    s.updated_at
  into v_existing
  from public.assignments a
  join public.seniors s on s.id = a.senior_id
  where a.junior_id = p_junior_id;

  if found then
    return json_build_object(
      'status', 'existing',
      'assignment', json_build_object(
        'assignedAt', v_existing.assigned_at,
        'juniorCode4', p_junior_code4,
        'juniorId', p_junior_id,
        'seniorId', v_existing.assigned_senior_id
      ),
      'profile', json_build_object(
        'seniorId', v_existing.assigned_senior_id,
        'fullName', v_existing.full_name,
        'contact', v_existing.contact,
        'hints', v_existing.hints,
        'updatedAt', to_char(v_existing.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
    );
  end if;

  -- เช็คว่ามีพี่รหัสที่ setup profile แล้วในระบบไหม
  select count(*) into v_available_seniors
  from public.seniors
  where coalesce(array_length(hints, 1), 0) >= 1;

  if v_available_seniors = 0 then
    return json_build_object(
      'status', 'empty',
      'message', 'ยังไม่มีพี่รหัสเปิดรับน้อง'
    );
  end if;

  -- หาพี่รหัสที่ยังรับได้ (deterministic: hash(junior_id + senior_id))
  select 
    s.id,
    s.full_name,
    s.contact,
    s.hints,
    s.updated_at,
    coalesce(a.assignment_count, 0) as current_count
  into v_senior_record
  from public.seniors s
  left join (
    select senior_id, count(*) as assignment_count
    from public.assignments
    group by senior_id
  ) a on a.senior_id = s.id
  where coalesce(a.assignment_count, 0) < s.assignment_cap
    and coalesce(array_length(s.hints, 1), 0) >= 5
  order by hashtext(p_junior_id || s.id)
  limit 1;

  if not found then
    return json_build_object(
      'status', 'exhausted',
      'message', 'พี่รหัสถูกสุ่มหมดแล้ว'
    );
  end if;

  -- insert assignment
  insert into public.assignments (junior_id, junior_code4, senior_id)
  values (p_junior_id, p_junior_code4, v_senior_record.id);

  return json_build_object(
    'status', 'assigned',
    'assignment', json_build_object(
      'assignedAt', now(),
      'juniorCode4', p_junior_code4,
      'juniorId', p_junior_id,
      'seniorId', v_senior_record.id
    ),
    'profile', json_build_object(
      'seniorId', v_senior_record.id,
      'fullName', v_senior_record.full_name,
      'contact', v_senior_record.contact,
      'hints', v_senior_record.hints,
      'updatedAt', to_char(v_senior_record.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );
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
  p_hints text[]
) returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.seniors (id, full_name, contact, hints, updated_at)
  values (p_id, p_full_name, p_contact, p_hints, now())
  on conflict (id)
  do update set
    full_name = excluded.full_name,
    contact = excluded.contact,
    hints = excluded.hints,
    updated_at = now();

  return json_build_object('status', 'ok');
end;
$$;

-- ============================================
-- 6. DISABLE RLS (ใช้ security definer RPC แทน)
-- ============================================
alter table public.seniors disable row level security;
alter table public.assignments disable row level security;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ให้ anon key เรียก RPC และอ่าน/เขียน table ได้
-- ============================================
grant usage on schema public to anon;
grant all on public.seniors to anon;
grant all on public.assignments to anon;
grant execute on function public.assign_senior_to_junior(text, text) to anon;
grant execute on function public.lookup_junior_assignment(text) to anon;
grant execute on function public.get_senior_count() to anon;
grant execute on function public.upsert_senior_profile(text, text, text, text[]) to anon;
