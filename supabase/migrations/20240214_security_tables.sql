-- Create Rate Limits Table
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_ip TEXT,
  request_path TEXT,
  request_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for error logs
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);

-- Atomic Rate Limit Check Function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT request_count, window_start INTO v_count, v_window_start
  FROM rate_limits
  WHERE ip_address = p_ip_address
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO rate_limits (ip_address, request_count, window_start)
    VALUES (p_ip_address, 1, v_now);
    RETURN TRUE;
  END IF;

  -- Check window expiration
  IF v_now - v_window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Reset window
    UPDATE rate_limits
    SET request_count = 1, window_start = v_now
    WHERE ip_address = p_ip_address;
    RETURN TRUE;
  ELSE
    -- Check limit
    IF v_count >= p_limit THEN
      RETURN FALSE;
    ELSE
      UPDATE rate_limits
      SET request_count = request_count + 1
      WHERE ip_address = p_ip_address;
      RETURN TRUE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
