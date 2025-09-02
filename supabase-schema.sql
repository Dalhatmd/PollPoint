-- Poll App Database Schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- Prevent multiple votes per user per poll
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_author_id ON polls(author_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls table
CREATE POLICY "Users can view all polls" ON polls
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for poll_options table
CREATE POLICY "Users can view all poll options" ON poll_options
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create poll options" ON poll_options
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for votes table
CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get poll with options and vote counts
CREATE OR REPLACE FUNCTION get_poll_with_results(poll_uuid UUID)
RETURNS TABLE (
  id UUID,
  question TEXT,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  options JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.question,
    p.author_id,
    p.created_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', po.id,
          'text', po.text,
          'order_index', po.order_index,
          'votes', COALESCE(vote_counts.vote_count, 0)
        ) ORDER BY po.order_index
      ) FILTER (WHERE po.id IS NOT NULL),
      '[]'::json
    ) as options
  FROM polls p
  LEFT JOIN poll_options po ON p.id = po.poll_id
  LEFT JOIN (
    SELECT 
      po.id as option_id,
      COUNT(v.id) as vote_count
    FROM poll_options po
    LEFT JOIN votes v ON po.id = v.option_id
    GROUP BY po.id
  ) vote_counts ON po.id = vote_counts.option_id
  WHERE p.id = poll_uuid
  GROUP BY p.id, p.question, p.author_id, p.created_at;
END;
$$ LANGUAGE plpgsql;
