const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    const { documentData, configData, documentType } = req.body;

    if (!documentData || !configData || !documentType) {
        return res.status(400).json({ error: 'Missing required data.' });
    }

    const subject = documentType === 'devis' 
        ? `Votre devis de la part de ${documentData.salesperson}`
        : `Votre rapport d'intervention du ${new Date(documentData.interventionDate).toLocaleDateString('fr-FR')}`;

    const getInfestationLevelText = (level) => {
        if (level < 33) return `Faible (${level}%)`;
        if (level < 66) return `Modéré (${level}%)`;
        return `Élevé (${level}%)`;
    };

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background-color: #f4f4f9; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            h1 { color: #4A90E2; }
            .section { margin-bottom: 20px; padding: 15px; border-radius: 6px; border: 1px solid #eee; }
            .section h2 { margin-top: 0; color: #333; border-bottom: 2px solid #4A90E2; padding-bottom: 5px; }
            p { line-height: 1.6; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .photo-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
            .photo-item img { width: 100%; border-radius: 4px; }
            .photo-item p { margin: 5px 0 0; font-size: 0.9em; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${subject}</h1>
            
            <div class="section">
                <h2>Informations Client</h2>
                <p><strong>Client:</strong> ${documentData.client.prenom} ${documentData.client.nom}</p>
                <p><strong>Adresse:</strong> ${documentData.client.adresse}</p>
                <p><strong>Contact:</strong> ${documentData.client.telephone} | ${documentData.client.email}</p>
            </div>

            ${documentType === 'rapport' ? `
                <div class="section">
                    <h2>Détails de l'intervention</h2>
                    <p><strong>Date d'intervention:</strong> ${new Date(documentData.interventionDate).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Niveau d'infestation constaté:</strong> ${getInfestationLevelText(documentData.niveauInfestation)}</p>
                    <p><strong>Consommation des produits:</strong> ${documentData.consommationProduits}%</p>
                </div>
                <div class="section">
                    <h2>Diagnostic</h2>
                    <p><strong>Nuisibles constatés:</strong></p>
                    <ul>${documentData.nuisiblesConstates.length > 0 ? documentData.nuisiblesConstates.map(n => `<li>${n}</li>`).join('') : '<li>Aucun</li>'}</ul>
                    <p><strong>Zones inspectées:</strong></p>
                    <ul>${documentData.zonesInspectees.length > 0 ? documentData.zonesInspectees.map(z => `<li>${z}</li>`).join('') : '<li>Aucune</li>'}</ul>
                    <p><strong>Observations:</strong></p>
                    <p>${documentData.observations || 'Aucune observation.'}</p>
                </div>
                <div class="section">
                    <h2>Actions & Produits</h2>
                    <p><strong>Actions menées:</strong></p>
                    <ul>${documentData.actionsMenees.length > 0 ? documentData.actionsMenees.map(a => `<li>${a}</li>`).join('') : '<li>Aucune</li>'}</ul>
                    <p><strong>Produits utilisés:</strong></p>
                    <ul>${documentData.produitsUtilises.length > 0 ? documentData.produitsUtilises.map(p => `<li>${p}</li>`).join('') : '<li>Aucun produit utilisé.</li>'}</ul>
                </div>
                 <div class="section">
                    <h2>Photos</h2>
                    ${documentData.photos && documentData.photos.length > 0 ? `
                        <div class="photo-gallery">
                            ${documentData.photos.map(photo => `
                                <div class="photo-item">
                                    <img src="${photo.url}" alt="${photo.caption || 'Photo du rapport'}">
                                    ${photo.caption ? `<p>${photo.caption}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>Aucune photo pour cette intervention.</p>'}
                </div>
                <div class="section">
                    <h2>Recommandations</h2>
                    <p>${documentData.recommandations || 'Aucune recommandation.'}</p>
                </div>
            ` : ''}
        </div>
    </body>
    </html>
    `;
    
    const msg = {
        to: documentData.client.email,
        from: fromEmail,
        subject: subject,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('SendGrid Error:', error.response?.body || error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
}

