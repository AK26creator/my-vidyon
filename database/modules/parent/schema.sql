-- =====================================================
-- Parent Module Schema
-- =====================================================

CREATE TABLE IF NOT EXISTS parent_student_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relation VARCHAR(50), -- 'Father', 'Mother', 'Guardian'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_relations_parent ON parent_student_relations(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_relations_student ON parent_student_relations(student_id);
