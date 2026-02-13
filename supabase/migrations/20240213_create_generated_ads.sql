create table public.generated_ads (
  id uuid not null default gen_random_uuid (),
  category text not null,
  input_data jsonb not null,
  output_text text not null,
  tone text not null,
  created_at timestamp with time zone not null default now(),
  constraint generated_ads_pkey primary key (id)
) tablespace pg_default;
