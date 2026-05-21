const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Backend Railway OK 🚀');
});

app.get('/test-email', (req, res) => {
    res.json({
        success: true,
        message: 'Route email fonctionne ✅',
        resend: process.env.RESEND_API_KEY ? 'API KEY OK' : 'API KEY MANQUANTE'
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
