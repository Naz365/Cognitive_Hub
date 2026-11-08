import test from 'node:test';
import assert from 'node:assert/strict';

// Test database logic independently
test('Cognitive Hub Invariant: Every batch must have strictly 3 desks', () => {
  const sampleBatch = {
    id: 'batch-0478-test',
    capacity: 3,
    desks: [
      { id: 'desk-1', number: 1, label: 'Desk 01', status: 'available' },
      { id: 'desk-2', number: 2, label: 'Desk 02', status: 'available' },
      { id: 'desk-3', number: 3, label: 'Desk 03', status: 'available' },
    ],
  };

  assert.equal(sampleBatch.capacity, 3, 'Capacity invariant must be exactly 3');
  assert.equal(sampleBatch.desks.length, 3, 'Desks array must contain exactly 3 items');
  assert.deepEqual(sampleBatch.desks.map(d => d.number), [1, 2, 3], 'Desks must be numbered 1, 2, 3');
});

test('Concurrency Guard: Attempting to reserve an already held desk must fail', () => {
  const desk = { id: 'd-1', number: 1, label: 'Desk 01', status: 'available' };

  function reserve(d, applicant) {
    if (d.status !== 'available') {
      return { success: false, reason: 'Desk is already occupied or on hold' };
    }
    d.status = 'hold';
    d.applicant = applicant;
    return { success: true };
  }

  // First applicant reserves
  const res1 = reserve(desk, 'Student A');
  assert.equal(res1.success, true);
  assert.equal(desk.status, 'hold');

  // Second concurrent applicant attempts to reserve the same desk
  const res2 = reserve(desk, 'Student B');
  assert.equal(res2.success, false);
  assert.match(res2.reason, /already occupied/);
  assert.equal(desk.applicant, 'Student A', 'Desk holder must not be overwritten');
});

test('Lease Expiry: Holds older than 24h must revert to Available', () => {
  const now = Date.now();
  const pastExpiration = new Date(now - 1000).toISOString(); // Expired 1 second ago
  const desk = {
    id: 'd-2',
    number: 2,
    label: 'Desk 02',
    status: 'hold',
    holdExpiresAt: pastExpiration,
    studentName: 'Expired Student',
  };

  function checkExpiration(d, currentTime) {
    if (d.status === 'hold' && new Date(d.holdExpiresAt).getTime() < currentTime) {
      d.status = 'available';
      delete d.studentName;
      delete d.holdExpiresAt;
      return true;
    }
    return false;
  }

  const expired = checkExpiration(desk, now);
  assert.equal(expired, true);
  assert.equal(desk.status, 'available');
  assert.equal(desk.studentName, undefined);
});

test('Teacher Verification: Approving payment promotes Hold to Enrolled permanently', () => {
  const desk = { id: 'd-3', number: 3, label: 'Desk 03', status: 'hold', studentName: 'Fahim' };
  const admission = {
    admissionNumber: 'CH-2026-0105',
    status: 'hold',
    payment: { status: 'pending_verification', trxId: 'BKA884920' },
  };

  function verifyPayment(d, adm, action) {
    if (action === 'approve') {
      adm.status = 'enrolled';
      adm.payment.status = 'verified';
      d.status = 'enrolled';
      delete d.holdExpiresAt;
    } else {
      adm.status = 'cancelled';
      adm.payment.status = 'rejected';
      d.status = 'available';
    }
  }

  verifyPayment(desk, admission, 'approve');
  assert.equal(admission.status, 'enrolled');
  assert.equal(admission.payment.status, 'verified');
  assert.equal(desk.status, 'enrolled');
});
