import React, { useState, useMemo, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, serverTimestamp, setLogLevel } from 'firebase/firestore';

// --- Icônes (SVG) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

// --- Données par défaut ---
const initialConfigData = {
  offers: {
    initiale: { name: 'Offre Initiale', price: 1500, mensualite: 29.99 },
    optimale: { name: 'Offre Optimale', price: 2500, mensualite: 49.99 },
  },
  packs: {
    argent: { name: 'Pack Argent', price: 500, mensualite: 10 },
    or: { name: 'Pack Or', price: 1000, mensualite: 20 },
    platine: { name: 'Pack Platine', price: 1500, mensualite: 30 },
  },
  extraItems: [],
  discounts: [],
  settings: {
      installationFee: 350,
      vat: {
          residentiel: 0.10,
          professionnel: 0.20
      }
  }
};

// --- Composants des étapes ---

const CustomerInfo = ({ data, setData, nextStep }) => {
  const handleChange = (e) => setData({ ...data, client: { ...data.client, [e.target.name]: e.target.value } });
  const isFormValid = () => data.client.nom && data.client.prenom && data.client.email && data.client.telephone;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Informations du client</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="nom" value={data.client.nom} onChange={handleChange} placeholder="Nom" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input name="prenom" value={data.client.prenom} onChange={handleChange} placeholder="Prénom" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input name="adresse" value={data.client.adresse} onChange={handleChange} placeholder="Adresse" className="p-3 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500" />
        <input type="tel" name="telephone" value={data.client.telephone} onChange={handleChange} placeholder="Téléphone" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input type="email" name="email" value={data.client.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={nextStep} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300">Suivant</button>
    </div>
  );
};

const CustomerType = ({ setData, nextStep, prevStep }) => {
  const setType = (type) => {
    setData(prev => ({ ...prev, type }));
    nextStep();
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800">Vous êtes...</h2>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button onClick={() => setType('residentiel')} className="flex flex-col items-center justify-center p-8 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition w-full md:w-52 h-40">
          <UserIcon />
          <span className="mt-4 text-lg font-semibold">Résidentiel</span>
        </button>
        <button onClick={() => setType('professionnel')} className="flex flex-col items-center justify-center p-8 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition w-full md:w-52 h-40">
          <BuildingIcon />
          <span className="mt-4 text-lg font-semibold">Professionnel</span>
        </button>
      </div>
      <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition mt-4">Précédent</button>
    </div>
  );
};

const MainOffer = ({ data, setData, nextStep, prevStep, config }) => {
  const selectOffer = (offerKey) => {
    setData(prev => ({ ...prev, offer: offerKey }));
    nextStep();
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Choisissez votre offre</h2>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        {Object.entries(config.offers).map(([key, offer]) => (
          <button key={key} onClick={() => selectOffer(key)} className="p-6 border-2 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition w-full">
            <h3 className="text-xl font-bold text-blue-600">{offer.name}</h3>
            <p className="text-2xl font-light mt-2">{offer.price} €</p>
            <p className="text-lg font-semibold text-gray-700 mt-1">+ {offer.mensualite} €/mois</p>
          </button>
        ))}
      </div>
      <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition mt-4">Précédent</button>
    </div>
  );
};

