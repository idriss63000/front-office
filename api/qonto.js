// Ce fichier est votre "point de terminaison" sécurisé sur le serveur Vercel.
// Il reçoit les données du formulaire et appelle l'API Qonto.

export default async function handler(req, res) {
  // --- Sécurité : Vérifier que la méthode est POST ---
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée.' });
  }

  // --- Récupération de la clé API depuis les variables d'environnement de Vercel ---
  const QONTO_API_KEY = process.env.QONTO_API_KEY;

  if (!QONTO_API_KEY) {
    console.error("La variable d'environnement QONTO_API_KEY n'est pas définie.");
    return res.status(500).json({ message: "La clé API Qonto n'est pas configurée sur le serveur." });
  }

  try {
    const { name, iban, amount, scheduled_date, frequency } = req.body;

    // --- CORRECTION: Utilisation de la bonne URL pour l'API de production ---
    const qontoApiUrl = 'https://thirdparty.qonto.com/v2/direct_debit_mandates';
    
    const qontoResponse = await fetch(qontoApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QONTO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        debtor_name: name,
        debtor_iban: iban,
        amount: amount, // Le montant doit être en centimes
        currency: 'EUR',
        scheduled_date: scheduled_date,
        frequency: frequency,
        type: 'b2b' // Mandat inter-entreprises
      }),
    });
    
    const responseData = await qontoResponse.json();

    if (!qontoResponse.ok) {
      console.error("Erreur de l'API Qonto:", responseData);
      const errorMessage = responseData.message || responseData.meta?.message || `Erreur de l'API Qonto (${qontoResponse.status}).`;
      throw new Error(errorMessage);
    }

    // --- Succès : On renvoie les informations nécessaires au front-end ---
    res.status(200).json({
      success: true,
      mandate_id: responseData.direct_debit_mandate.id,
      signing_url: responseData.direct_debit_mandate.signing_url
    });

  } catch (error) {
    console.error("[PROXY /api/qonto] Erreur:", error.message);
    res.status(500).json({ message: error.message });
  }
}

