'use strict';
// routes/payments.js
//
// Make POST /payments idempotent using the Idempotency-Key header.
// A repeated key returns the original response without charging again.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // Without a key, the server cannot recognize a retry safely.
  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      },
    });
  }

  // Replay the exact response for a previously processed request.
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);
    return res.status(saved.status).json(saved.body);
  }

  // New key: create and record exactly one real charge.
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  const status = 201;
  const body = { id: charge.id, amount: charge.amount, status: charge.status };
  idempotency.set(key, { status, body });

  return res.status(status).json(body);
});

module.exports = router;
