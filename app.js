const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Backend Railway OK 🚀');
});

app.get('/test-email', async (req, res) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'nunzionardelli10@gmail.com',
      subject: 'Test email depuis Railway',
      html: '<h1>Ça marche ✅</h1><p>Email envoyé depuis Railway</p>',
    });

    res.json({
      success: true,
      message: 'Email envoyé ✅',
      data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
