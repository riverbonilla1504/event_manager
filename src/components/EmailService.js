const dotenv = require('dotenv');
dotenv.config();

const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC || 'your-api-key',
    apiSecret: process.env.MJ_APIKEY_PRIVATE || 'your-api-secret'
  });



class EmailService {
    constructor() {
        this.mailjet = mailjet; // Ya está inicializado
    }

    async sendQRCodeEmail(to, name, qrCode) {
        const msg = {
            Messages: [
                {
                    From: {
                        Email: 'riverflorez.33@gmail.com', // Asegúrate de que este correo esté verificado en Mailjet
                        Name: 'Tu Nombre',
                    },
                    To: [
                        {
                            Email: to,
                            Name: name,
                        },
                    ],
                    Subject: 'Aquí está tu código QR',
                    TextPart: `Hola ${name}, aquí está tu código QR.`,
                    HTMLPart: `<strong>Hola ${name}</strong><br><img src="${qrCode}" alt="Código QR"/>`,
                },
            ],
        };

        try {
            const response = await this.mailjet.post('send', { version: 'v3.1' }).request(msg);
            console.log('Correo enviado a:', to);
            console.log('Respuesta de Mailjet:', response.body);
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error; // Lanza el error para manejarlo donde llames a este método
        }
    }
}

module.exports = EmailService;

// Ejemplo de uso
(async () => {
    const emailService = new EmailService();
    await emailService.sendQRCodeEmail('to@example.com', 'Nombre del Destinatario', 'http://tu-sitio.com/qrcode.png');
})();
