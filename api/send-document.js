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

    // --- SECURISATION DES DONNEES ---
    const offerName = documentData.offer && configData.offers && configData.offers[documentData.offer]
        ? configData.offers[documentData.offer].name
        : 'Non spécifiée';
        
    // --- PREPARATION DES IMAGES POUR L'EMAIL (NOUVELLE LOGIQUE) ---
    const attachments = [];
    let photoHtml = '';

    if (documentType === 'rapport' && documentData.photos && documentData.photos.length > 0) {
        documentData.photos.forEach((photo, index) => {
            // Extrait les données Base64 de l'URL de données
            const base64Data = photo.dataUrl.split(';base64,').pop();
            const contentId = `photo_${index}`;
            
            // Crée l'objet pièce jointe pour SendGrid
            attachments.push({
                content: base64Data,
                filename: `photo_${index}.png`,
                type: 'image/png',
                disposition: 'inline',
                content_id: contentId,
            });

            // Génère le HTML correspondant pour afficher l'image via son CID
            photoHtml += `<div><img src="cid:${contentId}" alt="${photo.caption || ''}"><p><em>${photo.caption || ''}</em></p></div>`;
        });
    }


    // --- Génération du contenu HTML du document ---
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #333; background-color: #f7f7f7; }
            .container { background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            h1 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; }
            .section { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .section h2 { margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .photo-gallery img { max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px; border: 1px solid #ddd; }
            p { line-height: 1.6; }
            strong { color: #1a73e8; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${subject}</h1>
            <div class="section">
                <h2>Client</h2>
                <p>${client.prenom} ${client.nom}</p>
                <p>${client.adresse || 'Adresse non renseignée'}</p>
                <p>${client.email} | ${client.telephone}</p>
            </div>
            
            ${documentType === 'rapport' ? `
            <div class="section">
                <h2>Détails du Rapport</h2>
                <p><strong>Date d'intervention:</strong> ${new Date(documentData.interventionDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Nuisibles constatés:</strong> ${documentData.nuisiblesConstates.join(', ') || 'Aucun'}</p>
                <p><strong>Zones inspectées:</strong> ${documentData.zonesInspectees.join(', ') || 'Aucune'}</p>
                <h2>Observations</h2>
                ${formatTextForHTML(documentData.observations) || '<p>Aucune observation.</p>'}
                <h2>Actions menées</h2>
                ${formatTextForHTML(documentData.actionsMenees.join('\n')) || '<p>Aucune action menée.</p>'}
                <h2>Recommandations</h2>
                ${formatTextForHTML(documentData.recommandations) || '<p>Aucune recommandation.</p>'}
            </div>
            ${photoHtml ? `
            <div class="section photo-gallery">
                <h2>Photos</h2>
                ${photoHtml}
            </div>
            ` : ''}
            ` : `
            <div class="section">
                 <h2>Détails du Devis</h2>
                 <p><strong>Offre principale:</strong> ${offerName}</p>
                 <p><strong>Total à payer:</strong> ${documentData.calculation?.oneTimeTotal?.toFixed(2) || '0.00'} €</p>
                 <p><strong>Total mensuel:</strong> ${documentData.calculation?.monthlyTotal?.toFixed(2) || '0.00'} €</p>
            </div>
            `}
        </div>
    </body>
    </html>
    `;
    
    // Création de l'objet message pour SendGrid
    const msg = {
        to: client.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `${subject} pour ${client.prenom} ${client.nom}`,
        html: htmlContent,
        // On ajoute les images en tant que pièces jointes
        attachments: attachments,
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

