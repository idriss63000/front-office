// Ce fichier convertit une adresse textuelle en coordonnées GPS.
// Il est renforcé pour mieux gérer les erreurs et ne pas planter.

export default async function handler(req, res) {
  const GOOGLE_API_KEY = 'AIzaSyDfqjQ9a-IO6L4F4bgqETGtJXmCBvtIDzI';
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Une adresse est requise." });
  }

  try {
    const params = new URLSearchParams({
      address: address,
      key: GOOGLE_API_KEY,
      language: 'fr',
      region: 'fr'
    });

    const geocodeResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
    
    const contentType = geocodeResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const responseText = await geocodeResponse.text();
        console.error("La réponse de Google n'est pas du JSON:", responseText);
        throw new Error(`Réponse inattendue de l'API Google. Statut: ${geocodeResponse.status}.`);
    }

    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status === 'REQUEST_DENIED') {
        console.error("Erreur de l'API Google:", geocodeData);
        throw new Error(`La clé API Google a été refusée. Vérifiez que l'API "Geocoding API" est bien activée dans votre projet Google Cloud et que la clé n'a pas de restrictions.`);
    }

    if (geocodeData.status !== 'OK') {
        console.error("Erreur de l'API Google:", geocodeData);
        throw new Error(geocodeData.error_message || `Erreur de l'API Google: ${geocodeData.status}`);
    }
    
    if (geocodeData.results.length === 0) {
        throw new Error(`Aucun résultat trouvé pour l'adresse: "${address}"`);
    }
    
    const location = geocodeData.results[0].geometry.location;

    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.status(200).json(location);

  } catch (error) {
    console.error("[PROXY /api/geocode] Erreur:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur proxy.", details: error.message });
  }
}

