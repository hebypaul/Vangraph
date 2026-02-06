-- Add position column for Kanban drag-and-drop ordering
-- Uses fractional indexing for O(1) reordering

ALTER TABLE issues ADD COLUMN IF NOT EXISTS position FLOAT8 DEFAULT 1000;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_issues_position ON issues(project_id, status, position);

-- Comment explaining the column
COMMENT ON COLUMN issues.position IS 'Fractional index for Kanban ordering. Use midpoint formula for insertion: (above + below) / 2';
