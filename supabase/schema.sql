-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text check (role in ('admin', 'collaborator')) default 'collaborator'::text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Apartments table
create table public.apartments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  description text,
  max_guests integer default 2 not null,
  base_price numeric not null,
  images text[] default '{}'::text[],
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  apartment_id uuid references public.apartments on delete restrict not null,
  created_by uuid references public.profiles on delete set null,
  guest_name text not null,
  guest_phone text,
  guest_id_card text,
  check_in date not null,
  check_out date not null,
  nights integer not null check (nights > 0),
  price_per_night numeric not null,
  total_price numeric not null,
  status text check (status in ('available', 'holding', 'booked')) default 'holding'::text not null,
  notes text,
  id_card_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Booking Days table (for fast calendar queries and conflict prevention)
create table public.booking_days (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings on delete cascade not null,
  apartment_id uuid references public.apartments on delete restrict not null,
  day date not null,
  status text check (status in ('holding', 'booked')) not null,
  unique (apartment_id, day) -- Prevents double booking
);

-- Activity Logs table
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete set null,
  action text not null,
  details text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.apartments enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_days enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Admins can update any profile."
  on public.profiles for update
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Apartments Policies
create policy "Apartments are viewable by authenticated users."
  on public.apartments for select
  to authenticated
  using ( true );

create policy "Admins can insert apartments."
  on public.apartments for insert
  to authenticated
  with check ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can update apartments."
  on public.apartments for update
  to authenticated
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Bookings Policies
create policy "Bookings are viewable by authenticated users."
  on public.bookings for select
  to authenticated
  using ( true );

create policy "Collaborators can insert bookings."
  on public.bookings for insert
  to authenticated
  with check ( auth.uid() = created_by );

create policy "Admins can insert any booking."
  on public.bookings for insert
  to authenticated
  with check ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Collaborators can update their own bookings."
  on public.bookings for update
  to authenticated
  using ( auth.uid() = created_by );

create policy "Admins can update any booking."
  on public.bookings for update
  to authenticated
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Collaborators can delete their own bookings."
  on public.bookings for delete
  to authenticated
  using ( auth.uid() = created_by );

create policy "Admins can delete any booking."
  on public.bookings for delete
  to authenticated
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Booking Days Policies
create policy "Booking days are viewable by authenticated users."
  on public.booking_days for select
  to authenticated
  using ( true );

create policy "Insert through bookings."
  on public.booking_days for insert
  to authenticated
  with check ( true );

create policy "Update through bookings."
  on public.booking_days for update
  to authenticated
  using ( true );

create policy "Delete through bookings."
  on public.booking_days for delete
  to authenticated
  using ( true );

-- Activity Logs Policies
create policy "Logs viewable by authenticated users."
  on public.activity_logs for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert logs."
  on public.activity_logs for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- Create trigger to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
