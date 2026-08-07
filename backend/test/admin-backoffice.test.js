const test = require('node:test');
const assert = require('node:assert/strict');
const { makePdf, validateResource } = require('../src/admin-backoffice');

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
