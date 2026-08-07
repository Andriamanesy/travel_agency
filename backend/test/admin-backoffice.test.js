const test = require('node:test');
const assert = require('node:assert/strict');
const { makePdf, validateResource, circuitPayload, handleAdminBackoffice } = require('../src/admin-backoffice');

test('la validation refuse une remise percentage supérieure à 100', () => {
  assert.throws(
    () => validateResource('coupons', { code: 'ETE', discount_type: 'percent', discount_value: 101 }, { creating: true }),
    /discount_value est invalide/
  );
});

test('la validation normalise un article et impose ses champs requis', () => {
  const post = validateResource('posts', { title: '  Madagascar  ', slug: 'madagascar', content: 'Texte', tags: ['nature'] }, { creating: true });
  assert.equal(post.title, 'Madagascar');
  assert.deepEqual(post.tags, ['nature']);
  assert.throws(() => validateResource('posts', { content: 'Texte' }, { creating: true }), /title est requis/);
});

test('l’export produit un document PDF', () => {
  const pdf = makePdf({ id: '00000000-0000-0000-0000-000000000001', customer_name: 'Ada', offer_title: 'Aventure', start_date: '2026-10-01', end_date: '2026-10-10', participants_count: 2, total_price: '2500.00', status: 'confirmed' });
  assert.ok(pdf.subarray(0, 8).equals(Buffer.from('%PDF-1.4')));
  assert.match(pdf.toString('utf8'), /%%EOF$/);
});

test('un circuit avancé normalise son itinéraire et ses départs', () => {
  const circuit = circuitPayload({ destination_id: '00000000-0000-4000-8000-000000000001', title: 'Nord', description: 'Une aventure complète', price: 2500, duration_days: 3, capacity: 12, cover_image: '', is_active: true, inclusions: ['Guide'], exclusions: ['Vol international'], itineraries: [{ day_number: 1, title: 'Arrivée', description: 'Accueil', accommodation: 'Lodge', meals: 'Dîner' }], departures: [{ start_date: '2027-01-10', end_date: '2027-01-13', total_places: 12, reserved_places: 2, status: 'open' }] });
  assert.equal(circuit.departures[0].reserved_places, 2);
  assert.equal(circuit.itineraries[0].day_number, 1);
});

test('un handler Back-Office signale au routeur que sa réponse a été traitée', async () => {
  const responses = [];
  const handled = await handleAdminBackoffice({
    pathname: '/api/v1/admin/analytics', method: 'GET', req: { auth: { roles: ['admin'] } }, res: {}, parsedUrl: { query: {} }, parseJSONBody: async () => ({}),
    getUserByToken: async () => ({ id: 'admin' }),
    sendResponse: (_res, status, payload) => { responses.push({ status, payload }); return true; },
    pool: { query: async () => ({ rows: [{ revenue: 0, cancelled: 0, total: 0, booking_month: 0, booking_year: 0, count: 0 }] }) },
  });
  assert.equal(handled, true);
  assert.equal(responses[0].status, 200);
});
