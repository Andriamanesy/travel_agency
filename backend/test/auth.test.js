const test = require('node:test');
const assert = require('node:assert/strict');
const { checkRole, checkPermission, createAuthorizationGuard } = require('../src/auth');

test('checkRole autorise un rôle admis', () => {
  const req = { auth: { roles: ['agent'] } };
  assert.doesNotThrow(() => checkRole('admin', 'agent')(req));
});

test('checkRole refuse un rôle non admis', () => {
  const req = { auth: { roles: ['client'] } };
  assert.throws(() => checkRole('admin', 'agent')(req), /Rôle insuffisant/);
});

test('checkPermission exige toutes les permissions', () => {
  const req = { auth: { permissions: ['users:invite', 'users:read:any'] } };
  assert.doesNotThrow(() => checkPermission('users:invite', 'users:read:any')(req));
});

test('createAuthorizationGuard applique les rôles et permissions demandés', async () => {
  const req = { auth: { roles: ['admin'], permissions: ['users:invite'] } };
  await assert.doesNotReject(() => createAuthorizationGuard({ roles: ['admin'], permissions: ['users:invite'] })(req));
});

test('createAuthorizationGuard refuse s’il manque une permission', async () => {
  const req = { auth: { roles: ['admin'], permissions: ['users:read:any'] } };
  await assert.rejects(() => createAuthorizationGuard({ roles: ['admin'], permissions: ['users:invite'] })(req), /Permission insuffisante/);
});
