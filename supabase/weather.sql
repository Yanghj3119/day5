-- 날씨 관측 기록 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. (여러 번 실행해도 안전)

create table if not exists weather_observations (
  id          bigint generated always as identity primary key,
  region      text        not null default '',          -- 지역명 (예: 서귀포시)
  nx          integer     not null,                     -- 기상청 격자 X
  ny          integer     not null,                     -- 기상청 격자 Y
  observed_at timestamptz not null,                     -- 관측 기준 시각 (base_date + base_time, KST)
  temperature numeric(4,1),                             -- T1H 기온(℃)
  humidity    smallint,                                 -- REH 습도(%)
  rain_1h     numeric(5,1) not null default 0,          -- RN1 1시간 강수량(mm)
  wind_speed  numeric(4,1),                             -- WSD 풍속(m/s)
  wind_dir    smallint,                                 -- VEC 풍향(deg)
  wind_u      numeric(4,1),                             -- UUU 동서 바람성분(m/s)
  wind_v      numeric(4,1),                             -- VVV 남북 바람성분(m/s)
  precip_type smallint    not null default 0,           -- PTY 강수형태 (0없음 1비 2비/눈 3눈 5빗방울 6빗방울눈날림 7눈날림)
  created_at  timestamptz not null default now(),
  unique (nx, ny, observed_at)                          -- 같은 지역·시각은 1건만 (재조회 시 덮어쓰기)
);

create index if not exists weather_observations_lookup
  on weather_observations (nx, ny, observed_at desc);

-- RLS: 누구나 조회 가능, 쓰기는 service_role(서버 함수)만 가능
alter table weather_observations enable row level security;

drop policy if exists "weather read" on weather_observations;
create policy "weather read" on weather_observations for select using (true);
