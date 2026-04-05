-- =====================================================
-- REALTIME + NOTIFICATION SETUP
-- Run this in the Supabase SQL Editor
-- =====================================================

-- 1. Enable Realtime on the tables we need
ALTER PUBLICATION supabase_realtime ADD TABLE escalations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. RPC: Get count of open escalations for a business
CREATE OR REPLACE FUNCTION get_open_escalation_count(p_business_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM escalations e
  JOIN conversations c ON c.id = e.conversation_id
  WHERE c.business_id = p_business_id
    AND e.status IN ('open', 'in_progress');
$$;

-- 3. RPC: Get open escalations with conversation details (for notification panel)
CREATE OR REPLACE FUNCTION get_open_escalations_list(p_business_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT
      e.id,
      e.conversation_id,
      e.reason,
      e.status,
      e.created_at,
      c.customer_identifier,
      c.channel,
      c.started_at as conversation_started_at
    FROM escalations e
    JOIN conversations c ON c.id = e.conversation_id
    WHERE c.business_id = p_business_id
      AND e.status IN ('open', 'in_progress')
    ORDER BY e.created_at DESC
    LIMIT p_limit
  ) t;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- 4. Update get_conversations_list to also return resolved_ids
-- (Drop and recreate if the return type changed — or use CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION get_conversations_list(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_channel TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSON;
  convs JSON;
  esc_ids JSON;
  resolved JSON;
BEGIN
  -- Get conversations
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::JSON)
  INTO convs
  FROM (
    SELECT c.*
    FROM conversations c
    LEFT JOIN escalations e ON e.conversation_id = c.id AND e.status IN ('open', 'in_progress')
    WHERE c.business_id = p_business_id
      AND (p_start_date IS NULL OR c.started_at >= p_start_date)
      AND (p_channel IS NULL OR c.channel = p_channel)
      AND (
        p_status IS NULL
        OR (p_status = 'needs_agent' AND e.id IS NOT NULL)
        OR (p_status = 'resolved' AND EXISTS (
          SELECT 1 FROM escalations e2
          WHERE e2.conversation_id = c.id AND e2.status = 'resolved'
        ))
      )
    ORDER BY c.started_at DESC
    LIMIT p_limit
  ) t;

  -- Get escalated conversation IDs (open/in_progress)
  SELECT COALESCE(json_agg(e.conversation_id), '[]'::JSON)
  INTO esc_ids
  FROM escalations e
  JOIN conversations c ON c.id = e.conversation_id
  WHERE c.business_id = p_business_id
    AND e.status IN ('open', 'in_progress');

  -- Get resolved conversation IDs
  SELECT COALESCE(json_agg(e.conversation_id), '[]'::JSON)
  INTO resolved
  FROM escalations e
  JOIN conversations c ON c.id = e.conversation_id
  WHERE c.business_id = p_business_id
    AND e.status = 'resolved';

  result := json_build_object(
    'conversations', convs,
    'escalated_ids', esc_ids,
    'resolved_ids', resolved
  );

  RETURN result;
END;
$$;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_open_escalation_count(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_open_escalations_list(UUID, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_conversations_list(UUID, TIMESTAMPTZ, TEXT, TEXT, INTEGER) TO authenticated, anon;
