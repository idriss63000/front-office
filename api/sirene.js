// Ce fichier agit comme un serveur proxy sécurisé pour éviter les erreurs CORS.
// Il s'exécute sur Vercel, pas dans le navigateur du client.

export default async function handler(req, res) {
  // 1. Récupérer et VALIDER les coordonnées depuis la requête du front-end
  let { lat, lon } = req.query;

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

    // CORRECTION FINALE : Ajout du champ "coordonneesEtablissement:" devant la fonction geo().
    const queryString = `coordonneesEtablissement:geo(latitude:${latitude} longitude:${longitude} rayon:${radiusKm}km) AND etatAdministratifEtablissement:A AND dateCreationEtablissement:[${formattedStartDate} TO *]`;

    const searchParams = new URLSearchParams({
      q: queryString,
      nombre: 100,
    });
    
    const sireneResponse = await fetch(`https://api.insee.fr/entreprises/sirene/V3/siret?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }
    });

    if (!sireneResponse.ok) {
        const errorText = await sireneResponse.text();
        console.error("Réponse brute de l'API SIRENE:", errorText);
        let errorDetails = `Erreur ${sireneResponse.status} de l'API SIRENE.`;
        try {
            const errorData = JSON.parse(errorText);
            errorDetails = errorData.header?.message || errorDetails;
        } catch(e) { /* Pas de JSON, on ignore */ }
        throw new Error(errorDetails);
    }

    const companiesData = await sireneResponse.json();

    // 5. Renvoyer les résultats au front-end
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.status(200).json(companiesData);

  } catch (error) {
    console.error("Erreur dans la fonction proxy SIRENE:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
}



