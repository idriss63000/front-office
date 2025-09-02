// Ce fichier agit comme un serveur proxy sécurisé pour éviter les erreurs CORS.
// Il s'exécute sur Vercel, pas dans le navigateur du client.

export default async function handler(req, res) {
  // 1. Récupérer et VALIDER les coordonnées depuis la requête du front-end
  let { lat, lon } = req.query;

  // CORRECTION : Nettoyage et validation des coordonnées pour enlever les caractères invalides (comme ":1")
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: "Les coordonnées GPS (latitude et longitude) sont invalides." });
  }

  // 2. Vos clés secrètes sont stockées ici, en sécurité sur le serveur.
  const CONSUMER_KEY = 'Wdy_zKzYqO_wI7NcnRnlUynmfO4a';
  const CONSUMER_SECRET = 'fhTKef2hArzWLua5CftDGalRUmca';

  try {
    // 3. Obtenir le jeton d'accès (Bearer Token) auprès de l'INSEE
    const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch('https://api.insee.fr/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Erreur d'authentification INSEE:", errorText);
      throw new Error(`Échec de l'authentification auprès de l'INSEE (${tokenResponse.status}). Vérifiez que vos clés sont correctes.`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 4. Utiliser le jeton pour rechercher les entreprises
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const radiusKm = 20;

    const queryString = `etatAdministratifEtablissement:A AND dateCreationEtablissement:[${formattedStartDate} TO *] AND geo(latitude:${latitude} longitude:${longitude} rayon:${radiusKm}km)`;
    
    const sireneResponse = await fetch(`https://api.insee.fr/entreprises/sirene/V3/siret`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          q: queryString,
          nombre: 100
      })
    });

    if (!sireneResponse.ok) {
        const errorData = await sireneResponse.json().catch(() => ({ header: { message: `Erreur ${sireneResponse.status} de l'API SIRENE.` }}));
        throw new Error(errorData.header?.message || `Erreur de l'API SIRENE (${sireneResponse.status}).`);
    }

    const companiesData = await sireneResponse.json();

    // 5. Renvoyer les résultats au front-end
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.status(200).json(companiesData);

  } catch (error) {
    console.error("Erreur dans la fonction proxy SIRENE:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur lors de la communication avec l'API SIRENE.", details: error.message });
  }
}


