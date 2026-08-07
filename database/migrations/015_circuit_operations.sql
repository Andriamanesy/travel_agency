-- Phase 2 circuits : programme détaillé, départs commercialisables et prestations.
ALTER TABLE circuits
    ADD COLUMN IF NOT EXISTS inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS exclusions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE circuits
    DROP CONSTRAINT IF EXISTS circuits_inclusions_array_chk;
ALTER TABLE circuits
    ADD CONSTRAINT circuits_inclusions_array_chk CHECK (jsonb_typeof(inclusions) = 'array');
ALTER TABLE circuits
    DROP CONSTRAINT IF EXISTS circuits_exclusions_array_chk;
ALTER TABLE circuits
    ADD CONSTRAINT circuits_exclusions_array_chk CHECK (jsonb_typeof(exclusions) = 'array');

CREATE TABLE IF NOT EXISTS circuit_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number > 0 AND day_number <= 365),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    accommodation VARCHAR(255) NOT NULL DEFAULT '',
    meals VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT circuit_itineraries_day_unique UNIQUE (circuit_id, day_number)
);
CREATE INDEX IF NOT EXISTS circuit_itineraries_circuit_day_idx ON circuit_itineraries(circuit_id, day_number);

CREATE TABLE IF NOT EXISTS circuit_departures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_places INTEGER NOT NULL CHECK (total_places > 0 AND total_places <= 10000),
    reserved_places INTEGER NOT NULL DEFAULT 0 CHECK (reserved_places >= 0),
    status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT circuit_departures_dates_chk CHECK (end_date > start_date),
    CONSTRAINT circuit_departures_capacity_chk CHECK (reserved_places <= total_places),
    CONSTRAINT circuit_departures_unique UNIQUE (circuit_id, start_date)
);
CREATE INDEX IF NOT EXISTS circuit_departures_circuit_start_idx ON circuit_departures(circuit_id, start_date);
CREATE INDEX IF NOT EXISTS circuit_departures_open_idx ON circuit_departures(start_date) WHERE status = 'open';
