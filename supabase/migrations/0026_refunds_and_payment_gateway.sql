-- ============================================================
-- Migration 0026: Refunds, cancellations & gateway payment ids
-- ============================================================
-- 1. orders.payment_gateway_id  : verified gateway payment id (Razorpay pay_...)
-- 2. orders.refunded_amount     : running total of processed refunds
-- 3. orders.payment_status      : constrained, now also 'refunded' / 'partially_refunded'
-- 4. public.refunds             : refund requests and their lifecycle
-- 5. Trigger guard              : refunds can never exceed the order total
-- 6. Trigger sync               : processed refunds roll up into orders
-- ============================================================

-- 1-2. New order columns ---------------------------------------
alter table public.orders
  add column if not exists payment_gateway_id text,
  add column if not exists refunded_amount numeric(12,2) not null default 0;

-- A gateway payment can only ever belong to one order.
create unique index if not exists orders_payment_gateway_id_key
  on public.orders (payment_gateway_id)
  where payment_gateway_id is not null;

-- 3. payment_status was free text in 0004. Constrain it to the values the app
-- writes. NOT VALID keeps legacy rows readable while enforcing new writes.
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded'))
  not valid;

alter table public.orders drop constraint if exists orders_refunded_amount_check;
alter table public.orders
  add constraint orders_refunded_amount_check
  check (refunded_amount >= 0 and refunded_amount <= total_amount)
  not valid;

-- 4. Refunds table ---------------------------------------------
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR',
  reason text check (reason is null or char_length(reason) <= 1000),
  type text not null check (type in ('cancellation', 'return', 'admin')),
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'processing', 'processed', 'rejected', 'failed')),
  method text not null default 'manual' check (method in ('razorpay', 'manual')),
  gateway_payment_id text,
  gateway_refund_id text,
  manual_reference text,
  failure_reason text,
  requested_by uuid references public.profiles (id) on delete set null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A manual refund cannot be marked processed without a bank/UPI reference (UTR).
  constraint refunds_manual_reference_required check (
    status <> 'processed' or method <> 'manual' or coalesce(btrim(manual_reference), '') <> ''
  )
);

create index if not exists refunds_order_id_idx on public.refunds (order_id);
create index if not exists refunds_status_idx on public.refunds (status);
create index if not exists refunds_created_at_idx on public.refunds (created_at desc);
create unique index if not exists refunds_gateway_refund_id_key
  on public.refunds (gateway_refund_id)
  where gateway_refund_id is not null;

-- Only one open refund per order at a time (prevents double cancel/return requests).
create unique index if not exists refunds_one_open_per_order
  on public.refunds (order_id)
  where status in ('requested', 'approved', 'processing');

alter table public.refunds enable row level security;

-- Buyers can read refunds of their own orders.
drop policy if exists "Buyers can view own refunds" on public.refunds;
create policy "Buyers can view own refunds"
  on public.refunds for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = refunds.order_id and o.customer_id = auth.uid()
    )
  );

-- Buyers can only open a 'requested' refund, for their own order, as themselves,
-- without any reviewer/gateway fields pre-filled.
drop policy if exists "Buyers can request refunds for own orders" on public.refunds;
create policy "Buyers can request refunds for own orders"
  on public.refunds for insert
  with check (
    status = 'requested'
    and type in ('cancellation', 'return')
    and requested_by = auth.uid()
    and reviewed_by is null
    and gateway_refund_id is null
    and manual_reference is null
    and processed_at is null
    and exists (
      select 1 from public.orders o
      where o.id = refunds.order_id and o.customer_id = auth.uid()
    )
  );

-- Admins have full access.
drop policy if exists "Admins manage refunds" on public.refunds;
create policy "Admins manage refunds"
  on public.refunds for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Over-refund guard -----------------------------------------
-- Locks the order row so concurrent refunds are serialised, then checks that
-- every non-rejected, non-failed refund together stays within the order total.
create or replace function public.enforce_refund_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric(12,2);
  v_committed numeric(12,2);
begin
  if new.status in ('rejected', 'failed') then
    return new;
  end if;

  select total_amount into v_total
  from public.orders
  where id = new.order_id
  for update;

  if v_total is null then
    raise exception 'Order % not found for refund', new.order_id;
  end if;

  select coalesce(sum(amount), 0) into v_committed
  from public.refunds
  where order_id = new.order_id
    and id <> new.id
    and status not in ('rejected', 'failed');

  if v_committed + new.amount > v_total then
    raise exception 'Refund of % exceeds the refundable balance % for order %',
      new.amount, greatest(v_total - v_committed, 0), new.order_id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists refunds_enforce_limit on public.refunds;
create trigger refunds_enforce_limit
  before insert or update of amount, status on public.refunds
  for each row execute function public.enforce_refund_limit();

-- updated_at maintenance
create or replace function public.touch_refunds_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists refunds_touch_updated_at on public.refunds;
create trigger refunds_touch_updated_at
  before update on public.refunds
  for each row execute function public.touch_refunds_updated_at();

-- 6. Roll processed refunds up into the order -------------------
create or replace function public.sync_order_refund_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric(12,2);
  v_refunded numeric(12,2);
begin
  select total_amount into v_total from public.orders where id = new.order_id;

  select coalesce(sum(amount), 0) into v_refunded
  from public.refunds
  where order_id = new.order_id and status = 'processed';

  update public.orders
  set
    refunded_amount = v_refunded,
    payment_status = case
      when v_refunded <= 0 then payment_status
      when v_refunded >= v_total then 'refunded'
      else 'partially_refunded'
    end,
    updated_at = now()
  where id = new.order_id;

  return new;
end;
$$;

drop trigger if exists refunds_sync_order_totals on public.refunds;
create trigger refunds_sync_order_totals
  after insert or update of status, amount on public.refunds
  for each row execute function public.sync_order_refund_totals();

-- 7. Lock down order money columns ---------------------------------
-- Orders now carry the gateway payment id and refund totals that drive real
-- refunds. All order writes happen server-side with the service role
-- (packages/database/src/orders.ts), so end users no longer insert orders
-- directly through the API (0004 allowed `with check (true)`).
drop policy if exists "Buyers can create orders" on public.orders;

-- Sellers keep their 0004 UPDATE policy for fulfilment fields, but payment and
-- amount columns may only change through the service role, an admin, or the
-- refund roll-up trigger above (which runs as the caller of a refund write).
create or replace function public.protect_order_payment_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(auth.role(), 'service_role');
begin
  if v_role = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.payment_status is distinct from old.payment_status
     or new.payment_gateway_id is distinct from old.payment_gateway_id
     or new.refunded_amount is distinct from old.refunded_amount
     or new.total_amount is distinct from old.total_amount
     or new.subtotal is distinct from old.subtotal
     or new.customer_id is distinct from old.customer_id then
    -- Allow the refund roll-up trigger (nested inside a refunds write).
    if pg_trigger_depth() > 1 then
      return new;
    end if;
    raise exception 'Only the platform can change payment fields on an order'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_protect_payment_columns on public.orders;
create trigger orders_protect_payment_columns
  before update on public.orders
  for each row execute function public.protect_order_payment_columns();
