const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canDeleteResource,
  canViewResource,
  canApproveResource,
  normalizeResourceLinkUrl
} = require('../src/routes/resources');

test('admins can delete and approve resources they do not own', () => {
  const admin = { id: 'admin-1', role: 'admin' };
  const resource = { uploadedBy: { toString: () => 'owner-1' } };

  assert.equal(canDeleteResource(admin, resource), true);
  assert.equal(canApproveResource(admin, resource), true);
});

test('owners can delete their own resource but not approve it when not admin', () => {
  const owner = { id: 'owner-1', role: 'student' };
  const resource = { uploadedBy: { toString: () => 'owner-1' } };

  assert.equal(canDeleteResource(owner, resource), true);
  assert.equal(canApproveResource(owner, resource), false);
});

test('pending resources stay hidden from non-owners and non-admins', () => {
  const viewer = { id: 'viewer-1', role: 'student' };
  const resource = {
    isApproved: false,
    uploadedBy: { toString: () => 'owner-1' }
  };

  assert.equal(canViewResource(viewer, resource), false);
});

test('approved resources are visible to everyone', () => {
  const viewer = { id: 'viewer-1', role: 'student' };
  const resource = {
    isApproved: true,
    uploadedBy: { toString: () => 'owner-1' }
  };

  assert.equal(canViewResource(viewer, resource), true);
});

test('resource links must be http or https URLs', () => {
  assert.equal(normalizeResourceLinkUrl('https://example.com/notes?id=1'), 'https://example.com/notes?id=1');
  assert.equal(normalizeResourceLinkUrl(' http://example.com/path '), 'http://example.com/path');
  assert.equal(normalizeResourceLinkUrl('javascript:alert(1)'), '');
  assert.equal(normalizeResourceLinkUrl('ftp://example.com/file.pdf'), '');
  assert.equal(normalizeResourceLinkUrl('/relative/path'), '');
  assert.equal(normalizeResourceLinkUrl('not-a-url'), '');
});
