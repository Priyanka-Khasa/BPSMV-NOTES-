const test = require('node:test');
const assert = require('node:assert/strict');
const { publicUser, isAcademicProfileComplete } = require('../src/routes/auth');

test('publicUser exposes the safe profile fields', () => {
  const user = {
    _id: 'user-1',
    name: 'Ada',
    email: 'ada@example.com',
    role: 'student',
    onboarded: true,
    degree: 'B.Tech',
    branch: 'CSE',
    yearOfStudy: 2,
    semester: 4,
    avatar: 'avatar.png',
    bio: 'bio',
    socialLinks: {},
    semesterCgpa: [],
    subscription: { status: 'inactive' }
  };

  const payload = publicUser(user);

  assert.equal(payload.name, 'Ada');
  assert.equal(payload.role, 'student');
  assert.equal(payload.subscription.status, 'inactive');
});

test('academic completion requires full onboarding fields', () => {
  const incomplete = { onboarded: true, rollNumber: '123', degree: 'B.Tech', branch: 'CSE', yearOfStudy: 2 };
  const complete = { onboarded: true, rollNumber: '123', degree: 'B.Tech', branch: 'CSE', yearOfStudy: 2, semester: 4 };

  assert.equal(isAcademicProfileComplete(incomplete), false);
  assert.equal(isAcademicProfileComplete(complete), true);
});
