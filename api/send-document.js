// api/send-document.js

// IMPORTANT : Pour que cela fonctionne sur Vercel, vous devez installer nodemailer.
// Exécutez `npm install nodemailer` ou `yarn add nodemailer` dans votre projet.

const nodemailer = require('nodemailer');

// Handler de la fonction serverless
export default async function handler(req, res) {
  // On s'assure que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { documentData, documentType, pdfData } = req.body;

    // --- CONFIGURATION DU TRANSPORTEUR NODEMAILER ---
    // C'est ici que vous configurez comment les e-mails sont envoyés.
    // J'utilise Gmail comme exemple, mais vous pouvez utiliser n'importe quel service SMTP.
    // !! SÉCURITÉ !! : Ne mettez jamais vos identifiants en clair ici.
    // Sur Vercel, stockez-les dans les "Environment Variables" (dans les paramètres de votre projet).
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou un autre service comme 'hotmail', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_SERVER_USER, // Ex: 'votre.email@gmail.com'
        pass: process.env.EMAIL_SERVER_PASSWORD, // Pour Gmail, utilisez un "mot de passe d'application"
      },
    });

    // Définir le sujet et le corps de l'e-mail en fonction du type de document
    const isQuote = documentType === 'devis';
    const subject = isQuote 
      ? `Votre devis - ${documentData.client.prenom} ${documentData.client.nom}`
      : `Votre rapport d'intervention - ${documentData.client.prenom} ${documentData.client.nom}`;
      
    const body = `
      <p>Bonjour ${documentData.client.prenom},</p>
      <p>Veuillez trouver ci-joint ${isQuote ? 'votre devis personnalisé' : 'le rapport suite à notre intervention'}.</p>
      <p>Nous restons à votre disposition pour toute question.</p>
      <br/>
      <p>Cordialement,</p>
      <p>L'équipe de [Votre Entreprise]</p>
    `;

    // Options de l'e-mail
    const mailOptions = {
      from: `"Votre Nom d'Expéditeur" <${process.env.EMAIL_FROM}>`, // Ex: '"Mon Entreprise" <contact@monentreprise.fr>'
      to: documentData.client.email,
      subject: subject,
      html: body,
      attachments: [
        {
          // Nom du fichier tel qu'il apparaîtra dans l'e-mail
          filename: `${documentType}_${documentData.client.nom}.pdf`,
          // Le contenu du PDF est la chaîne Base64, sans le préfixe "data:application/pdf;base64,"
          content: pdfData.split('base64,')[1],
          // On précise l'encodage pour que le serveur de messagerie sache comment interpréter le contenu
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions);

    // Répondre avec un succès
    res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
