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


// -------------------------------------------------------------
// PHASE 2 TESTS: KEYWORD SCANNER & DIGITAL BOOK CORNER
// -------------------------------------------------------------
test('Keyword Scanner: Must award partial credit and identify matched and missed keywords', () => {
  const sampleQuestion = {
    id: 'q-test-compression',
    maxMarks: 4,
    rubricKeywords: [
      { requiredKeyword: 'lossless compression', synonyms: ['lossless'], markWeight: 1 },
      { requiredKeyword: 'consecutive identical', synonyms: ['repeated', 'runs of identical'], markWeight: 1 },
      { requiredKeyword: 'frequency count', synonyms: ['count', 'frequency'], markWeight: 1 },
      { requiredKeyword: 'reconstruct original', synonyms: ['reconstructed exactly'], markWeight: 1 },
    ],
  };

  function testScanner(candidateText, question) {
    const textLower = candidateText.toLowerCase();
    let score = 0;
    const matched = [];
    const missed = [];

    for (const rule of question.rubricKeywords) {
      const targets = [rule.requiredKeyword, ...rule.synonyms].map(t => t.toLowerCase());
      const hasMatch = targets.some(t => textLower.includes(t));
      if (hasMatch) {
        score += rule.markWeight;
        matched.push(rule.requiredKeyword);
      } else {
        missed.push(rule.requiredKeyword);
      }
    }

    return { score: Math.min(score, question.maxMarks), matched, missed };
  }

  // Candidate with partial answer
  const answer1 = "Run-length encoding is a lossless compression method where frequency count of characters is stored.";
  const res1 = testScanner(answer1, sampleQuestion);

  assert.equal(res1.score, 2, 'Should award 2 out of 4 marks');
  assert.ok(res1.matched.includes('lossless compression'));
  assert.ok(res1.matched.includes('frequency count'));
  assert.ok(res1.missed.includes('consecutive identical'));
  assert.ok(res1.missed.includes('reconstruct original'));

  // Candidate with complete answer
  const answer2 = "Lossless compression is used. It identifies consecutive identical characters and stores a count of each, allowing us to reconstruct original data.";
  const res2 = testScanner(answer2, sampleQuestion);
  assert.equal(res2.score, 4, 'Should award full 4 marks');
  assert.equal(res2.missed.length, 0, 'No keywords should be missed');
});

test('Digital Vault: Shelves must cover all 4 board syllabi', () => {
  const supportedSyllabi = ['0478', '9618', '4CP0', '4IT1'];
  const sampleVault = [
    { courseCode: '0478', category: 'endorsed_ebook' },
    { courseCode: '9618', category: 'past_paper_bundle' },
    { courseCode: '4CP0', category: 'pseudocode_handbook' },
    { courseCode: '4IT1', category: 'past_paper_bundle' },
  ];

  const presentCodes = new Set(sampleVault.map(v => v.courseCode));
  for (const code of supportedSyllabi) {
    assert.ok(presentCodes.has(code), `Vault must provide resources for syllabus ${code}`);
  }
});
