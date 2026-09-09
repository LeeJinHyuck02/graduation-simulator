-- =======================================================
-- POSTECH 수학과 이수 계획 시뮬레이터: Supabase 스키마 생성 쿼리
-- Supabase 대시보드 > SQL Editor에 복사하여 실행(Run)하세요.
-- =======================================================

-- 1. 시나리오 데이터 저장 테이블 생성
CREATE TABLE IF NOT EXISTS public.scenarios_data (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE public.scenarios_data ENABLE ROW LEVEL SECURITY;

-- 3. 익명(anon) 키로 읽기 및 쓰기 허용 정책 (1인 전용이므로 공개 키로 자유롭게 동기화 가능)
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.scenarios_data;
CREATE POLICY "Allow anonymous read access"
ON public.scenarios_data FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.scenarios_data;
CREATE POLICY "Allow anonymous insert access"
ON public.scenarios_data FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON public.scenarios_data;
CREATE POLICY "Allow anonymous update access"
ON public.scenarios_data FOR UPDATE
TO anon
USING (true);

