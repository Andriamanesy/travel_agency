-- Fenêtre de commercialisation facultative d'un circuit.
-- NULL signifie qu'aucune borne n'est imposée de ce côté.
ALTER TABLE circuits
    ADD COLUMN IF NOT EXISTS available_from DATE,
    ADD COLUMN IF NOT EXISTS available_to DATE;

ALTER TABLE circuits
    DROP CONSTRAINT IF EXISTS circuits_available_dates_chk;
ALTER TABLE circuits
    ADD CONSTRAINT circuits_available_dates_chk
    CHECK (available_from IS NULL OR available_to IS NULL OR available_to > available_from);

CREATE INDEX IF NOT EXISTS circuits_availability_idx
    ON circuits (available_from, available_to)
    WHERE is_active = TRUE;
