-- ==========================================
-- 다락방포트폴리오 (Attic Portfolio) Supabase DB Schema
-- ==========================================

-- 1. 멤버 테이블 (Members)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pin TEXT NOT NULL DEFAULT '1234',
    avatar TEXT NOT NULL DEFAULT '👤',
    bio TEXT,
    role TEXT DEFAULT '다락방 멤버',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 자산 테이블 (Assets)
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'kr_stock', 'us_stock', 'crypto', 'real_estate', 'cash'
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    buy_price NUMERIC NOT NULL DEFAULT 0,
    quantity NUMERIC NOT NULL DEFAULT 1,
    current_price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 실시간 사자후 테이블 (Shoutouts)
CREATE TABLE IF NOT EXISTS public.shoutouts (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    message TEXT NOT NULL,
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 실시간 동기화 (Realtime) 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shoutouts;

-- 5. RLS (Row Level Security) 설정 (모임용 공개 읽기/간이 쓰기 허용)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shoutouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public read on assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Allow public read on shoutouts" ON public.shoutouts FOR SELECT USING (true);

CREATE POLICY "Allow public insert on assets" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on assets" ON public.assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on assets" ON public.assets FOR DELETE USING (true);

CREATE POLICY "Allow public insert on shoutouts" ON public.shoutouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on shoutouts" ON public.shoutouts FOR UPDATE USING (true);
