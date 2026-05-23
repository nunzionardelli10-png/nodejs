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
            from: 'noreply@snapworld.fr'
            to: email,
            subject: 'Code de vérification',
            html: `
            <h1>Votre code</h1>
            <h2>${code}</h2>
            <p>Expire dans 15 minutes</p>
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