const AddonPacks = ({ data, setData, nextStep, prevStep, config }) => {
  const addPack = (packKey) => {
    const newPack = {
      id: Date.now(),
      key: packKey,
      details: ''
    };
    setData(prev => ({ ...prev, packs: [...prev.packs, newPack] }));
  };

  const removePack = (packId) => {
    setData(prev => ({ ...prev, packs: prev.packs.filter(p => p.id !== packId) }));
  };

  const handleDetailChange = (packId, details) => {
    const updatedPacks = data.packs.map(p => p.id === packId ? { ...p, details } : p);
    setData(prev => ({ ...prev, packs: updatedPacks }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Ajouter des packs supplémentaires</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(config.packs).map(([key, pack]) => (
          <button key={key} onClick={() => addPack(key)} className="p-4 border-2 rounded-lg text-center transition hover:border-blue-500 hover:bg-blue-50">
            <h3 className="text-lg font-bold text-gray-800">{pack.name}</h3>
            <p className="text-md font-light mt-1">{pack.price} €</p>
            <p className="text-sm font-semibold text-gray-600">+ {pack.mensualite} €/mois</p>
            <span className="mt-2 inline-block bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">Ajouter</span>
          </button>
        ))}
      </div>
      <hr />
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Packs sélectionnés</h3>
        {data.packs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun pack sélectionné.</p>
        ) : (
          <div className="space-y-4">
            {data.packs.map((pack) => {
              const packInfo = config.packs[pack.key];
              return (
                <div key={pack.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg">{packInfo.name}</h4>
                    <button onClick={() => removePack(pack.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                  </div>
                  <textarea value={pack.details} onChange={(e) => handleDetailChange(pack.id, e.target.value)} placeholder="Détaillez les éléments inclus..." className="w-full p-2 border rounded-md text-sm" rows="2"></textarea>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-6">
        <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Précédent</button>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Suivant</button>
      </div>
    </div>
  );
};

const ExtraItems = ({ data, setData, nextStep, prevStep, config }) => {
  const toggleItem = (itemId) => {
    const currentItems = data.extraItems || [];
    const newItems = currentItems.includes(itemId) ? currentItems.filter(id => id !== itemId) : [...currentItems, itemId];
    setData(prev => ({ ...prev, extraItems: newItems }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Éléments supplémentaires</h2>
      <div className="space-y-3">
        {config.extraItems.map(item => (
          <label key={item.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" checked={data.extraItems.includes(item.id)} onChange={() => toggleItem(item.id)} className="h-5 w-5 rounded text-blue-600"/>
            <span className="ml-4 text-gray-700">{item.name}</span>
            <span className="ml-auto font-semibold">{item.price} €</span>
          </label>
        ))}
      </div>
      <div className="flex gap-4 mt-6">
        <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Précédent</button>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Suivant</button>
      </div>
    </div>
  );
};

const Summary = ({ data, nextStep, prevStep, config, calculation, appliedDiscounts, setAppliedDiscounts }) => {
  const [discountCodes, setDiscountCodes] = useState({ materiel: '', abonnement: '' });
  const [error, setError] = useState('');

  const applyDiscount = (type) => {
      setError('');
      const code = discountCodes[type].toUpperCase();
      const discount = config.discounts.find(d => d.code === code && d.type === type && d.active);
      
      if (discount) {
          setAppliedDiscounts(prev => ({...prev, [type]: discount}));
      } else {
          setError(`Code de réduction (${type}) invalide ou inactif.`);
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Résumé du devis</h2>
      <div id="summary-content">
        <QuoteForPDF data={data} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} />
      </div>

       <div className="space-y-4">
            <div className="flex gap-2">
                <input type="text" value={discountCodes.materiel} onChange={(e) => setDiscountCodes({...discountCodes, materiel: e.target.value})} placeholder="Code réduction matériel" className="p-3 border rounded-lg w-full"/>
                <button onClick={() => applyDiscount('materiel')} className="bg-gray-800 text-white px-6 rounded-lg font-semibold hover:bg-black">OK</button>
            </div>
            <div className="flex gap-2">
                <input type="text" value={discountCodes.abonnement} onChange={(e) => setDiscountCodes({...discountCodes, abonnement: e.target.value})} placeholder="Code réduction abonnement" className="p-3 border rounded-lg w-full"/>
                <button onClick={() => applyDiscount('abonnement')} className="bg-gray-800 text-white px-6 rounded-lg font-semibold hover:bg-black">OK</button>
            </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="flex gap-4 mt-6">
        <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Précédent</button>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Valider et choisir la date</button>
      </div>
    </div>
  );
};

const QuoteForPDF = ({ data, config, calculation, appliedDiscounts }) => (
  <>
    <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border">
      <h3 className="font-bold text-lg mb-4">Client</h3>
      <p>{data.client.prenom} {data.client.nom}</p>
      <p>{data.client.adresse}</p>
      <p>{data.client.telephone} | {data.client.email}</p>
      <p className="capitalize mt-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">{data.type}</p>
    </div>

    <div className="p-4 sm:p-6 mt-4 bg-white rounded-lg border space-y-2">
      <h3 className="font-bold text-lg mb-4 text-blue-700">Paiement unique</h3>
      {data.offer && <div className="flex justify-between"><span>{config.offers[data.offer].name}</span><span>{config.offers[data.offer].price.toFixed(2)} €</span></div>}
      {data.packs.length > 0 && <p className="font-semibold pt-2">Packs supplémentaires :</p>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? (<div key={packInstance.id} className="pl-4"><div className="flex justify-between"><span>{packInfo.name}</span><span>{packInfo.price.toFixed(2)} €</span></div>{packInstance.details && <p className="text-xs text-gray-500 italic whitespace-pre-wrap ml-2"> - {packInstance.details}</p>}</div>) : null;
      })}
      {data.extraItems.length > 0 && <p className="font-semibold pt-2">Éléments supplémentaires :</p>}
      {data.extraItems.map(id => {
        const item = config.extraItems.find(i => i.id === id);
        return item ? <div key={id} className="flex justify-between pl-4"><span>{item.name}</span><span>{item.price.toFixed(2)} €</span></div> : null;
      })}
      <hr className="my-2"/><div className="flex justify-between font-semibold"><span>Sous-total Matériel</span><span>{calculation.oneTimeSubtotal.toFixed(2)} €</span></div>
      {appliedDiscounts.materiel && <div className="flex justify-between text-green-600"><span>Réduction ({appliedDiscounts.materiel.code})</span><span>- {calculation.oneTimeDiscountAmount.toFixed(2)} €</span></div>}
      <hr className="my-2"/><div className="flex justify-between"><span>Frais d'installation</span><span>{config.settings.installationFee.toFixed(2)} €</span></div>
      <div className="flex justify-between font-semibold"><span>Total HT</span><span>{calculation.totalWithInstall.toFixed(2)} €</span></div>
      <div className="flex justify-between"><span>TVA ({(config.settings.vat[data.type] * 100)}%)</span><span>{calculation.vatAmount.toFixed(2)} €</span></div>
      <hr className="my-2 border-t-2 border-gray-300"/><div className="flex justify-between font-bold text-2xl text-gray-800"><span>TOTAL À PAYER</span><span>{calculation.oneTimeTotal.toFixed(2)} €</span></div>
    </div>
    
     <div className="p-4 sm:p-6 mt-4 bg-white rounded-lg border space-y-2">
      <h3 className="font-bold text-lg mb-4 text-blue-700">Abonnement mensuel</h3>
      {data.offer && <div className="flex justify-between"><span>Abonnement {config.offers[data.offer].name}</span><span>{config.offers[data.offer].mensualite.toFixed(2)} €</span></div>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? <div key={packInstance.id} className="flex justify-between pl-4"><span>Abonnement {packInfo.name}</span><span>{packInfo.mensualite.toFixed(2)} €</span></div> : null;
      })}
      <hr className="my-2"/><div className="flex justify-between font-semibold"><span>Sous-total mensuel</span><span>{calculation.monthlySubtotal.toFixed(2)} €</span></div>
      {appliedDiscounts.abonnement && <div className="flex justify-between text-green-600"><span>Réduction ({appliedDiscounts.abonnement.code})</span><span>- {calculation.monthlyDiscountAmount.toFixed(2)} €</span></div>}
      <hr className="my-2 border-t-2 border-gray-300"/><div className="flex justify-between font-bold text-2xl text-gray-800"><span>TOTAL MENSUEL</span><span>{calculation.monthlyTotal.toFixed(2)} €</span></div>
    </div>
  </>
);

const InstallationDate = ({ data, setData, nextStep, prevStep, config, calculation, appliedDiscounts, db }) => {
  const [accepted, setAccepted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef();

  const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.body.appendChild(script);
  });

  const handleGenerateAndSend = async () => {
    setIsGenerating(true);
    
    try {
      await Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
      ]);
      await new Promise(resolve => setTimeout(resolve, 100));

      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;
      const input = pdfRef.current;
      if (!input) throw new Error("L'élément pour le PDF n'a pas été trouvé.");

      // Enregistrer le devis dans Firestore
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const quotesPath = `/artifacts/${appId}/public/data/devis`;
      const quoteToSave = {
          ...data,
          calculation,
          appliedDiscounts,
          createdAt: serverTimestamp()
      };
      await addDoc(collection(db, quotesPath), quoteToSave);

      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = imgWidth / (canvas.width / canvas.height);
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Devis-${data.client.nom}-${data.client.prenom}.pdf`);

      const subject = encodeURIComponent(`Votre devis`);
      const body = encodeURIComponent(`Bonjour ${data.client.prenom},\n\nVeuillez trouver ci-joint votre devis.\n\nCordialement,`);
      window.location.href = `mailto:${data.client.email}?subject=${subject}&body=${body}`;

      nextStep();

    } catch(error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Installation et Envoi</h2>
      <div className="p-6 bg-gray-50 rounded-lg border">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={() => setAccepted(!accepted)} className="h-5 w-5 rounded text-blue-600"/>
          <span className="ml-4 text-gray-700">Le client a accepté le devis et souhaite planifier l'installation.</span>
        </label>
        {accepted && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'installation</label>
            <input type="date" value={data.installationDate || ''} onChange={(e) => setData(prev => ({ ...prev, installationDate: e.target.value }))} className="p-3 border rounded-lg w-full"/>
          </div>
        )}
      </div>
       <div className="flex gap-4 mt-6">
        <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300">Précédent</button>
        <button onClick={handleGenerateAndSend} disabled={isGenerating} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
            {isGenerating ? 'En cours...' : 'Valider et envoyer'}
        </button>
      </div>
      <div className="absolute left-[-9999px] top-0 w-[210mm]">
          <div ref={pdfRef}>
              <QuoteForPDF data={data} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} />
          </div>
      </div>
    </div>
  );
};

const Confirmation = ({ reset }) => (
    <div className="text-center space-y-6">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Devis envoyé !</h2>
        <p className="text-gray-600">Le devis a été enregistré et le PDF téléchargé.</p>
        <button onClick={reset} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Créer un nouveau devis</button>
    </div>
);

// --- Composant principal de l'application ---
export default function App() {
  const initialData = {
    step: 1,
    client: { nom: '', prenom: '', adresse: '', telephone: '', email: '' },
    type: 'residentiel',
    offer: null,
    packs: [],
    extraItems: [],
    installationDate: null,
  };

  const [data, setData] = useState(initialData);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState({ materiel: null, abonnement: null });
  const dbRef = useRef(null);

  const calculation = useMemo(() => {
    if (!config) return null;
    let oneTimeSubtotal = 0;
    if (data.offer && config.offers[data.offer]) oneTimeSubtotal += config.offers[data.offer].price;
    data.packs.forEach(p => { if(config.packs[p.key]) oneTimeSubtotal += config.packs[p.key].price; });
    data.extraItems.forEach(id => { const i = config.extraItems.find(it => it.id === id); if (i) oneTimeSubtotal += i.price; });
    let oneTimeDiscountAmount = appliedDiscounts.materiel ? oneTimeSubtotal * appliedDiscounts.materiel.value : 0;
    const subtotalAfterDiscount = oneTimeSubtotal - oneTimeDiscountAmount;
    const totalWithInstall = subtotalAfterDiscount + config.settings.installationFee;
    const vatRate = config.settings.vat[data.type] || 0;
    const vatAmount = totalWithInstall * vatRate;
    const oneTimeTotal = totalWithInstall + vatAmount;
    let monthlySubtotal = 0;
    if (data.offer && config.offers[data.offer]) monthlySubtotal += config.offers[data.offer].mensualite;
    data.packs.forEach(p => { if(config.packs[p.key]) monthlySubtotal += config.packs[p.key].mensualite; });
    let monthlyDiscountAmount = appliedDiscounts.abonnement ? monthlySubtotal * appliedDiscounts.abonnement.value : 0;
    const monthlyTotal = monthlySubtotal - monthlyDiscountAmount;
    return { oneTimeSubtotal, oneTimeDiscountAmount, totalWithInstall, vatAmount, oneTimeTotal, monthlySubtotal, monthlyDiscountAmount, monthlyTotal };
  }, [data, appliedDiscounts, config]);

  useEffect(() => {
    const initFirebase = async () => {
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

            if (!firebaseConfig) throw new Error("Configuration Firebase manquante.");

            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            dbRef.current = db;
            const auth = getAuth(app);
            setLogLevel('debug');

            if (initialAuthToken) await signInWithCustomToken(auth, initialAuthToken);
            else await signInAnonymously(auth);

            const docPath = `/artifacts/${appId}/public/data/config/main`;
            const configDocRef = doc(db, docPath);
            const docSnap = await getDoc(configDocRef);
            if (docSnap.exists()) setConfig(docSnap.data());
            else {
                await setDoc(configDocRef, initialConfigData);
                setConfig(initialConfigData);
            }
        } catch (err) {
            console.error("Erreur d'initialisation:", err);
            setError("Impossible de charger la configuration.");
        } finally {
            setIsLoading(false);
        }
    };
    initFirebase();
  }, []);

  const nextStep = () => setData(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setData(prev => ({ ...prev, step: prev.step - 1 }));
  const reset = () => {
    setData(initialData);
    setAppliedDiscounts({ materiel: null, abonnement: null });
  };

  const renderStep = () => {
    switch (data.step) {
      case 1: return <CustomerInfo data={data} setData={setData} nextStep={nextStep} />;
      case 2: return <CustomerType setData={setData} nextStep={nextStep} prevStep={prevStep} />;
      case 3: return <MainOffer data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 4: return <AddonPacks data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 5: return <ExtraItems data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 6: return <Summary data={data} nextStep={nextStep} prevStep={prevStep} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} setAppliedDiscounts={setAppliedDiscounts} />;
      case 7: return <InstallationDate data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} db={dbRef.current} />;
      case 8: return <Confirmation reset={reset} />;
      default: return <CustomerInfo data={data} setData={setData} nextStep={nextStep} />;
    }
  };

  if (isLoading) return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><p className="animate-pulse">Chargement...</p></div>;
  if (error || !config) return <div className="bg-red-100 min-h-screen flex items-center justify-center p-4"><p className="text-red-700 text-center"><b>Erreur:</b> {error || "Config introuvable."}</p></div>;

  const progress = (data.step / 8) * 100;

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
            <div className="flex justify-between mb-1"><span className="text-base font-medium text-blue-700">Progression</span><span className="text-sm font-medium text-blue-700">Étape {data.step} sur 8</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">{renderStep()}</div>
      </div>
    </div>
  );
}
