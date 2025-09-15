// Importe la librairie SendGrid
import sgMail from '@sendgrid/mail';

// Fonction utilitaire pour formater le texte pour le HTML
const formatTextForHTML = (text) => {
    if (!text || typeof text !== 'string') {
        return ''; // Retourne une chaîne vide si le texte est null, undefined, ou pas une chaîne
    }
    return text.split('\n').map(line => `<p style="margin: 0 0 10px 0;">${line}</p>`).join('');
};

// C'est la fonction principale que Vercel va exécuter
export default async function handler(req, res) {
    // Configure SendGrid avec la clé API stockée dans les variables d'environnement de Vercel
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Récupère les données envoyées par le front-end
    const { documentData, configData, documentType } = req.body;
    const { client } = documentData;

    // Définit le sujet et le nom du fichier en fonction du type de document
    const subject = documentType === 'devis' ? 'Votre Devis' : 'Votre Rapport Sanitaire';
    const filename = documentType === 'devis' ? `Devis-${client.nom}-${client.prenom}.pdf` : `Rapport-${client.nom}-${client.prenom}.pdf`;

    // --- SECURISATION DES DONNEES ---
    // Vérifie que l'offre existe avant d'essayer d'accéder à son nom
    const offerName = documentData.offer && configData.offers && configData.offers[documentData.offer]
        ? configData.offers[documentData.offer].name
        : 'Non spécifiée';

    // --- Génération du contenu HTML du document ---
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: sans-serif; margin: 40px; color: #333; }
            h1 { color: #1a73e8; }
            .section { border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .section h2 { margin-top: 0; color: #333; }
            .photo-gallery img { max-width: 100%; border-radius: 4px; margin-bottom: 10px; }
            p { line-height: 1.6; }
        </style>
    </head>
    <body>
        <h1>${subject}</h1>
        <div class="section">
            <h2>Client</h2>
            <p>${client.prenom} ${client.nom}</p>
            <p>${client.adresse}</p>
            <p>${client.email} | ${client.telephone}</p>
        </div>
        
        ${documentType === 'rapport' ? `
        <div class="section">
            <h2>Détails du Rapport</h2>
            <p><strong>Date d'intervention:</strong> ${new Date(documentData.interventionDate).toLocaleDateString()}</p>
            <p><strong>Nuisibles constatés:</strong> ${documentData.nuisiblesConstates.join(', ') || 'N/A'}</p>
            <p><strong>Zones inspectées:</strong> ${documentData.zonesInspectees.join(', ') || 'N/A'}</p>
            <h2>Observations</h2>
            ${formatTextForHTML(documentData.observations)}
            <h2>Actions menées</h2>
            ${formatTextForHTML(documentData.actionsMenees.join('\n'))}
            <h2>Recommandations</h2>
            ${formatTextForHTML(documentData.recommandations)}
        </div>
        ${documentData.photos && documentData.photos.length > 0 ? `
        <div class="section photo-gallery">
            <h2>Photos</h2>
            ${documentData.photos.map(p => `<div><img src="${p.dataUrl}" alt="${p.caption || ''}"><p>${p.caption || ''}</p></div>`).join('')}
        </div>
        ` : ''}
        ` : `
        <div class="section">
             <h2>Détails du Devis (Version simplifiée)</h2>
             <p><strong>Offre principale:</strong> ${offerName}</p>
             <p><strong>Total à payer:</strong> ${documentData.calculation?.oneTimeTotal?.toFixed(2) || '0.00'} €</p>
             <p><strong>Total mensuel:</strong> ${documentData.calculation?.monthlyTotal?.toFixed(2) || '0.00'} €</p>
        </div>
        `}
    </body>
    </html>
    `;
    
    // Pour l'instant, nous n'envoyons pas de PDF réel, mais un email simple pour tester
    const msg = {
        to: client.email,
        from: process.env.SENDGRID_FROM_EMAIL, // Utilise l'email configuré sur Vercel
        subject: `${subject} pour ${client.prenom} ${client.nom}`,
        html: `<p>Bonjour ${client.prenom},</p><p>Veuillez trouver les informations concernant votre ${documentType}.</p><p>Ce message confirme que notre système d'envoi est fonctionnel.</p>
        <hr>
        <h3>Contenu brut (pour débogage):</h3>
        <pre>${JSON.stringify(documentData, null, 2)}</pre>`,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: 'Email envoyé avec succès' });
    } catch (error) {
        console.error('Erreur SendGrid:', error);
        if (error.response) {
            console.error(error.response.body)
        }
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email.' });
    }
}

