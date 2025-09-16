// Importe la librairie SendGrid
import sgMail from '@sendgrid/mail';

// Fonction utilitaire pour formater le texte pour le HTML
const formatTextForHTML = (text) => {
    if (!text || typeof text !== 'string') {
        return ''; // Retourne une chaîne vide si le texte est null, undefined, ou pas une chaîne
    }
    return text.split('\n').map(line => `<p style="margin: 0 0 10px 0;">${line}</p>`).join('');
};

const getInfestationLabel = (value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return 'Non précisé';
    if (numValue < 33) return `Faible (${numValue}%)`;
    if (numValue < 66) return `Modérée (${numValue}%)`;
    return `Élevée (${numValue}%)`;
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
    const offerName = documentData.offer && configData && configData.offers && configData.offers[documentData.offer]
        ? configData.offers[documentData.offer].name
        : 'Non spécifiée';
        
    // --- PREPARATION DES IMAGES POUR L'EMAIL ---
    const attachments = [];
    let photoHtml = '';

    if (documentType === 'rapport' && documentData.photos && documentData.photos.length > 0) {
        documentData.photos.forEach((photo, index) => {
            const base64Data = photo.dataUrl.split(';base64,').pop();
            const contentId = `photo_${index}`;
            
            attachments.push({
                content: base64Data,
                filename: `photo_${index}.png`,
                type: 'image/png',
                disposition: 'inline',
                content_id: contentId,
            });

            photoHtml += `<div><img src="cid:${contentId}" alt="${photo.caption || ''}" style="max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 5px; border: 1px solid #ddd;"><p style="margin-top: 0; font-size: 12px; color: #666;"><em>${photo.caption || ''}</em></p></div>`;
        });
    }


    // --- Génération du contenu HTML du document ---
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; background-color: #f7f7f7; }
            .container { background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); max-width: 600px; margin: auto; }
            h1 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; font-size: 24px; }
            .section { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .section h2 { margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 18px;}
            .photo-gallery { }
            p { line-height: 1.6; margin: 0 0 10px 0; }
            strong { color: #1a73e8; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
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
                <p><strong>Niveau d'infestation constaté:</strong> ${getInfestationLabel(documentData.niveauInfestation)}</p>
                <p><strong>Consommation des produits:</strong> ${documentData.consommationProduits}%</p>
                <p><strong>Nuisibles constatés:</strong> ${documentData.nuisiblesConstates.join(', ') || 'Aucun'}</p>
                <p><strong>Zones inspectées:</strong> ${documentData.zonesInspectees.join(', ') || 'Aucune'}</p>
                <h2>Observations</h2>
                ${formatTextForHTML(documentData.observations) || '<p>Aucune observation.</p>'}
                <h2>Actions menées</h2>
                ${formatTextForHTML(documentData.actionsMenees.join('\n')) || '<p>Aucune action menée.</p>'}
                <h2>Produits utilisés</h2>
                ${(documentData.produitsUtilises && documentData.produitsUtilises.length > 0) ? `<ul>${documentData.produitsUtilises.map(p => `<li>${p}</li>`).join('')}</ul>` : '<p>Aucun produit utilisé.</p>'}
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
    
    const msg = {
        to: client.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `${subject} pour ${client.prenom} ${client.nom}`,
        html: htmlContent,
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

