/*
  # Add locations and roads tables

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `position` (jsonb)
      - `description` (text)
      - `color` (text)
      - `zone` (text)
      - `project_id` (uuid, references projects)
    
    - `roads`
      - `id` (uuid, primary key)
      - `from_location` (uuid, references locations)
      - `to_location` (uuid, references locations)
      - `distance` (numeric)
      - `type` (text)
      - `project_id` (uuid, references projects)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create locations table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Park', 'Museum', 'Restaurant', 'Building', 'Shop', 'School', 'Hospital', 'Library', 'Cafe', 'Hotel')),
  position jsonb NOT NULL,
  description text,
  color text,
  zone text,
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create roads table
CREATE TABLE roads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location uuid REFERENCES locations ON DELETE CASCADE NOT NULL,
  to_location uuid REFERENCES locations ON DELETE CASCADE NOT NULL,
  distance numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('main', 'secondary', 'residential')),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roads ENABLE ROW LEVEL SECURITY;

-- Policies for locations
CREATE POLICY "Users can read own locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policies for roads
CREATE POLICY "Users can read own roads"
  ON roads
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own roads"
  ON roads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own roads"
  ON roads
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own roads"
  ON roads
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );