const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});
const verificationCodes = new Map();

app.get('/', (req, res) => {
    res.send('Backend Railway OK 🚀');
});

// Envoi code vérification
app.post('/email-verification/send-verification-code', async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email requis'
            });
        }

        const code = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        verificationCodes.set(email, {
            code,
            expires: Date.now() + (15 * 60 * 1000)
        });

        await resend.emails.send({
    from: 'noreply@nexusnapia.com',
    to: email,
    subject: 'Code de vérification',
    html: `
<div style="background:#0b0820;padding:30px;font-family:Arial,sans-serif;color:white;">
  <div style="max-width:520px;margin:auto;background:#15102e;border-radius:22px;padding:32px;text-align:center;">
    
    <h1 style="margin:0 0 10px;font-size:30px;color:#ffffff;">
      NexusNapia
    </h1>

    <p style="color:#bdb7ff;font-size:16px;">
      Code de vérification
    </p>

    <div style="font-size:42px;font-weight:bold;letter-spacing:8px;margin:28px 0;color:#ffffff;">
      ${code}
    </div>

    <p style="font-size:15px;color:#cfcafc;">
      Ce code expire dans 15 minutes.
    </p>

    <p style="font-size:13px;color:#8f89bd;margin-top:28px;">
      Si vous n’avez pas demandé ce code, ignorez cet email.
    </p>

  </div>
</div>
`
});
        res.json({
            success: true,
            message: 'Code envoyé',
            email
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// Vérification du code
app.post('/email-verification/verify-code', (req, res) => {

    const { email, code } = req.body;

    const saved = verificationCodes.get(email);

    if (!saved) {
        return res.status(400).json({
            success:false,
            message:'Aucun code'
        });
    }

    if (Date.now() > saved.expires) {

        verificationCodes.delete(email);

        return res.status(400).json({
            success:false,
            message:'Code expiré'
        });
    }

    if (saved.code !== code) {

        return res.status(400).json({
            success:false,
            message:'Code incorrect'
        });
    }

    verificationCodes.delete(email);

    res.json({
        success:true,
        message:'Email vérifié'
    });

});

app.listen(PORT, () => {
    console.log(`Serveur démarré ${PORT}`);
});
