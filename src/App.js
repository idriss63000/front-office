/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useMemo, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, updateDoc, serverTimestamp, setLogLevel, onSnapshot } from 'firebase/firestore';

// --- Icônes (SVG) ---
const UserIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BuildingIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const CheckCircleIcon = ({ className = "h-16 w-16 text-green-500" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const LogInIcon = ({ className = "h-12 w-12 text-slate-400" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>;
const FileTextIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CalendarIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const VideoIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const ContractIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m16 14-4-4-4 4"></path><path d="M12 10v9"></path></svg>;
const ClipboardIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const CameraIcon = ({ className="h-6 w-6" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;

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
const Modal = ({ title, message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-slate-600 mt-2 mb-4">{message}</p>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Fermer</button>
        </div>
    </div>
);

const SalespersonLogin = ({ onLogin, isFirebaseReady }) => {
  const [salesperson, setSalesperson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const handleAttemptLogin = async () => {
    if (!salesperson || salesperson.trim() === '') return;
    setModal(null);
    setIsLoading(true);
    const result = await onLogin(salesperson.trim());
    if (!result.success) {
      setModal({ title: "Erreur", message: result.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 text-center">
      {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
      <LogInIcon className="mx-auto h-12 w-12 text-slate-400" />
      <h2 className="text-3xl font-bold text-slate-800">Identification</h2>
      <p className="text-slate-500">Veuillez entrer votre nom pour continuer.</p>
      <input 
        value={salesperson} 
        onChange={(e) => setSalesperson(e.target.value)} 
        placeholder="Prénom Nom" 
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center" 
      />
      <button 
        onClick={handleAttemptLogin} 
        disabled={isLoading || !salesperson.trim() || !isFirebaseReady} 
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {!isFirebaseReady ? 'Connexion...' : (isLoading ? 'Vérification...' : 'Accéder à mon espace')}
      </button>
    </div>
  );
};

const CustomerInfo = ({ data, setData, nextStep, prevStep }) => {
  const handleChange = (e) => setData({ ...data, client: { ...data.client, [e.target.name]: e.target.value } });
  const isFormValid = () => data.client.nom && data.client.prenom && data.client.email && data.client.telephone;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Informations du Client</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="nom" className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
                <input id="nom" name="nom" value={data.client.nom} onChange={handleChange} placeholder="Dupont" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
                <input id="prenom" name="prenom" value={data.client.prenom} onChange={handleChange} placeholder="Jean" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
        </div>
        <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-slate-600 mb-1">Adresse</label>
            <input id="adresse" name="adresse" value={data.client.adresse} onChange={handleChange} placeholder="123 Rue de l'Exemple, 75001 Paris" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                <input id="telephone" type="tel" name="telephone" value={data.client.telephone} onChange={handleChange} placeholder="06 12 34 56 78" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input id="email" type="email" name="email" value={data.client.email} onChange={handleChange} placeholder="jean.dupont@email.com" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
        <button onClick={nextStep} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300">Suivant</button>
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
      <h2 className="text-2xl font-bold text-slate-800">Type de Client</h2>
      <p className="text-slate-500">S'agit-il d'un particulier ou d'un professionnel ?</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <div onClick={() => setType('residentiel')} className="flex flex-col items-center justify-center p-8 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 w-full sm:w-56 h-48 cursor-pointer">
          <UserIcon className="h-10 w-10 text-slate-500" />
          <span className="mt-4 text-lg font-semibold text-slate-700">Résidentiel</span>
        </div>
        <div onClick={() => setType('professionnel')} className="flex flex-col items-center justify-center p-8 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 w-full sm:w-56 h-48 cursor-pointer">
          <BuildingIcon className="h-10 w-10 text-slate-500" />
          <span className="mt-4 text-lg font-semibold text-slate-700">Professionnel</span>
        </div>
      </div>
      <div className="pt-4">
        <button onClick={prevStep} className="w-full sm:w-auto sm:px-8 bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
      </div>
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
      <h2 className="text-2xl font-bold text-slate-800 text-center">Choisissez votre offre</h2>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch pt-4">
        {Object.entries(config.offers).map(([key, offer]) => {
          const priceInfo = offer[data.type] || offer.residentiel || { price: 0, mensualite: 0 };
          return (
            <div key={key} onClick={() => selectOffer(key)} className="flex flex-col p-6 border-2 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full cursor-pointer">
              <h3 className="text-xl font-bold text-blue-600">{offer.name}</h3>
              <p className="text-sm text-slate-600 mt-2 flex-grow">{offer.description}</p>
              <div className="mt-4">
                  <p className="text-3xl font-light text-slate-800">{priceInfo.price} €</p>
                  <p className="text-lg font-semibold text-slate-700 mt-1">+ {priceInfo.mensualite} €/mois</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
      </div>
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 text-center">Ajouter des packs supplémentaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {Object.entries(config.packs).map(([key, pack]) => {
            const priceInfo = pack[data.type] || pack.residentiel || { price: 0, mensualite: 0 };
            return (
                <div key={key} onClick={() => addPack(key)} className="p-4 border-2 rounded-xl text-center transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer">
                    <h3 className="text-lg font-bold text-slate-800">{pack.name}</h3>
                    <p className="text-md font-light mt-1">{priceInfo.price} €</p>
                    <p className="text-sm font-semibold text-slate-600">+ {priceInfo.mensualite} €/mois</p>
                    <span className="mt-3 inline-block bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1 rounded-full">Ajouter</span>
                </div>
            )
            })}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Packs sélectionnés</h3>
        {data.packs.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed rounded-xl">
            <p className="text-slate-500">Aucun pack sélectionné.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.packs.map((pack) => {
              const packInfo = config.packs[pack.key];
              return (
                <div key={pack.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg text-slate-700">{packInfo.name}</h4>
                    <button onClick={() => removePack(pack.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                  </div>
                  <textarea value={pack.details} onChange={(e) => handleDetailChange(pack.id, e.target.value)} placeholder="Détaillez les éléments inclus..." className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" rows="2"></textarea>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Suivant</button>
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
      <h2 className="text-2xl font-bold text-slate-800 text-center">Éléments supplémentaires</h2>
      <div className="space-y-3">
        {config.extraItems.map(item => (
          <label key={item.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={data.extraItems.includes(item.id)} onChange={() => toggleItem(item.id)} className="h-5 w-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"/>
            <span className="ml-4 text-slate-700">{item.name}</span>
            <span className="ml-auto font-semibold">{item.price} €</span>
          </label>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Suivant</button>
      </div>
    </div>
  );
};

const Summary = ({ data, nextStep, prevStep, config, calculation, appliedDiscounts, setAppliedDiscounts }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [modal, setModal] = useState(null);

  const applyDiscount = () => {
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
        setModal({title: "Erreur", message: "Code de réduction invalide ou inactif."});
      }
  };

  const removeDiscount = (discountId) => {
    setAppliedDiscounts(prev => prev.filter(d => d.id !== discountId));
  };

  return (
    <div className="space-y-6">
      {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
      <h2 className="text-2xl font-bold text-slate-800 text-center">Résumé du devis</h2>
      <div id="summary-content">
        <QuoteForPDF data={data} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} removeDiscount={removeDiscount} />
      </div>
        <div className="space-y-4">
            <div className="flex gap-2">
                <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Code de réduction" className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
                <button onClick={applyDiscount} className="bg-slate-800 text-white px-6 rounded-lg font-semibold hover:bg-black transition-colors">Appliquer</button>
            </div>
        </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
        <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Valider et choisir la date</button>
      </div>
    </div>
  );
};

const QuoteForPDF = ({ data, config, calculation, appliedDiscounts, removeDiscount }) => (
  <>
    <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
      <h3 className="font-bold text-lg mb-4">Client</h3>
      <p>{data.client.prenom} {data.client.nom}</p>
      <p>{data.client.adresse}</p>
      <p>{data.client.telephone} | {data.client.email}</p>
      <p className="capitalize mt-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">{data.type}</p>
    </div>
    <div className="p-4 sm:p-6 mt-4 bg-white rounded-xl border border-slate-200 space-y-2">
      <h3 className="font-bold text-lg mb-4 text-blue-700">Paiement unique</h3>
      {data.offer && (
        <div>
            <div className="flex justify-between">
                <span>{config.offers[data.offer].name}</span>
                <span>{calculation.offerPrice.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-slate-500 italic pl-4">{config.offers[data.offer].description}</p>
        </div>
      )}
      {data.packs.length > 0 && <p className="font-semibold pt-2">Packs supplémentaires :</p>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? (<div key={packInstance.id} className="pl-4"><div className="flex justify-between"><span>{packInfo.name}</span><span>{packInfo[data.type]?.price.toFixed(2) || '0.00'} €</span></div>{packInstance.details && <p className="text-xs text-slate-500 italic whitespace-pre-wrap ml-2"> - {packInstance.details}</p>}</div>) : null;
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
      <hr className="my-2 border-t-2 border-slate-300"/><div className="flex justify-between font-bold text-2xl text-slate-800"><span>TOTAL À PAYER</span><span>{calculation.oneTimeTotal.toFixed(2)} €</span></div>
    </div>
     <div className="p-4 sm:p-6 mt-4 bg-white rounded-xl border border-slate-200 space-y-2">
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
      <hr className="my-2 border-t-2 border-slate-300"/><div className="flex justify-between font-bold text-2xl text-slate-800"><span>TOTAL MENSUEL</span><span>{calculation.monthlyTotal.toFixed(2)} €</span></div>
    </div>
  </>
);

const InstallationDate = ({ data, setData, nextStep, prevStep, onSend }) => {
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'accepted') setData(prev => ({...prev, followUpDate: null}));
    if (newStatus === 'thinking') setData(prev => ({...prev, installationDate: null}));
  };

  const formatDateForGoogle = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '');
    return `${formatDate(date)}/${formatDate(nextDay)}`;
  };

  const handleSend = async () => {
    setIsSending(true);
    await onSend();
    if (data.installationDate || data.followUpDate) {
        const eventDate = data.installationDate || data.followUpDate;
        const title = data.installationDate ? `Installation - ${data.client.prenom} ${data.client.nom}` : `Relance - ${data.client.prenom} ${data.client.nom}`;
        const details = `Client: ${data.client.prenom} ${data.client.nom}\nTéléphone: ${data.client.telephone}\nEmail: ${data.client.email}\nAdresse: ${data.client.adresse}`;
        const formattedDate = formatDateForGoogle(eventDate);
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(data.client.adresse)}`;
        window.open(calendarUrl, '_blank');
    }
    setIsSending(false);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Installation et Envoi</h2>
      <div className="p-6 bg-slate-50 rounded-xl border space-y-4">
        <label className="flex items-center cursor-pointer">
          <input type="radio" name="status" checked={status === 'accepted'} onChange={() => handleStatusChange('accepted')} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
          <span className="ml-3 text-slate-700">Le client a accepté le devis.</span>
        </label>
        {status === 'accepted' && (
          <div className="pl-7 mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d'installation</label>
            <input type="date" value={data.installationDate || ''} onChange={(e) => setData(prev => ({ ...prev, installationDate: e.target.value }))} className="p-3 border border-slate-300 rounded-lg w-full"/>
          </div>
        )}
        <label className="flex items-center cursor-pointer">
          <input type="radio" name="status" checked={status === 'thinking'} onChange={() => handleStatusChange('thinking')} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
          <span className="ml-3 text-slate-700">Le client souhaite réfléchir.</span>
        </label>
        {status === 'thinking' && (
          <div className="pl-7 mt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de relance</label>
            <input type="date" value={data.followUpDate || ''} onChange={(e) => setData(prev => ({ ...prev, followUpDate: e.target.value }))} className="p-3 border border-slate-300 rounded-lg w-full"/>
          </div>
        )}
      </div>
       <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
        <button onClick={handleSend} disabled={isSending} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-400">
            {isSending ? 'Envoi en cours...' : 'Valider et envoyer au client'}
        </button>
      </div>
    </div>
  );
};

const Confirmation = ({ reset, title, message }) => (
    <div className="text-center space-y-6">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-600">{message}</p>
        <button onClick={reset} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Nouveau Document</button>
    </div>
);

const AppointmentList = ({ salesperson, onNavigate, onSelectAppointment, appointments, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmé': return 'bg-green-100 text-green-800';
      case 'en attente': return 'bg-yellow-100 text-yellow-800';
      case 'relance': return 'bg-blue-100 text-blue-800';
      case 'pas vendu': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredAppointments = appointments.filter(app =>
    app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.phone && app.phone.includes(searchTerm))
  );

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-slate-800">Mes rendez-vous</h1>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 bg-slate-200 text-slate-800 py-2 px-4 rounded-lg font-semibold hover:bg-slate-300 transition-colors self-start">
             <ArrowLeftIcon /> Retour
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Rechercher un prospect par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border border-slate-300 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-500"
          />
          {filteredAppointments.length === 0 ? (
            <div className="text-center text-slate-500 py-8 border-2 border-dashed rounded-xl">
              <p>{appointments.length > 0 ? "Aucun rendez-vous ne correspond à votre recherche." : "Aucun rendez-vous pour le moment."}</p>
            </div>
          ) : (
            filteredAppointments.map(app => (
              <div key={app.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div onClick={() => onSelectAppointment(app)} className="cursor-pointer flex-grow">
                  <p className="font-bold text-lg text-slate-800">{app.clientName}</p>
                  <p className="text-sm text-slate-500">Le {new Date(app.date).toLocaleDateString()} {app.time ? `à ${app.time}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(app.status)}`}>{app.status}</span>
                  <select value={app.status} onChange={(e) => onUpdateStatus(app.docId, e.target.value)} onClick={(e) => e.stopPropagation()} className="p-1 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500">
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
    <div className="w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-4">
          <ArrowLeftIcon /> Tous les rendez-vous
        </button>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-slate-800">{appointment.clientName}</h2>
          <p className="text-slate-600 mt-2">Date : {new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} {appointment.time ? `à ${appointment.time}` : ''}</p>
          <p className="mt-1">Adresse : {appointment.address}</p>
          <p className="mt-1">Téléphone : {appointment.phone}</p>
          <p className="mt-1">Statut : <span className="font-semibold">{appointment.status}</span></p>
          <hr className="my-6" />
          <button onClick={() => onStartQuote(clientDataForQuote)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Créer un devis pour ce client
          </button>
        </div>
    </div>
  );
};

const NewAppointment = ({ salesperson, onBack, onAppointmentCreated, db, appId }) => {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [modal, setModal] = useState(null);

  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = 'VOTRE_CLE_API_GOOGLE_MAPS';
    if (GOOGLE_MAPS_API_KEY === 'VOTRE_CLE_API_GOOGLE_MAPS') {
        console.warn("L'autocomplete d'adresse est désactivé. Veuillez insérer une clé API Google Maps.");
        return;
    }
    const scriptId = 'google-maps-script';
    const initAutocomplete = () => {
      if (window.google && addressInputRef.current && !autocompleteRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          { types: ['address'], componentRestrictions: { country: 'fr' } }
        );
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) setAddress(place.formatted_address);
        });
        autocompleteRef.current = autocomplete;
      }
    };
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
        initAutocomplete();
    }
  }, []);

  const formatDateTimeForGoogle = (dateString, timeString) => {
    if (!dateString || !timeString) return '';
    const startDate = new Date(`${dateString}T${timeString}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const toGoogleString = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `${toGoogleString(startDate)}/${toGoogleString(endDate)}`;
  };

  const handleSave = async () => {
    const newAppointmentData = { salesperson, clientName, date, time, address, phone, status: 'en attente', createdAt: serverTimestamp() };
    const success = await onAppointmentCreated(newAppointmentData);
    if(success) {
        const title = `Rendez-vous - ${clientName}`;
        const details = `Prospect: ${clientName}\nTéléphone: ${phone}\nCommercial: ${salesperson}`;
        const formattedDateTime = formatDateTimeForGoogle(date, time);
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDateTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(address)}`;
        window.open(calendarUrl, '_blank');
    } else {
        setModal({title: "Erreur", message: "Impossible de sauvegarder le rendez-vous."});
    }
  };

  const isFormValid = () => clientName && date && time && address && phone;

  return (
    <div className="w-full">
        {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-4">
            <ArrowLeftIcon /> Accueil
        </button>
        <div className="space-y-6 mt-4">
            <h2 className="text-2xl font-bold text-slate-800">Créer un nouveau rendez-vous</h2>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du prospect</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jean Dupont" className="w-full p-3 border border-slate-300 rounded-lg"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date du rendez-vous</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Heure</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse du rendez-vous</label>
                <input 
                ref={addressInputRef}
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="123 Rue de l'Exemple, 75001 Paris" 
                className="w-full p-3 border border-slate-300 rounded-lg"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone du prospect</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" className="w-full p-3 border border-slate-300 rounded-lg"/>
            </div>
            <button onClick={handleSave} disabled={!isFormValid()} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300">
                Enregistrer le rendez-vous
            </button>
        </div>
    </div>
  );
};

const PresentationMode = ({ onBack, videos }) => {
    const getEmbedUrl = (url) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'drive.google.com') {
                return url.replace('/view', '/preview');
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Présentation Client</h1>
                <button onClick={onBack} className="flex items-center gap-2 bg-slate-200 text-slate-800 py-2 px-4 rounded-lg font-semibold hover:bg-slate-300">
                    <ArrowLeftIcon /> Retour
                </button>
            </div>
            {videos.length > 0 ? (
                <div className="space-y-8">
                    {videos.map(video => (
                        <div key={video.id}>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">{video.title}</h2>
                            <div className="aspect-w-16 aspect-h-9 bg-slate-200 rounded-xl overflow-hidden">
                                <iframe
                                    src={getEmbedUrl(video.url)}
                                    allow="autoplay"
                                    className="w-full h-full"
                                    frameBorder="0"
                                ></iframe>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-slate-500">Aucune vidéo de présentation n'a été configurée.</p>
                </div>
            )}
        </div>
    );
};

// --- NOUVEAUX COMPOSANTS POUR LE RAPPORT SANITAIRE ---

const SanitaryReportProcess = ({ salesperson, onBackToHome, db, appId, onSend, config }) => {
    const [step, setStep] = useState(1);
    const [reportData, setReportData] = useState({
        client: { nom: '', prenom: '', adresse: '', telephone: '', email: '' },
        interventionDate: new Date().toISOString().split('T')[0],
        niveauInfestation: 50, // Default to 50%
        consommationProduits: 50, // Default to 50%
        motif: '',
        nuisiblesConstates: [],
        zonesInspectees: [],
        observations: '',
        actionsMenees: [],
        produitsUtilises: [],
        photos: [],
        recommandations: '',
        salesperson: salesperson,
    });
    const [reportConfig, setReportConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!db || !appId) {
                console.error("DB or AppId not available");
                setIsLoading(false);
                return;
            }
            const reportDocPath = `/artifacts/${appId}/public/data/reportConfig/main`;
            const docRef = doc(db, reportDocPath);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReportConfig(docSnap.data());
                } else {
                    console.warn("Report configuration not found, using fallback.");
                    setReportConfig({ nuisibles: [], zones: [], actions: [], produits: [] });
                }
            } catch(e) {
                console.error("Error fetching report config:", e);
                 setReportConfig({ nuisibles: [], zones: [], actions: [], produits: [] });
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, [db, appId]);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleFinalize = async () => {
        setIsSending(true);
        await onSend(reportData, config);
        setIsSending(false);
        nextStep();
    };

    if (isLoading) return <p className="animate-pulse text-center p-8">Chargement de la configuration des rapports...</p>;

    const progress = (step / 5) * 100;
    
    const renderCurrentStep = () => {
         switch(step) {
            case 1: return <ReportStep1_ClientInfo data={reportData} setData={setReportData} nextStep={nextStep} prevStep={onBackToHome} />;
            case 2: return <ReportStep2_Diagnostics data={reportData} setData={setReportData} nextStep={nextStep} prevStep={prevStep} config={reportConfig} />;
            case 3: return <ReportStep3_Photos data={reportData} setData={setReportData} nextStep={nextStep} prevStep={prevStep} />;
            case 4: return <ReportStep4_ActionsAndSummary data={reportData} setData={setReportData} nextStep={nextStep} prevStep={prevStep} config={config} />;
            case 5: return <ReportStep5_Finalize prevStep={prevStep} onFinalize={handleFinalize} isSending={isSending}/>;
            case 6: return <Confirmation reset={onBackToHome} title="Rapport Envoyé !" message="Le rapport sanitaire a été sauvegardé et envoyé au client." />;
            default: return <p>Étape inconnue</p>;
         }
    };
    
    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="flex justify-between mb-1"><span className="text-base font-medium text-blue-700">Progression Rapport</span><span className="text-sm font-medium text-blue-700">Étape {step} sur 5</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
            </div>
            {renderCurrentStep()}
        </div>
    );
};

const ReportStep1_ClientInfo = ({ data, setData, nextStep, prevStep }) => {
    // On réutilise le composant existant pour les informations client
    return <CustomerInfo data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} />;
};

const ReportStep2_Diagnostics = ({ data, setData, nextStep, prevStep, config }) => {
    
    const handleCheckboxChange = (field, value) => {
        const currentValues = data[field] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        setData(prev => ({ ...prev, [field]: newValues }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Diagnostic de l'Intervention</h2>
            
            <div>
                <label htmlFor="interventionDate" className="block text-sm font-medium text-slate-700 mb-1">Date d'intervention</label>
                <input id="interventionDate" type="date" value={data.interventionDate} onChange={e => setData(prev => ({ ...prev, interventionDate: e.target.value }))} className="p-3 border border-slate-300 rounded-lg w-full"/>
            </div>

            <div>
                <label className="font-semibold text-slate-700">Nuisibles constatés</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {config?.nuisibles?.map(item => (
                        <label key={item} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={data.nuisiblesConstates.includes(item)} onChange={() => handleCheckboxChange('nuisiblesConstates', item)} className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"/>
                            <span className="ml-3 text-sm">{item}</span>
                        </label>
                    )) || <p className="text-xs text-slate-500">Aucune option configurée.</p>}
                </div>
            </div>

             <div>
                <label className="font-semibold text-slate-700">Zones inspectées</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {config?.zones?.map(item => (
                        <label key={item} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={data.zonesInspectees.includes(item)} onChange={() => handleCheckboxChange('zonesInspectees', item)} className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"/>
                            <span className="ml-3 text-sm">{item}</span>
                        </label>
                    )) || <p className="text-xs text-slate-500">Aucune option configurée.</p>}
                </div>
            </div>
            
            <div>
                <label htmlFor="infestationLevel" className="block font-medium text-slate-700 mb-2">Niveau d'infestation ({data.niveauInfestation}%)</label>
                <input id="infestationLevel" type="range" min="0" max="100" step="5" value={data.niveauInfestation} onChange={e => setData(prev => ({ ...prev, niveauInfestation: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Observations générales</label>
                 <textarea value={data.observations} onChange={e => setData(prev => ({...prev, observations: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Ex: Traces de passage le long des murs, déjections fraîches trouvées sous l'évier..."></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
                <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Suivant</button>
            </div>
        </div>
    );
};

const ReportStep3_Photos = ({ data, setData, nextStep, prevStep }) => {
    
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (upload) => {
                const newPhoto = {
                    id: `photo_${Date.now()}_${Math.random()}`,
                    dataUrl: upload.target.result,
                    caption: ''
                };
                setData(prev => ({...prev, photos: [...prev.photos, newPhoto]}));
            };
            reader.readAsDataURL(file);
        });
    };
    
    const updateCaption = (id, caption) => {
        setData(prev => ({
            ...prev,
            photos: prev.photos.map(p => p.id === id ? {...p, caption} : p)
        }));
    };

    const removePhoto = (id) => {
        setData(prev => ({...prev, photos: prev.photos.filter(p => p.id !== id)}));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Ajouter des Photos</h2>
            
            <div className="p-6 border-2 border-dashed rounded-xl text-center">
                <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md font-semibold text-sm text-slate-700 hover:bg-slate-50">
                    <CameraIcon className="h-5 w-5"/>
                    Importer depuis l'appareil
                </label>
                <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                <p className="text-xs text-slate-500 mt-2">Vous pouvez sélectionner plusieurs photos.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.photos.map(photo => (
                    <div key={photo.id} className="border rounded-lg p-2 space-y-2">
                        <img src={photo.dataUrl} alt="Aperçu" className="rounded-md w-full h-auto max-h-48 object-cover"/>
                        <input 
                            type="text"
                            value={photo.caption}
                            onChange={(e) => updateCaption(photo.id, e.target.value)}
                            placeholder="Ajouter une légende..."
                            className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={() => removePhoto(photo.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
                <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Suivant</button>
            </div>
        </div>
    );
};

const ReportStep4_ActionsAndSummary = ({ data, setData, nextStep, prevStep, config }) => {
    
    const handleCheckboxChange = (field, value) => {
        const currentValues = data[field] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        setData(prev => ({ ...prev, [field]: newValues }));
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Actions et Recommandations</h2>

            <div>
                <label className="font-semibold text-slate-700">Actions menées</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {config?.actions?.map(item => (
                        <label key={item} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={data.actionsMenees.includes(item)} onChange={() => handleCheckboxChange('actionsMenees', item)} className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"/>
                            <span className="ml-3 text-sm">{item}</span>
                        </label>
                    )) || <p className="text-xs text-slate-500">Aucune option configurée.</p>}
                </div>
            </div>

            <div>
                <label className="font-semibold text-slate-700">Produits utilisés</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {config?.produits?.map(item => (
                        <label key={item} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={data.produitsUtilises.includes(item)} onChange={() => handleCheckboxChange('produitsUtilises', item)} className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"/>
                            <span className="ml-3 text-sm">{item}</span>
                        </label>
                    )) || <p className="text-xs text-slate-500">Aucune option configurée.</p>}
                </div>
            </div>

             <div>
                <label htmlFor="productConsumption" className="block font-medium text-slate-700 mb-2">Consommation des produits ({data.consommationProduits}%)</label>
                <input id="productConsumption" type="range" min="0" max="100" step="5" value={data.consommationProduits} onChange={e => setData(prev => ({ ...prev, consommationProduits: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Recommandations pour le client</label>
                 <textarea value={data.recommandations} onChange={e => setData(prev => ({...prev, recommandations: e.target.value}))} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Ex: Boucher les points d'entrée sous l'évier, ne pas laisser de nourriture accessible..."></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors">Précédent</button>
                <button onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Finaliser</button>
            </div>
        </div>
    );
};

const ReportStep5_Finalize = ({ onFinalize, prevStep, isSending }) => (
     <div className="text-center space-y-6">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-blue-500" />
        <h2 className="text-2xl font-bold text-slate-800">Prêt à finaliser ?</h2>
        <p className="text-slate-600">Le rapport va être sauvegardé et envoyé par email au client.</p>
        <div className="flex flex-col sm:flex-row-reverse gap-4 mt-8">
            <button onClick={onFinalize} disabled={isSending} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-400">
                {isSending ? 'Envoi en cours...' : 'Sauvegarder et Envoyer'}
            </button>
            <button onClick={prevStep} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300">Précédent</button>
        </div>
    </div>
);

const HomeScreen = ({ salesperson, onNavigate, onStartQuote }) => {
    
    const ActionCard = ({ onClick, icon, title }) => (
         <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer group flex flex-col justify-center items-center aspect-square">
            <div className="bg-slate-100 p-4 rounded-full inline-block group-hover:bg-blue-100 transition-colors duration-300">
                {icon}
            </div>
            <p className="mt-4 font-semibold text-slate-700">{title}</p>
        </div>
    );

    return (
        <div className="w-full text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Bienvenue, {salesperson}</h1>
            <p className="text-slate-500 mt-2 mb-10">Que souhaitez-vous faire aujourd'hui ?</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard onClick={() => onNavigate('appointmentList')} icon={<CalendarIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Mes rendez-vous" />
                <ActionCard onClick={() => onNavigate('newAppointment')} icon={<CalendarIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Créer un rendez-vous" />
                <ActionCard onClick={() => onStartQuote()} icon={<FileTextIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Nouveau Devis" />
                <ActionCard onClick={() => onNavigate('presentation')} icon={<VideoIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Mode Présentation" />
                <ActionCard onClick={() => onNavigate('contract')} icon={<ContractIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Générer Contrat" />
                {/* NOUVELLE CARTE D'ACTION */}
                <ActionCard onClick={() => onNavigate('sanitaryReport')} icon={<ClipboardIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Rapport Sanitaire" />
            </div>
        </div>
    )
}

const QuoteProcess = ({ data, setData, onBackToHome, onSend }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const dbRef = useRef(null);
  const appIdRef = useRef(null);

  const calculation = useMemo(() => {
    if (!config || !data.type) return { oneTimeTotal: 0, monthlyTotal: 0, totalWithInstall: 0, vatAmount: 0 };
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
            setError("Impossible de charger la configuration.");
        } finally {
            setIsLoading(false);
        }
    };
    initFirebase();
  }, []);

  const nextStep = () => setData(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setData(prev => ({ ...prev, step: prev.step - 1 }));
  
  const handleSend = async () => {
      await onSend({ ...data, calculation, appliedDiscounts }, config);
  };

  const renderStep = () => {
    switch (data.step) {
      case 1: return <CustomerInfo data={data} setData={setData} nextStep={nextStep} prevStep={onBackToHome} />;
      case 2: return <CustomerType setData={setData} nextStep={nextStep} prevStep={prevStep} />;
      case 3: return <MainOffer data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 4: return <AddonPacks data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 5: return <ExtraItems data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} config={config} />;
      case 6: return <Summary data={data} nextStep={nextStep} prevStep={prevStep} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} setAppliedDiscounts={setAppliedDiscounts} />;
      case 7: return <InstallationDate data={data} setData={setData} nextStep={nextStep} prevStep={prevStep} onSend={handleSend} />;
      case 8: return <Confirmation reset={onBackToHome} title="Devis Envoyé !" message="Le devis a été sauvegardé et envoyé au client." />;
      default: return <CustomerInfo data={data} setData={setData} nextStep={nextStep} prevStep={onBackToHome} />;
    }
  };

  if (isLoading) return <p className="animate-pulse text-center p-8">Chargement de la configuration...</p>;
  if (error || !config) return <div className="bg-red-100 p-4 rounded-lg"><p className="text-red-700 text-center"><b>Erreur:</b> {error || "Config introuvable."}</p></div>;

  const progress = (data.step / 8) * 100;

  return (
    <div className="w-full">
        <div className="mb-6">
            <div className="flex justify-between mb-1"><span className="text-base font-medium text-blue-700">Progression</span><span className="text-sm font-medium text-blue-700">Étape {data.step} sur 8</span></div>
            <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
        </div>
        <div>{renderStep()}</div>
    </div>
  );
}

const ContractGenerator = ({ onBack }) => {
    const handleOpenLink = (url) => {
        window.open(url, '_blank');
    };

    const contractUrls = {
        prestation: 'https://yousign.app/workflows/forms/159cde75-baab-4631-84df-a92a646f2c6c',
        sanitaireOptions: [
            { name: 'Special', url: 'https://yousign.app/workflows/forms/da6b9dfb-0a3f-4b7f-b12e-91a81c43b4ef'},
            { name: 'Standard', url: 'https://yousign.app/workflows/forms/fc9ce226-2a21-4767-8aa1-fff3a836637a'},
            { name: 'Premium', url: 'https://yousign.app/workflows/forms/790fd387-eda7-4215-a0a2-4b9eac883a42'}
        ],
        maintenanceAlarme: 'https://yousign.app/workflows/forms/418760b5-3c2f-4c26-bf48-eeb7b32b03c1'
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Générer un Contrat</h1>
                <button onClick={onBack} className="flex items-center gap-2 bg-slate-200 text-slate-800 py-2 px-4 rounded-lg font-semibold hover:bg-slate-300 transition-colors">
                    <ArrowLeftIcon /> Retour
                </button>
            </div>

            <div className="space-y-8 mt-6">
                {/* Option 1 : Contrat Sanisecurité */}
                <div className="text-center space-y-4 p-6 border rounded-xl">
                    <ContractIcon className="mx-auto h-12 w-12 text-blue-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Contrat Sanisecurité</h2>
                    <p className="text-slate-600">
                        Ouvrir le formulaire pour un contrat de prestation de services standard.
                    </p>
                    <button 
                        onClick={() => handleOpenLink(contractUrls.prestation)} 
                        className="w-full sm:w-auto px-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Ouvrir Contrat Sanisecurité
                    </button>
                </div>

                {/* Option 2 : Contrat Sanitaire */}
                <div className="text-center space-y-4 p-6 border rounded-xl">
                    <ContractIcon className="mx-auto h-12 w-12 text-teal-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Contrat Sanitaire</h2>
                    <p className="text-slate-600">
                        Choisir le type de contrat sanitaire à générer.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {contractUrls.sanitaireOptions.map(option => (
                             <button 
                                key={option.name}
                                onClick={() => handleOpenLink(option.url)} 
                                className="w-full sm:w-auto px-6 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                            >
                                Ouvrir Contrat {option.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Option 3 : Contrat Maintenance Alarme */}
                <div className="text-center space-y-4 p-6 border rounded-xl">
                    <ContractIcon className="mx-auto h-12 w-12 text-green-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Contrat de Maintenance Alarme</h2>
                    <p className="text-slate-600">
                        contrat de maintenance alarme videosurveillance
                    </p>
                    <button 
                        onClick={() => handleOpenLink(contractUrls.maintenanceAlarme)} 
                        className="w-full sm:w-auto px-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        Ouvrir Contrat Maintenance Alarme
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [salesperson, setSalesperson] = useState('');
  const [quoteData, setQuoteData] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [modal, setModal] = useState(null);
  const firebaseRef = useRef(null);
  const configRef = useRef(null);

  // --- NOUVELLE FONCTION D'ENVOI CENTRALISÉE ---

  const sendDocumentByEmail = async (documentData, configData, documentType) => {
    try {
        // Sauvegarder le document sur Firestore d'abord
        const collectionName = documentType === 'devis' ? 'devis' : 'sanitaryReports';
        const docPath = `/artifacts/${firebaseRef.current.appId}/public/data/${collectionName}`;
        await addDoc(collection(firebaseRef.current.db, docPath), { ...documentData, createdAt: serverTimestamp() });
        
        // Préparer les données pour la fonction Vercel
        const payload = {
            documentData,
            configData,
            documentType,
        };

        const response = await fetch('/api/send-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || "L'API a retourné une erreur");
        }
        
        return { success: true };

    } catch (error) {
        console.error(`Erreur lors de la création ou l'envoi du ${documentType}:`, error);
        // Logique de secours : le document a été sauvegardé, mais l'email a échoué.
        setModal({
            title: `Erreur d'envoi`,
            message: `L'envoi de l'email a échoué. Le ${documentType} a été sauvegardé, mais pas envoyé.`
        });
        return { success: false };
    }
  };


  useEffect(() => {
    const init = async () => {
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
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const auth = getAuth(app);
            const appId = firebaseConfig.appId;
            setLogLevel('debug');
            await signInAnonymously(auth);
            firebaseRef.current = { db, auth, appId };

            // Charger et stocker la configuration globale une seule fois
            const docPath = `/artifacts/${appId}/public/data/config/main`;
            const configDocRef = doc(db, docPath);
            const docSnap = await getDoc(configDocRef);
            if (docSnap.exists()) {
                configRef.current = docSnap.data();
            } else {
                configRef.current = initialConfigData;
            }

            setIsFirebaseReady(true);
        } catch(e) {
            console.error("Firebase init failed", e);
            setModal({title: "Erreur critique", message: "Impossible d'initialiser la connexion à la base de données. Veuillez rafraîchir la page."});
        }
    }
    init();
  }, []);

  useEffect(() => {
    if (!salesperson || !firebaseRef.current) return;
    const { db, appId } = firebaseRef.current;
    
    const appointmentsPath = `/artifacts/${appId}/public/data/appointments`;
    const qAppointments = query(collection(db, appointmentsPath), where("salesperson", "==", salesperson));
    const unsubscribeAppointments = onSnapshot(qAppointments, (querySnapshot) => {
      const appointmentsList = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      appointmentsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAppointments(appointmentsList);
    }, (error) => console.error("Erreur de lecture des RDV: ", error));

    const videosPath = `/artifacts/${appId}/public/data/presentationVideos`;
    const qVideos = query(collection(db, videosPath));
    const unsubscribeVideos = onSnapshot(qVideos, (querySnapshot) => {
        const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videoList);
    }, (error) => console.error("Erreur de lecture des vidéos: ", error));

    return () => {
        unsubscribeAppointments();
        unsubscribeVideos();
    };
  }, [salesperson]);

  const addAppointment = async (newAppointment) => {
    if (!firebaseRef.current) return false;
    const { db, appId } = firebaseRef.current;
    const appointmentsPath = `/artifacts/${appId}/public/data/appointments`;
    try {
      await addDoc(collection(db, appointmentsPath), newAppointment);
      return true;
    } catch (error) {
      console.error("Erreur d'ajout du RDV: ", error);
      return false;
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
      setModal({title: "Erreur", message: "Impossible de mettre à jour le statut."});
    }
  };

  const handleLogin = async (name) => {
    if (!firebaseRef.current) {
        return { success: false, message: "La connexion à la base de données n'est pas encore établie. Veuillez patienter." };
    }
    const { db, appId } = firebaseRef.current;
    const salespersonsPath = `/artifacts/${appId}/public/data/salespersons`;
    const q = query(collection(db, salespersonsPath), where("name", "==", name));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            setSalesperson(name);
            setCurrentView('home');
            return { success: true };
        } else {
            return { success: false, message: 'Commercial non reconnu. Veuillez vérifier le nom.' };
        }
    } catch (error) {
        console.error("Erreur de vérification du commercial:", error);
        return { success: false, message: "Une erreur est survenue lors de la vérification." };
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

  const renderCurrentView = () => {
    switch(currentView) {
        case 'login': return <SalespersonLogin onLogin={handleLogin} isFirebaseReady={isFirebaseReady} />;
        case 'home': return <HomeScreen salesperson={salesperson} onNavigate={setCurrentView} onStartQuote={startNewQuote} />;
        case 'quote': return <QuoteProcess data={quoteData} setData={setQuoteData} onBackToHome={handleBackToHome} onSend={(data, config) => sendDocumentByEmail(data, config, 'devis')} />;
        case 'appointmentList': return <AppointmentList appointments={appointments} salesperson={salesperson} onNavigate={setCurrentView} onSelectAppointment={viewAppointment} onUpdateStatus={updateAppointmentStatus} />;
        case 'appointmentDetail': return <AppointmentDetail appointment={selectedAppointment} onBack={() => setCurrentView('appointmentList')} onStartQuote={startNewQuote} />;
        case 'newAppointment':
            return <NewAppointment 
                salesperson={salesperson} 
                onBack={() => setCurrentView('home')} 
                onAppointmentCreated={async (newApp) => {
                    const success = await addAppointment(newApp);
                    if (success) setCurrentView('appointmentList');
                    return success;
                }} 
            />;
        case 'presentation': return <PresentationMode onBack={() => setCurrentView('home')} videos={videos} />;
        case 'contract': return <ContractGenerator onBack={() => setCurrentView('home')} />;
        case 'sanitaryReport': return <SanitaryReportProcess salesperson={salesperson} onBackToHome={handleBackToHome} db={firebaseRef.current?.db} appId={firebaseRef.current?.appId} onSend={(data, config) => sendDocumentByEmail(data, config, 'rapport')} config={configRef.current} />;
        default: return <div>Vue non reconnue</div>;
    }
  }
  
  return (
    <main className="bg-slate-50 min-h-screen font-sans p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
            {renderCurrentView()}
        </div>
    </main>
  );
}

