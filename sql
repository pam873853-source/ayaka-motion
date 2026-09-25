create or replace function increment_ayaka_stats(
  p_total int, p_daily int, p_today text, p_recent jsonb
) returns void language plpgsql as $$
begin
  update site_stats
  set total_generated = p_total,
      daily_generated = p_daily,
      last_reset_date = p_today,
      recent_activations = p_recent
  where id = 1;
end; $$;