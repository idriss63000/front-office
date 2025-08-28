import React, { useState, useMemo, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, updateDoc, serverTimestamp, setLogLevel, onSnapshot } from 'firebase/firestore';

// --- Icônes (SVG) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const LogInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;


// --- Données par défaut ---
const initialConfigData = {
  offers: {
    initiale: { name: 'Offre Initiale', description: 'Description de base pour l\'offre initiale.', residentiel: { price: 1500, mensualite: 29.99 }, professionnel: { price: 1800, mensualite: 39.99 } },
    optimale: { name: 'Offre Optimale', description: 'Description complète pour l\'offre optimale.', residentiel: { price: 2500, mensualite: 49.99 }, professionnel: { price: 2900, mensualite: 59.99 } },
  },
  packs: {
    argent: { name: 'Pack Argent', residentiel: { price: 500, mensualite: 10 }, professionnel: { price: 600, mensualite: 15 } },
    or: { name: 'Pack Or', residentiel: { price: 1000, mensualite: 20 }, professionnel: { price: 1200, mensualite: 25 } },
    platine: { name: 'Pack Platine', residentiel: { price: 1500, mensualite: 30 }, professionnel: { price: 1800, mensualite: 35 } },
  },
  extraItems: [],
  discounts: [],
  settings: { installationFee: 350, vat: { residentiel: 0.10, professionnel: 0.20 } }
};

// --- Composants ---

