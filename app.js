const express = require('express');
const path = require('path');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const indexRouter = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route test mail
app.get('/test-mail', async (req, res) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'nunzionardelli10@gmail.com',
      subject: 'Test Railway',
      html: '<h1>Email envoyé ✅</h1>',
    });

    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

// Use the router
app.use('/', indexRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
