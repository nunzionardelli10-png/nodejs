const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const codes = {};

app.get('/', (req, res) => {
  res.send('Backend Railway OK 🚀');
});

app.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  codes[email] = code;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Votre code de vérification',
      html: `<h1>Votre code est : ${code}</h1>`,
    });

    res.json({ success: true, message: 'Code envoyé ✅' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (codes[email] === code) {
    delete codes[email];
    return res.json({ success: true, message: 'Email vérifié ✅' });
  }

  res.status(400).json({ success: false, message: 'Code incorrect' });
});

app.get('/test-email', async (req, res) => {
  res.json({ success: true, message: 'Backend email prêt ✅' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
