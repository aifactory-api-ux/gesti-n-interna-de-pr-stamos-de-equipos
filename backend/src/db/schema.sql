-- Préstamo de Equipos Apiux - Database Schema
-- PostgreSQL 15

CREATE TABLE collaborator (
    id VARCHAR(255) PRIMARY KEY,
    azure_ad_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE equipment (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    serial_number VARCHAR(255)
);

CREATE TABLE loan (
    id VARCHAR(255) PRIMARY KEY,
    equipment_id VARCHAR(255) NOT NULL REFERENCES equipment(id),
    collaborator_id VARCHAR(255) NOT NULL REFERENCES collaborator(id),
    loan_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    return_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(255)
);

CREATE TABLE audit_log (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details TEXT
);

CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_loan_status ON loan(status);
CREATE INDEX idx_loan_approval_status ON loan(approval_status);
CREATE INDEX idx_loan_collaborator ON loan(collaborator_id);
CREATE INDEX idx_loan_equipment ON loan(equipment_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);

-- Seed data for development/testing
INSERT INTO collaborator (id, azure_ad_id, name, email) VALUES
    ('c001', 'azure-001', 'Juan Pérez', 'juan.perez@api-ux.com'),
    ('c002', 'azure-002', 'María García', 'maria.garcia@api-ux.com'),
    ('c003', 'azure-003', 'Carlos López', 'carlos.lopez@api-ux.com'),
    ('c004', 'azure-004', 'Ana Martínez', 'ana.martinez@api-ux.com'),
    ('c005', 'azure-005', 'Luis Rodríguez', 'luis.rodriguez@api-ux.com');

INSERT INTO equipment (id, name, type, status, serial_number) VALUES
    ('eq001', 'Dell Latitude 5520', 'notebook', 'available', 'SN-2022-001'),
    ('eq002', 'Dell Latitude 5520', 'notebook', 'available', 'SN-2022-002'),
    ('eq003', 'Dell Latitude 5520', 'notebook', 'loaned', 'SN-2022-003'),
    ('eq004', 'HP EliteBook 840', 'notebook', 'available', 'SN-2022-004'),
    ('eq005', 'HP EliteBook 840', 'notebook', 'maintenance', 'SN-2022-005'),
    ('eq006', 'Dell U2722D', 'monitor', 'available', 'SN-2021-001'),
    ('eq007', 'Dell U2722D', 'monitor', 'available', 'SN-2021-002'),
    ('eq008', 'Dell U2722D', 'monitor', 'loaned', 'SN-2021-003'),
    ('eq009', 'Logitech MK270', 'keyboard', 'available', 'SN-2020-001'),
    ('eq010', 'Logitech MX Master 3', 'mouse', 'available', 'SN-2020-002'),
    ('eq011', 'Jabra Evolve2 65', 'headset', 'available', 'SN-2023-001'),
    ('eq012', 'Cable HDMI 2m', 'cable', 'available', 'SN-2020-010'),
    ('eq013', 'Adaptador USB-C', 'adapter', 'available', 'SN-2021-010'),
    ('eq014', 'MacBook Pro 14"', 'notebook', 'retired', 'SN-2021-MBP'),
    ('eq015', 'Dell P2422H', 'monitor', 'available', 'SN-2022-006');
