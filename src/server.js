// server.js
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const cors = require('cors');
require('dotenv').config();
const EmailService = require('./components/EmailService');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'event_manager',
};

// Conexión a la base de datos
const db = mysql.createConnection(dbConfig);

db.connect(err => {
    if (err) {
        console.error('Error de conexión:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});

// Ruta para iniciar sesión y obtener un token JWT
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Asegúrate de tener lógica para verificar el usuario
    if (email === 'admin@admin.com' && password === '123') {
        const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ auth: true, token });
    }
    return res.sendStatus(401);
});

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Token recibido:', token); // Verifica el token que se está enviando

    if (!token) return res.sendStatus(403); // Sin token

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token inválido:', err);
            return res.sendStatus(403); // Token inválido
        }
        req.userId = decoded.id; // Guardamos el ID del usuario
        next(); // Siguiente middleware
    });
};


const emailService = new EmailService();
// Aplica el middleware de verificación de token a las rutas siguientes
app.use(verifyToken);

// Ruta para generar el código QR y enviar el correo
app.post('/generate-qr', verifyToken, async (req, res) => {
    console.log('Solicitud recibida en /generate-qr'); // Verifica si esta línea se ejecuta
    const { userId } = req.body;
    console.log('ID de usuario recibido:', userId);
    console.log('EmailService inicializado'+process.env.SENDGRID_API_KEY);

    try {
        // Obtén los datos del usuario
        const [results] = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];
        const qrUrl = `http://tu-sitio.com/user/${user.id}`; // Cambia por tu URL
        console.log('URL del código QR:', qrUrl);

        // Genera el código QR
        const qrCode = await QRCode.toDataURL(qrUrl);

        // Envía el correo usando EmailService
        await emailService.sendQRCodeEmail(user.email, user.name, qrCode);
        return res.json({ message: 'Código QR enviado', qrCode });
    } catch (error) {
        console.error('Error al generar el código QR:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Ruta para actualizar la asistencia
app.post('/update-attendance', (req, res) => {
    const { userId, attended } = req.body;
    db.query('UPDATE attendance SET attended = ? WHERE user_id = ?', [attended, userId], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: 'Asistencia actualizada' });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
