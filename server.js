const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const SIGNUPS_FILE = path.join(__dirname, 'signups.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Load or init signups
function loadSignups() {
  if (!fs.existsSync(SIGNUPS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SIGNUPS_FILE));
}

function saveSignup(email) {
  const signups = loadSignups();
  if (signups.find(s => s.email === email)) return false; // already exists
  signups.push({ email, createdAt: new Date().toISOString() });
  fs.writeFileSync(SIGNUPS_FILE, JSON.stringify(signups, null, 2));
  return true;
}

// Waitlist signup endpoint
app.post('/signup', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  const added = saveSignup(email.toLowerCase().trim());
  const count = loadSignups().length;
  res.json({ success: true, added, count });
});

// Admin: view signups (simple, no auth needed for personal use)
app.get('/admin/signups', (req, res) => {
  const signups = loadSignups();
  res.json({ count: signups.length, signups });
});

app.listen(PORT, () => {
  console.log(`RefundWatcher running at http://localhost:${PORT}`);
});
