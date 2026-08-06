/** Journal d'audit append-only : aucune donnée secrète (mot de passe, token) ne doit y être enregistrée. */
async function writeAudit(pool, { actorId = null, action, entityType, entityId = null, metadata = {}, ipAddress = null }) {
    await pool.query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, ip_address)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
        [actorId, action, entityType, entityId, JSON.stringify(metadata), ipAddress]
    );
}

module.exports = { writeAudit };
