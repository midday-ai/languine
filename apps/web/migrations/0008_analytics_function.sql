CREATE OR REPLACE FUNCTION get_project_analytics(
  p_project_slug text,
  p_organization_id text,
  p_period text DEFAULT 'daily',
  p_start_date timestamp DEFAULT (CURRENT_TIMESTAMP - INTERVAL '14 days'),
  p_end_date timestamp DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE (
  period text,
  key_count bigint,
  document_count bigint,
  total_keys bigint,
  total_documents bigint,
  total_languages bigint
) AS $$
DECLARE
  date_format text;
BEGIN
  -- Set date format based on period
  date_format := CASE p_period
    WHEN 'monthly' THEN 'YYYY-MM'
    WHEN 'weekly' THEN 'IYYY-"W"IW'
    ELSE 'YYYY-MM-DD'
  END;

  RETURN QUERY WITH stats AS (
    -- Get key stats by period
    SELECT
      to_char(t.updated_at, date_format) as stat_period,
      COUNT(*) FILTER (WHERE t.source_type = 'key') as keys,
      COUNT(*) FILTER (WHERE t.source_type = 'document') as documents
    FROM translations t
    INNER JOIN projects p ON 
      p.id = t.project_id AND 
      p.slug = p_project_slug AND 
      p.organization_id = p_organization_id
    WHERE 
      t.updated_at >= p_start_date AND 
      t.updated_at <= p_end_date
    GROUP BY stat_period
  ),
  totals AS (
    -- Get overall totals
    SELECT
      COUNT(*) FILTER (WHERE t.source_type = 'key' AND t.translation_key IS NOT NULL) as total_keys,
      COUNT(*) FILTER (WHERE t.source_type = 'document' AND t.translation_key IS NOT NULL) as total_documents,
      COUNT(DISTINCT t.target_language) as total_languages
    FROM translations t
    INNER JOIN projects p ON 
      p.id = t.project_id AND 
      p.slug = p_project_slug AND 
      p.organization_id = p_organization_id
  ),
  date_series AS (
    -- Generate date series based on period
    SELECT
      to_char(d::timestamp, date_format) as stat_period
    FROM generate_series(
      date_trunc(
        CASE p_period
          WHEN 'monthly' THEN 'month'
          WHEN 'weekly' THEN 'week'
          ELSE 'day'
        END,
        p_start_date
      ),
      p_end_date,
      CASE p_period
        WHEN 'monthly' THEN '1 month'::interval
        WHEN 'weekly' THEN '1 week'::interval
        ELSE '1 day'::interval
      END
    ) d
  )
  SELECT
    d.stat_period as period,
    COALESCE(s.keys, 0) as key_count,
    COALESCE(s.documents, 0) as document_count,
    t.total_keys,
    t.total_documents,
    t.total_languages
  FROM date_series d
  LEFT JOIN stats s ON d.stat_period = s.stat_period
  CROSS JOIN totals t
  ORDER BY d.stat_period;
END;
$$ LANGUAGE plpgsql;