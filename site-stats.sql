-- ============================================================
-- AYAKA STORE - SETUP TABEL site_stats
-- Jalankan di Supabase → SQL Editor
-- ============================================================

-- 1. Buat tabel site_stats
CREATE TABLE IF NOT EXISTS public.site_stats (
  id                  BIGINT PRIMARY KEY,
  visitors            BIGINT DEFAULT 0,
  total_generated     BIGINT DEFAULT 0,
  daily_generated     BIGINT DEFAULT 0,
  last_reset_date     TEXT,
  server_start_time   BIGINT,
  recent_activations  JSONB DEFAULT '[]'::jsonb,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert baris awal id=1 (kalau belum ada)
INSERT INTO public.site_stats (
  id,
  visitors,
  total_generated,
  daily_generated,
  last_reset_date,
  server_start_time,
  recent_activations
)
VALUES (
  1,
  0,
  0,
  0,
  to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
  (extract(epoch from now()) * 1000)::bigint,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. Aktifkan Row Level Security
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- 4. Hapus policy lama (kalau ada) supaya tidak bentrok
DROP POLICY IF EXISTS "Allow anon read site_stats"   ON public.site_stats;
DROP POLICY IF EXISTS "Allow anon insert site_stats" ON public.site_stats;
DROP POLICY IF EXISTS "Allow anon update site_stats" ON public.site_stats;

-- 5. Buat policy baru → anon bisa SELECT, INSERT, UPDATE
CREATE POLICY "Allow anon read site_stats"
  ON public.site_stats FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anon insert site_stats"
  ON public.site_stats FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update site_stats"
  ON public.site_stats FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- 6. Trigger auto-update kolom updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_stats_updated_at ON public.site_stats;

CREATE TRIGGER trg_site_stats_updated_at
  BEFORE UPDATE ON public.site_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. Aktifkan Realtime (untuk update instan antar perangkat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_stats;

-- 8. Verifikasi
SELECT 'SETUP SELESAI ✅' AS status, * FROM public.site_stats WHERE id = 1;