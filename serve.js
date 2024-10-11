const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('twilio');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views'))); // Para servir arquivos estáticos

// Página inicial com o formulário
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'site.html'));
});

// Rota para processar o envio do formulário
app.post('/submit', (req, res) => {
    const { nome, telefone, email, descricao } = req.body;

    // Enviar mensagem WhatsApp com as informações do formulário
    enviarWhatsApp(nome, telefone, email, descricao)
        .then(() => {
            req.flash('success', 'Mensagem enviada com sucesso pelo WhatsApp!');
            res.redirect('/');
        })
        .catch((error) => {
            req.flash('error', `Ocorreu um erro ao enviar a mensagem: ${error.message}`);
            res.redirect('/');
        });
});

// Função para enviar mensagem via WhatsApp
async function enviarWhatsApp(nome, telefone, email, descricao) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Número do Twilio para WhatsApp
    const recipientNumber = process.env.RECIPIENT_WHATSAPP_NUMBER; // Número de destino

    const client = new Client(accountSid, authToken);

    // Montar a mensagem
    const mensagem = `
    Nome: ${nome}
    Telefone: ${telefone}
    Email: ${email}

    Descrição:
    ${descricao}
    `;

    // Enviar mensagem via WhatsApp
    const message = await client.messages.create({
        body: mensagem,
        from: twilioWhatsAppNumber,
        to: recipientNumber,
    });

    console.log(`Mensagem enviada: ${message.sid}`);
}

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});