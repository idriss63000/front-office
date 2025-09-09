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
    return res.status(500).json({ message: "La clé API Qonto n'est pas configurée sur le serveur." });
  }

  try {
    const { name, iban, amount, scheduled_date, frequency } = req.body;

    // --- Appel à la véritable API de Qonto ---
    const qontoResponse = await fetch('https://api.qonto.com/v2/direct_debit_mandates', {
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
      // Si Qonto renvoie une erreur, on la transmet au front-end
      console.error("Erreur de l'API Qonto:", responseData);
      throw new Error(responseData.message || `Erreur de l'API Qonto (${qontoResponse.status}).`);
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
