-- Schema terpisah untuk proyek penerbangan-bigdata.
-- Project Supabase dipakai bersama primbon-nlp (schema public) — JANGAN sentuh public dari sini.
-- Publik (anon) hanya boleh membaca; penulisan lewat notebook 04_export dengan koneksi Postgres langsung.

create schema if not exists penerbangan;

grant usage on schema penerbangan to anon, authenticated, service_role;
alter default privileges in schema penerbangan grant select on tables to anon, authenticated;
alter default privileges in schema penerbangan grant all on tables to service_role;

-- Referensi
create table penerbangan.airlines (
  code text primary key,           -- kode BTS, mis. 'AA'
  name text not null
);

create table penerbangan.airports (
  code text primary key,           -- kode IATA, mis. 'ATL'
  city text,
  state text
);

-- Agregat per bulan × maskapai (dashboard: tren, ranking maskapai, distribusi kelas)
create table penerbangan.monthly_airline_stats (
  year smallint not null,
  month smallint not null check (month between 1 and 12),
  airline text not null references penerbangan.airlines(code),
  flights integer not null,        -- termasuk batal & divert
  cancelled integer not null,
  diverted integer not null,
  avg_dep_delay real,              -- menit, hanya penerbangan yang beroperasi
  class_0 integer not null,        -- kelas kompensasi PM 89/2015 (0–5)
  class_1 integer not null,
  class_2 integer not null,
  class_3 integer not null,
  class_4 integer not null,
  class_5 integer not null,
  primary key (year, month, airline)
);

-- Agregat per bulan × bandara asal (dashboard: bandara rawan delay)
create table penerbangan.monthly_origin_stats (
  year smallint not null,
  month smallint not null check (month between 1 and 12),
  origin text not null references penerbangan.airports(code),
  flights integer not null,
  cancelled integer not null,
  diverted integer not null,
  avg_dep_delay real,
  class_0 integer not null,
  class_1 integer not null,
  class_2 integer not null,
  class_3 integer not null,
  class_4 integer not null,
  class_5 integer not null,
  primary key (year, month, origin)
);
create index monthly_origin_stats_origin_idx on penerbangan.monthly_origin_stats (origin);

-- Heatmap hari × jam jadwal berangkat
create table penerbangan.hour_dow_stats (
  dow smallint not null check (dow between 1 and 7),   -- 1 = Senin (konvensi BTS)
  hour smallint not null check (hour between 0 and 23),
  flights integer not null,
  avg_dep_delay real,
  delayed_30 integer not null,     -- kelas ≥ 1
  class_5 integer not null,
  primary key (dow, hour)
);

-- Hasil eksperimen model (halaman Tentang Model)
create table penerbangan.model_results (
  id bigint generated always as identity primary key,
  approach text not null check (approach in ('regression', 'classification')),
  scenario text not null,          -- S1–S4
  algorithm text not null,         -- lr, dt, rf, xgb
  metrics jsonb not null,          -- mae, rmse, r2, macro_f1, recall_class_5, per_class, ...
  is_best boolean not null default false,
  created_at timestamptz not null default now(),
  unique (approach, scenario, algorithm)
);

-- Tabel di atas dibuat setelah default privileges, jadi grant select sudah otomatis.
-- RLS: baca publik, tanpa kebijakan tulis (anon/authenticated tidak bisa insert/update/delete).
do $$
declare t text;
begin
  foreach t in array array['airlines','airports','monthly_airline_stats','monthly_origin_stats','hour_dow_stats','model_results']
  loop
    execute format('alter table penerbangan.%I enable row level security', t);
    execute format('create policy "public read" on penerbangan.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;
