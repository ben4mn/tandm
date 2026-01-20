-- TandM Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Processes table
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_official BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata_schema JSONB DEFAULT '{"fields": []}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Instances table
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_processes_created_by ON processes(created_by);
CREATE INDEX idx_processes_is_official ON processes(is_official);
CREATE INDEX idx_instances_process_id ON instances(process_id);
CREATE INDEX idx_instances_user_id ON instances(user_id);
CREATE INDEX idx_instances_start_time ON instances(start_time);

-- =====================================================
-- SEED DATA: Test Users and Example Processes
-- =====================================================

-- Test Users (password for both: password123)
INSERT INTO users (id, email, password_hash, name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@test.com', '$2b$10$BhU52XQ53EN2Zr.GWUHoBen/zJ2hF5Z4oioNzqP48loJ/I97kqZFq', 'Admin User', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'user@test.com', '$2b$10$BhU52XQ53EN2Zr.GWUHoBen/zJ2hF5Z4oioNzqP48loJ/I97kqZFq', 'Test User', 'user');

-- Example Processes (Official)
INSERT INTO processes (name, description, is_official, created_by, metadata_schema) VALUES
    (
        'Market Visit Deck',
        'Track time building market visit decks - pulling reports and using multiple tools',
        true,
        '00000000-0000-0000-0000-000000000001',
        '{"fields": [{"name": "Current Step", "type": "select", "required": false, "options": ["Report Pull", "Data Analysis", "Slide Building", "Review", "Final Polish"]}, {"name": "Client/Market", "type": "text", "required": false}, {"name": "Notes", "type": "textarea", "required": false}]}'
    ),
    (
        'Prep for Client Convo - Generic',
        'Capture your prep process and time for client conversations',
        true,
        '00000000-0000-0000-0000-000000000001',
        '{"fields": [{"name": "Client Name", "type": "text", "required": true}, {"name": "Prep Steps Completed", "type": "textarea", "required": false}, {"name": "Key Topics to Cover", "type": "textarea", "required": false}, {"name": "Notes", "type": "textarea", "required": false}]}'
    ),
    (
        'Prep for Pitch',
        'Track pitch preparation time and process',
        true,
        '00000000-0000-0000-0000-000000000001',
        '{"fields": [{"name": "Pitch/Opportunity Name", "type": "text", "required": true}, {"name": "Prep Steps Completed", "type": "textarea", "required": false}, {"name": "Key Differentiators", "type": "textarea", "required": false}, {"name": "Notes", "type": "textarea", "required": false}]}'
    );