const SalespersonLogin = ({ onLogin }) => {
  const [salesperson, setSalesperson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAttemptLogin = async () => {
    if (!salesperson || salesperson.trim() === '') return;
    setError('');
    setIsLoading(true);
    const success = await onLogin(salesperson.trim());
    if (!success) {
      setError('Commercial non reconnu. Veuillez vérifier le nom.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 text-center">
      <LogInIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h2 className="text-2xl font-bold text-gray-800">Identification du commercial</h2>
      <p className="text-gray-600">Veuillez entrer votre nom pour continuer.</p>
      <input 
        value={salesperson} 
        onChange={(e) => setSalesperson(e.target.value)} 
        placeholder="Votre nom" 
        className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full text-center" 
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button 
        onClick={handleAttemptLogin} 
        disabled={isLoading || !salesperson.trim()} 
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300"
      >
        {isLoading ? 'Vérification...' : 'Accéder à mon espace'}
      </button>
    </div>
  );
};

const CustomerInfo = ({ data, setData, nextStep, prevStep }) => {
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
      <div className="flex gap-4 mt-6">
        <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Précédent</button>
        <button onClick={nextStep} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300">Suivant</button>
      </div>
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
        {Object.entries(config.offers).map(([key, offer]) => {
          const priceInfo = offer[data.type] || offer.residentiel || { price: 0, mensualite: 0 };
          return (
            <button key={key} onClick={() => selectOffer(key)} className="p-6 border-2 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition w-full">
              <h3 className="text-xl font-bold text-blue-600">{offer.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{offer.description}</p>
              <p className="text-2xl font-light mt-2">{priceInfo.price} €</p>
              <p className="text-lg font-semibold text-gray-700 mt-1">+ {priceInfo.mensualite} €/mois</p>
            </button>
          )
        })}
      </div>
      <button onClick={prevStep} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition mt-4">Précédent</button>
    </div>
  );
};

const AddonPacks = ({ data, setData, nextStep, prevStep, config }) => {
  const addPack = (packKey) => {
    const newPack = { id: Date.now(), key: packKey, details: '' };
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
        {Object.entries(config.packs).map(([key, pack]) => {
          const priceInfo = pack[data.type] || pack.residentiel || { price: 0, mensualite: 0 };
          return (
            <button key={key} onClick={() => addPack(key)} className="p-4 border-2 rounded-lg text-center transition hover:border-blue-500 hover:bg-blue-50">
              <h3 className="text-lg font-bold text-gray-800">{pack.name}</h3>
              <p className="text-md font-light mt-1">{priceInfo.price} €</p>
              <p className="text-sm font-semibold text-gray-600">+ {priceInfo.mensualite} €/mois</p>
              <span className="mt-2 inline-block bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">Ajouter</span>
            </button>
          )
        })}
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
  const [discountCode, setDiscountCode] = useState('');
  const [error, setError] = useState('');

  const applyDiscount = () => {
      setError('');
      const code = discountCode.toUpperCase();
      const discount = config.discounts.find(d => d.code === code && d.active);
      
      if (discount) {
          const newDiscounts = appliedDiscounts.filter(d => {
              if (discount.type === 'prix_fixe' || discount.type === 'materiel') {
                  return d.type !== 'prix_fixe' && d.type !== 'materiel';
              }
              return d.type !== discount.type;
          });
          setAppliedDiscounts([...newDiscounts, discount]);
          setDiscountCode('');
      } else {
          setError(`Code de réduction invalide ou inactif.`);
      }
  };

  const removeDiscount = (discountId) => {
    setAppliedDiscounts(prev => prev.filter(d => d.id !== discountId));
    setError('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Résumé du devis</h2>
      <div id="summary-content">
        <QuoteForPDF data={data} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} removeDiscount={removeDiscount} />
      </div>
        <div className="space-y-4">
            <div className="flex gap-2">
                <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Code de réduction" className="p-3 border rounded-lg w-full"/>
                <button onClick={applyDiscount} className="bg-gray-800 text-white px-6 rounded-lg font-semibold hover:bg-black">Appliquer</button>
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

const QuoteForPDF = ({ data, config, calculation, appliedDiscounts, removeDiscount }) => (
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
      {data.offer && (
        <div>
            <div className="flex justify-between">
                <span>{config.offers[data.offer].name}</span>
                <span>{calculation.offerPrice.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-gray-500 italic pl-4">{config.offers[data.offer].description}</p>
        </div>
      )}
      {data.packs.length > 0 && <p className="font-semibold pt-2">Packs supplémentaires :</p>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? (<div key={packInstance.id} className="pl-4"><div className="flex justify-between"><span>{packInfo.name}</span><span>{packInfo[data.type]?.price.toFixed(2) || '0.00'} €</span></div>{packInstance.details && <p className="text-xs text-gray-500 italic whitespace-pre-wrap ml-2"> - {packInstance.details}</p>}</div>) : null;
      })}
      {data.extraItems.length > 0 && <p className="font-semibold pt-2">Éléments supplémentaires :</p>}
      {data.extraItems.map(id => {
        const item = config.extraItems.find(i => i.id === id);
        return item ? <div key={id} className="flex justify-between pl-4"><span>{item.name}</span><span>{item.price.toFixed(2)} €</span></div> : null;
      })}
      <hr className="my-2"/><div className="flex justify-between font-semibold"><span>Sous-total Matériel</span><span>{calculation.oneTimeSubtotal.toFixed(2)} €</span></div>
      {appliedDiscounts.map(discount => {
        if (discount.type === 'materiel' || discount.type === 'prix_fixe') {
            return ( <div key={discount.id} className="flex justify-between items-center text-green-600"> <div className="flex items-center gap-2"> <span>Réduction ({discount.code})</span> <button onClick={() => removeDiscount(discount.id)} className="text-red-500 hover:text-red-700"><XCircleIcon /></button> </div> <span>- {calculation.oneTimeDiscountAmount.toFixed(2)} €</span> </div> )
        }
        return null;
      })}
      <hr className="my-2"/>
      <div className="flex justify-between">
        <span>Frais d'installation</span>
        <span>{config.settings.installationFee.toFixed(2)} €</span>
      </div>
      {appliedDiscounts.map(discount => {
        if (discount.type === 'installation_offerte') {
            return ( <div key={discount.id} className="flex justify-between items-center text-green-600"> <div className="flex items-center gap-2"> <span>Réduction ({discount.code})</span> <button onClick={() => removeDiscount(discount.id)} className="text-red-500 hover:text-red-700"><XCircleIcon /></button> </div> <span>- {config.settings.installationFee.toFixed(2)} €</span> </div> )
        }
        return null;
      })}
      <div className="flex justify-between font-semibold"><span>Total HT</span><span>{calculation.totalWithInstall.toFixed(2)} €</span></div>
      <div className="flex justify-between"><span>TVA ({(config.settings.vat[data.type] * 100)}%)</span><span>{calculation.vatAmount.toFixed(2)} €</span></div>
      <hr className="my-2 border-t-2 border-gray-300"/><div className="flex justify-between font-bold text-2xl text-gray-800"><span>TOTAL À PAYER</span><span>{calculation.oneTimeTotal.toFixed(2)} €</span></div>
    </div>
     <div className="p-4 sm:p-6 mt-4 bg-white rounded-lg border space-y-2">
      <h3 className="font-bold text-lg mb-4 text-blue-700">Abonnement mensuel</h3>
      {data.offer && <div className="flex justify-between"><span>Abonnement {config.offers[data.offer].name}</span><span>{config.offers[data.offer][data.type]?.mensualite.toFixed(2) || '0.00'} €</span></div>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? <div key={packInstance.id} className="flex justify-between pl-4"><span>Abonnement {packInfo.name}</span><span>{packInfo[data.type]?.mensualite.toFixed(2) || '0.00'} €</span></div> : null;
      })}
      <hr className="my-2"/><div className="flex justify-between font-semibold"><span>Sous-total mensuel</span><span>{calculation.monthlySubtotal.toFixed(2)} €</span></div>
      {appliedDiscounts.map(discount => {
        if (discount.type === 'abonnement') {
            return ( <div key={discount.id} className="flex justify-between items-center text-green-600"> <div className="flex items-center gap-2"> <span>Réduction ({discount.code})</span> <button onClick={() => removeDiscount(discount.id)} className="text-red-500 hover:text-red-700"><XCircleIcon /></button> </div> <span>- {calculation.monthlyDiscountAmount.toFixed(2)} €</span> </div> )
        }
        return null;
      })}
      <hr className="my-2 border-t-2 border-gray-300"/><div className="flex justify-between font-bold text-2xl text-gray-800"><span>TOTAL MENSUEL</span><span>{calculation.monthlyTotal.toFixed(2)} €</span></div>
    </div>
  </>
);

const InstallationDate = ({ data, setData, nextStep, prevStep, config, calculation, appliedDiscounts, db, appId }) => {
  const [status, setStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef();
  
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'accepted') setData(prev => ({...prev, followUpDate: null}));
    if (newStatus === 'thinking') setData(prev => ({...prev, installationDate: null}));
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.body.appendChild(script);
  });
  
  const formatDateForGoogle = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '');
    return `${formatDate(date)}/${formatDate(nextDay)}`;
  };

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

      const quotesPath = `/artifacts/${appId}/public/data/devis`;
      const quoteToSave = { ...data, calculation, appliedDiscounts, createdAt: serverTimestamp() };
      await addDoc(collection(db, quotesPath), quoteToSave);

      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = imgWidth / (canvas.width / canvas.height);
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Devis-${data.client.nom}-${data.client.prenom}.pdf`);

      if (data.installationDate || data.followUpDate) {
        const eventDate = data.installationDate || data.followUpDate;
        const title = data.installationDate ? `Installation - ${data.client.prenom} ${data.client.nom}` : `Relance - ${data.client.prenom} ${data.client.nom}`;
        const details = `Client: ${data.client.prenom} ${data.client.nom}\nTéléphone: ${data.client.telephone}\nEmail: ${data.client.email}\nAdresse: ${data.client.adresse}`;
        const formattedDate = formatDateForGoogle(eventDate);
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(data.client.adresse)}`;
        window.open(calendarUrl, '_blank');
      }

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
      <div className="p-6 bg-gray-50 rounded-lg border space-y-4">
        <label className="flex items-center cursor-pointer">
          <input type="radio" name="status" checked={status === 'accepted'} onChange={() => handleStatusChange('accepted')} className="h-4 w-4 text-blue-600"/>
          <span className="ml-3 text-gray-700">Le client a accepté le devis.</span>
        </label>
        {status === 'accepted' && (
          <div className="pl-7 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'installation</label>
            <input type="date" value={data.installationDate || ''} onChange={(e) => setData(prev => ({ ...prev, installationDate: e.target.value }))} className="p-3 border rounded-lg w-full"/>
          </div>
        )}
        <label className="flex items-center cursor-pointer">
          <input type="radio" name="status" checked={status === 'thinking'} onChange={() => handleStatusChange('thinking')} className="h-4 w-4 text-blue-600"/>
          <span className="ml-3 text-gray-700">Le client souhaite réfléchir.</span>
        </label>
        {status === 'thinking' && (
          <div className="pl-7 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de relance</label>
            <input type="date" value={data.followUpDate || ''} onChange={(e) => setData(prev => ({ ...prev, followUpDate: e.target.value }))} className="p-3 border rounded-lg w-full"/>
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
              <QuoteForPDF data={data} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} removeDiscount={() => {}} />
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

const AppointmentList = ({ salesperson, onNavigate, onSelectAppointment, appointments, onUpdateStatus }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmé': return 'bg-green-100 text-green-800';
      case 'en attente': return 'bg-yellow-100 text-yellow-800';
      case 'relance': return 'bg-blue-100 text-blue-800';
      case 'pas vendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mes rendez-vous</h1>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300">
             <ArrowLeftIcon /> Retour
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Aucun rendez-vous pour le moment.</p>
          ) : (
            appointments.map(app => (
              <div key={app.id} className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div onClick={() => onSelectAppointment(app)} className="cursor-pointer flex-grow">
                  <p className="font-bold text-lg">{app.clientName}</p>
                  <p className="text-sm text-gray-600">Le {new Date(app.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(app.status)}`}>{app.status}</span>
                  <select value={app.status} onChange={(e) => onUpdateStatus(app.docId, e.target.value)} onClick={(e) => e.stopPropagation()} className="p-1 border rounded-md text-sm bg-white">
                    <option value="en attente">En attente</option>
                    <option value="relance">Relance</option>
                    <option value="pas vendu">Pas vendu</option>
                    <option value="confirmé">Confirmé</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentDetail = ({ appointment, onBack, onStartQuote }) => {
  if (!appointment) return <div>Rendez-vous non trouvé.</div>;

  const clientDataForQuote = {
      nom: appointment.clientName.split(' ').slice(1).join(' '),
      prenom: appointment.clientName.split(' ')[0],
      email: '', 
      telephone: appointment.phone || '',
      adresse: appointment.address || ''
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4">
          <ArrowLeftIcon /> Tous les rendez-vous
        </button>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800">{appointment.clientName}</h2>
          <p className="text-gray-600 mt-2">Date : {new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-1">Adresse : {appointment.address}</p>
          <p className="mt-1">Téléphone : {appointment.phone}</p>
          <p className="mt-1">Statut : <span className="font-semibold">{appointment.status}</span></p>
          <hr className="my-6" />
          <button onClick={() => onStartQuote(clientDataForQuote)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Créer un devis pour ce client
          </button>
        </div>
      </div>
    </div>
  );
};

const NewAppointment = ({ salesperson, onBack, onAppointmentCreated }) => {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState(''); 
  const [phone, setPhone] = useState(''); 

  const formatDateForGoogle = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '');
    return `${formatDate(date)}/${formatDate(nextDay)}`;
  };

  const handleSave = () => {
    const newAppointmentData = { salesperson, clientName, date, address, phone, status: 'en attente', createdAt: serverTimestamp() };
    onAppointmentCreated(newAppointmentData);
    const title = `Rendez-vous - ${clientName}`;
    const details = `Prospect: ${clientName}\nTéléphone: ${phone}\nCommercial: ${salesperson}`;
    const formattedDate = formatDateForGoogle(date);
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(address)}`;
    window.open(calendarUrl, '_blank');
  };

  const isFormValid = () => clientName && date && address && phone;

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4">
       <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4">
             <ArrowLeftIcon /> Accueil
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau rendez-vous</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du prospect</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jean Dupont" className="w-full p-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du rendez-vous</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du rendez-vous</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Rue de l'Exemple, 75001 Paris" className="w-full p-3 border rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone du prospect</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" className="w-full p-3 border rounded-lg"/>
            </div>
            <button onClick={handleSave} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300">
              Enregistrer le rendez-vous
            </button>
          </div>
       </div>
    </div>
  );
};

const HomeScreen = ({ salesperson, onNavigate, onStartQuote }) => {
    return (
        <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-3xl font-bold text-gray-800">Bienvenue, {salesperson}</h1>
                <p className="text-gray-600 mt-2 mb-8">Que souhaitez-vous faire ?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={() => onNavigate('appointmentList')} className="flex flex-col items-center justify-center p-8 bg-white border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition h-48">
                        <CalendarIcon />
                        <span className="mt-4 text-lg font-semibold">Mes rendez-vous</span>
                    </button>
                    <button onClick={() => onNavigate('newAppointment')} className="flex flex-col items-center justify-center p-8 bg-white border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition h-48">
                        <CalendarIcon />
                        <span className="mt-4 text-lg font-semibold">Créer un rendez-vous</span>
                    </button>
                    <button onClick={() => onStartQuote()} className="flex flex-col items-center justify-center p-8 bg-white border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition h-48">
                        <FileTextIcon />
                        <span className="mt-4 text-lg font-semibold">Nouveau Devis</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

const QuoteProcess = ({ data, setData, onBackToHome }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const dbRef = useRef(null);
  const appIdRef = useRef(null);

  const calculation = useMemo(() => {
    if (!config || !data.type) return null;
    let offerPrice = 0;
    if (data.offer && config.offers[data.offer]) offerPrice = config.offers[data.offer][data.type]?.price || 0;
    const fixedPriceDiscount = appliedDiscounts.find(d => d.type === 'prix_fixe' && d.targetOffer === data.offer);
    if (fixedPriceDiscount) offerPrice = fixedPriceDiscount.value;
    let oneTimeSubtotal = offerPrice;
    data.packs.forEach(p => { if(config.packs[p.key]) oneTimeSubtotal += config.packs[p.key][data.type]?.price || 0; });
    data.extraItems.forEach(id => { const i = config.extraItems.find(it => it.id === id); if (i) oneTimeSubtotal += i.price; });
    const materialDiscount = appliedDiscounts.find(d => d.type === 'materiel');
    let oneTimeDiscountAmount = materialDiscount ? materialDiscount.value : 0;
    const subtotalAfterDiscount = oneTimeSubtotal - oneTimeDiscountAmount;
    const installDiscount = appliedDiscounts.find(d => d.type === 'installation_offerte');
    const installationFee = installDiscount ? 0 : config.settings.installationFee;
    const totalWithInstall = subtotalAfterDiscount + installationFee;
    const vatRate = config.settings.vat[data.type] || 0;
    const vatAmount = totalWithInstall * vatRate;
    const oneTimeTotal = totalWithInstall + vatAmount;
    let monthlySubtotal = 0;
    if (data.offer && config.offers[data.offer]) monthlySubtotal += config.offers[data.offer][data.type]?.mensualite || 0;
    data.packs.forEach(p => { if(config.packs[p.key]) monthlySubtotal += config.packs[p.key][data.type]?.mensualite || 0; });
    const subscriptionDiscount = appliedDiscounts.find(d => d.type === 'abonnement');
    let monthlyDiscountAmount = subscriptionDiscount ? subscriptionDiscount.value : 0;
    const monthlyTotal = monthlySubtotal - monthlyDiscountAmount;
    return { oneTimeSubtotal, oneTimeDiscountAmount, totalWithInstall, vatAmount, oneTimeTotal, monthlySubtotal, monthlyDiscountAmount, monthlyTotal, offerPrice, installationFee };
  }, [data, appliedDiscounts, config]);

  useEffect(() => {
    const initFirebase = async () => {
        try {
            const firebaseConfig = {
              apiKey: "AIzaSyC19fhi-zWc-zlgZgjcQ7du2pK7CaywyO0",
              authDomain: "application-devis-f2a31.firebaseapp.com",
              projectId: "application-devis-f2a31",
              storageBucket: "application-devis-f2a31.appspot.com",
              messagingSenderId: "960846329322",
              appId: "1:960846329322:web:5802132e187aa131906e93",
              measurementId: "G-1F9T98PGS9"
            };
            const appId = firebaseConfig.appId;
            appIdRef.current = appId;
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            dbRef.current = db;
            const auth = getAuth(app);
            setLogLevel('debug');
            await signInAnonymously(auth);
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
            if (err.code === 'auth/configuration-not-found') setError("ERREUR : La connexion anonyme doit être activée dans votre console Firebase.");
            else setError("Impossible de charger la configuration.");
        } finally {
            setIsLoading(false);
        }
    };
    initFirebase();
  }, []);

  const nextStep = () => setData(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setData(prev => ({ ...prev, step: prev.step - 1 }));
  
  const renderStep = () => {
    switch (data.step) {
      case 1: return <CustomerInfo data={data} setData={setData} nextStep={nextStep} prevStep={onBackToHome} />;
      case 2: return <CustomerType setData={setData} nextStep={nextStep} prevStep={prevStep} />;
      case 3: return <MainOffer data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 4: return <AddonPacks data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 5: return <ExtraItems data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 6: return <Summary data={data} nextStep={nextStep} prevStep={prevStep} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} setAppliedDiscounts={setAppliedDiscounts} />;
      case 7: return <InstallationDate data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} db={dbRef.current} appId={appIdRef.current} />;
      case 8: return <Confirmation reset={onBackToHome} />;
      default: return <CustomerInfo data={data} setData={setData} nextStep={nextStep} prevStep={onBackToHome} />;
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


// --- MODIFICATION ICI : Déplacement des définitions de composants avant leur utilisation ---
export default function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [salesperson, setSalesperson] = useState('');
  const [quoteData, setQuoteData] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const firebaseRef = useRef(null);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyC19fhi-zWc-zlgZgjcQ7du2pK7CaywyO0",
      authDomain: "application-devis-f2a31.firebaseapp.com",
      projectId: "application-devis-f2a31",
      storageBucket: "application-devis-f2a31.appspot.com",
      messagingSenderId: "960846329322",
      appId: "1:960846329322:web:5802132e187aa131906e93",
      measurementId: "G-1F9T98PGS9"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const appId = firebaseConfig.appId;
    setLogLevel('debug');
    signInAnonymously(auth).catch(error => console.error("Erreur de connexion anonyme", error));
    firebaseRef.current = { db, auth, appId };
  }, []);

  useEffect(() => {
    if (!salesperson || !firebaseRef.current) return;
    const { db, appId } = firebaseRef.current;
    const appointmentsPath = `/artifacts/${appId}/public/data/appointments`;
    const q = query(collection(db, appointmentsPath), where("salesperson", "==", salesperson));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsList = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      appointmentsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAppointments(appointmentsList);
    }, (error) => console.error("Erreur de lecture des RDV: ", error));
    return () => unsubscribe();
  }, [salesperson]);

  const addAppointment = async (newAppointment) => {
    if (!firebaseRef.current) return;
    const { db, appId } = firebaseRef.current;
    const appointmentsPath = `/artifacts/${appId}/public/data/appointments`;
    try {
      await addDoc(collection(db, appointmentsPath), newAppointment);
    } catch (error) {
      console.error("Erreur d'ajout du RDV: ", error);
      alert("Impossible de sauvegarder le rendez-vous.");
    }
  };

  const updateAppointmentStatus = async (docId, newStatus) => {
    if (!firebaseRef.current) return;
    const { db, appId } = firebaseRef.current;
    const appointmentDocRef = doc(db, `/artifacts/${appId}/public/data/appointments`, docId);
    try {
      await updateDoc(appointmentDocRef, { status: newStatus });
    } catch (error) {
      console.error("Erreur de mise à jour du statut: ", error);
      alert("Impossible de mettre à jour le statut.");
    }
  };

  const handleLogin = async (name) => {
    if (!firebaseRef.current) return false;
    const { db, appId } = firebaseRef.current;
    const salespersonsPath = `/artifacts/${appId}/public/data/salespersons`;
    const q = query(collection(db, salespersonsPath), where("name", "==", name));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            setSalesperson(name);
            setCurrentView('home');
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Erreur de vérification du commercial:", error);
        return false;
    }
  };

  const startNewQuote = (initialClientData = null) => {
    const initialData = {
      step: initialClientData ? 2 : 1, 
      salesperson: salesperson,
      client: initialClientData || { nom: '', prenom: '', adresse: '', telephone: '', email: '' },
      type: 'residentiel', offer: null, packs: [], extraItems: [], installationDate: null, followUpDate: null,
    };
    setQuoteData(initialData);
    setCurrentView('quote');
  };
  
  const handleBackToHome = () => {
      setCurrentView('home');
      setQuoteData(null); 
  }

  const viewAppointment = (appointment) => {
      setSelectedAppointment(appointment);
      setCurrentView('appointmentDetail');
  }

  if (currentView === 'login') {
    return (
      <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <SalespersonLogin onLogin={handleLogin} />
        </div>
      </div>
    );
  }
  
  if (currentView === 'home') {
      return <HomeScreen salesperson={salesperson} onNavigate={setCurrentView} onStartQuote={startNewQuote} />
  }

  if (currentView === 'quote') {
    return <QuoteProcess data={quoteData} setData={setQuoteData} onBackToHome={handleBackToHome} />;
  }
  
  if (currentView === 'appointmentList') {
      return <AppointmentList appointments={appointments} salesperson={salesperson} onNavigate={setCurrentView} onSelectAppointment={viewAppointment} onUpdateStatus={updateAppointmentStatus} />;
  }
  
  if (currentView === 'appointmentDetail') {
      return <AppointmentDetail appointment={selectedAppointment} onBack={() => setCurrentView('appointmentList')} onStartQuote={startNewQuote} />;
  }
  
  if (currentView === 'newAppointment') {
      return <NewAppointment salesperson={salesperson} onBack={() => setCurrentView('home')} 
                onAppointmentCreated={async (newApp) => {
                  await addAppointment(newApp);
                  setCurrentView('appointmentList');
                }} 
             />;
  }
  
  return <div>Vue non reconnue</div>;
}
