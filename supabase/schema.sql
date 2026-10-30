-- 제주마켓 Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 실행하세요.

-- ============ 1. 테이블 ============

-- 회원 프로필 (auth.users 와 1:1)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  created_at timestamptz not null default now()
);

-- 상품
create table if not exists products (
  id          bigint generated always as identity primary key,
  name        text not null,
  category    text not null,
  price       integer not null check (price >= 0),
  emoji       text not null default '🍊',
  description text not null default '',
  stock       integer not null default 100 check (stock >= 0),
  created_at  timestamptz not null default now()
);

-- 장바구니
create table if not exists cart_items (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id bigint not null references products(id) on delete cascade,
  quantity   integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- 주문 (total_price = 주문 상품들의 수량 x 단가 합계)
create table if not exists orders (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  total_price integer not null check (total_price >= 0),
  status      text not null default 'paid'
              check (status in ('paid', 'refund_requested', 'refunded', 'exchange_requested', 'exchanged')),
  created_at  timestamptz not null default now()
);

-- 주문 상세 (line_total = quantity x unit_price 를 DB가 자동 계산)
create table if not exists order_items (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references orders(id) on delete cascade,
  product_id bigint not null references products(id),
  quantity   integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer generated always as (quantity * unit_price) stored
);

-- 환불 / 교환 요청
create table if not exists order_requests (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references orders(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type       text not null check (type in ('refund', 'exchange')),
  reason     text not null default '',
  status     text not null default 'requested' check (status in ('requested', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- 방명록
create table if not exists guestbook (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

-- 방명록 댓글
create table if not exists comments (
  id           bigint generated always as identity primary key,
  guestbook_id bigint not null references guestbook(id) on delete cascade,
  user_id      uuid not null default auth.uid() references profiles(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 300),
  created_at   timestamptz not null default now()
);

-- 방명록 좋아요 (한 사람이 한 글에 1번)
create table if not exists likes (
  guestbook_id bigint not null references guestbook(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (guestbook_id, user_id)
);

-- ============ 2. 회원가입 시 프로필 자동 생성 ============

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============ 3. 구매 / 환불·교환 함수 ============

-- 장바구니 전체를 주문으로 전환. 금액은 서버에서 수량 x 가격으로 계산합니다.
create or replace function place_order()
returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_order_id bigint;
  v_total    integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다'; end if;

  if not exists (select 1 from cart_items where user_id = v_uid) then
    raise exception '장바구니가 비어 있습니다';
  end if;

  if exists (
    select 1 from cart_items c join products p on p.id = c.product_id
    where c.user_id = v_uid and c.quantity > p.stock
  ) then
    raise exception '재고가 부족한 상품이 있습니다';
  end if;

  select sum(c.quantity * p.price) into v_total
  from cart_items c join products p on p.id = c.product_id
  where c.user_id = v_uid;

  insert into orders (user_id, total_price) values (v_uid, v_total)
  returning id into v_order_id;

  insert into order_items (order_id, product_id, quantity, unit_price)
  select v_order_id, c.product_id, c.quantity, p.price
  from cart_items c join products p on p.id = c.product_id
  where c.user_id = v_uid;

  update products p set stock = p.stock - c.quantity
  from cart_items c
  where c.product_id = p.id and c.user_id = v_uid;

  delete from cart_items where user_id = v_uid;

  return v_order_id;
end $$;

-- 환불 / 교환 요청 (결제 완료 상태의 본인 주문만 가능)
create or replace function request_after_sale(p_order_id bigint, p_type text, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception '로그인이 필요합니다'; end if;
  if p_type not in ('refund', 'exchange') then raise exception '잘못된 요청 유형입니다'; end if;

  if not exists (
    select 1 from orders where id = p_order_id and user_id = v_uid and status = 'paid'
  ) then
    raise exception '요청할 수 없는 주문입니다';
  end if;

  insert into order_requests (order_id, user_id, type, reason)
  values (p_order_id, v_uid, p_type, coalesce(p_reason, ''));

  update orders
  set status = case p_type when 'refund' then 'refund_requested' else 'exchange_requested' end
  where id = p_order_id;
end $$;

grant execute on function place_order() to authenticated;
grant execute on function request_after_sale(bigint, text, text) to authenticated;

-- ============ 4. RLS (행 단위 보안) ============

alter table profiles       enable row level security;
alter table products       enable row level security;
alter table cart_items     enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table order_requests enable row level security;
alter table guestbook      enable row level security;
alter table comments       enable row level security;
alter table likes          enable row level security;

create policy "profiles read"   on profiles for select using (true);
create policy "profiles update" on profiles for update using (auth.uid() = id);

create policy "products read" on products for select using (true);

create policy "cart own" on cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 주문은 조회만 직접 허용. 생성/상태변경은 위 함수로만 가능
create policy "orders read own" on orders for select using (auth.uid() = user_id);

create policy "order_items read own" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "order_requests read own" on order_requests for select using (auth.uid() = user_id);

create policy "guestbook read"   on guestbook for select using (true);
create policy "guestbook insert" on guestbook for insert with check (auth.uid() = user_id);
create policy "guestbook delete" on guestbook for delete using (auth.uid() = user_id);

create policy "comments read"   on comments for select using (true);
create policy "comments insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments delete" on comments for delete using (auth.uid() = user_id);

create policy "likes read"   on likes for select using (true);
create policy "likes insert" on likes for insert with check (auth.uid() = user_id);
create policy "likes delete" on likes for delete using (auth.uid() = user_id);

-- ============ 5. 상품 샘플 데이터 (가격은 예시) ============

insert into products (name, category, price, emoji, description, stock) values
  ('제주 감귤 3kg',        '과일',     15900, '🍊', '새콤달콤 노지 감귤', 200),
  ('한라봉 2kg',           '과일',     24900, '🍊', '당도 높은 프리미엄 한라봉', 150),
  ('천혜향 2kg',           '과일',     29900, '🍑', '향긋하고 부드러운 과즙', 100),
  ('제주 은갈치 3미',      '수산물',   39900, '🐟', '두툼한 제주 근해 갈치', 80),
  ('옥돔 구이용 2미',      '수산물',   35900, '🐠', '손질 완료, 바로 구워 드세요', 80),
  ('흑돼지 오겹살 600g',   '정육',     28900, '🥓', '쫄깃한 제주 흑돼지', 120),
  ('오메기떡 12개입',      '가공식품', 14900, '🍡', '제주 전통 떡', 150),
  ('보리빵 10개입',        '가공식품',  9900, '🍞', '촉촉한 제주 보리빵', 150),
  ('청귤청 500ml',         '가공식품', 12900, '🍯', '차와 에이드로 즐기는 청귤청', 100),
  ('제주 녹차 티백 20입',  '가공식품', 11900, '🍵', '청정 제주 녹차', 100);
