/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useMemo, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, updateDoc, serverTimestamp, setLogLevel, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// La librairie d'optimisation sera chargée dynamiquement

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
const PlusCircleIcon = ({ className="h-6 w-6" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;


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

// --- Composants Modaux et Formulaires (peuvent rester en haut) ---
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
  // --- L'adresse est maintenant obligatoire ---
  const isFormValid = () => data.client.nom && data.client.prenom && data.client.email && data.client.telephone && data.client.adresse;

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

// Composant des étapes de devis
const QuoteProcess = ({ data, setData, onBackToHome, onSend }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const dbRef = useRef(null);
  const appIdRef = useRef(null);

  const calculation = useMemo(() => {
    if (!config || !data.type) return { oneTimeTotal: 0, monthlyTotal: 0, totalWithInstall: 0, vatAmount: 0, offerPrice: 0, oneTimeSubtotal: 0, oneTimeDiscountAmount: 0, monthlySubtotal: 0, monthlyDiscountAmount: 0, installationFee: 0 };
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
      case 8: return <Confirmation reset={onBackToHome} title="Email Préparé !" message="Le PDF a été téléchargé et votre application de messagerie est ouverte." />;
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

// Composant du générateur de contrats (était utilisé après App, remonté ici)
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

// Composant du processus de rapport sanitaire (était utilisé après App, remonté ici)
const SanitaryReportProcess = ({ salesperson, onBackToHome, db, appId, onSend, config, firebaseApp }) => {
    // Composant de traitement du rapport sanitaire - n'est plus utilisé pour naviguer vers le form externe.
    // Il a été retiré, mais je le laisse ici par précaution si vous souhaitiez le réactiver.
    return (
        <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600">Erreur de Configuration</h2>
            <p className="text-slate-600 mt-2">Ce processus interne a été désactivé. Le lien vers le formulaire externe devrait s'ouvrir directement depuis l'accueil.</p>
            <button onClick={onBackToHome} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Retour à l'Accueil</button>
        </div>
    )
};

// Composant de l'écran d'accueil
const HomeScreen = ({ salesperson, onNavigate, onStartQuote, onOpenSanitaryReportForm }) => {
    
    const ActionCard = ({ onClick, icon, title }) => (
         // FIX: Suppression d'aspect-square et ajout de flex-grow et min-h pour un alignement vertical parfait
         <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer group flex flex-col items-center min-h-[180px]">
            <div className="bg-slate-100 p-4 rounded-full inline-block group-hover:bg-blue-100 transition-colors duration-300">
                {icon}
            </div>
            <div className="mt-4 font-semibold text-slate-700 flex-grow flex items-center justify-center">{title}</div>
        </div>
    );

    return (
        <div className="w-full text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Bienvenue, {salesperson}</h1>
            <p className="text-slate-500 mt-2 mb-10">Que souhaitez-vous faire aujourd'hui ?</p>
            
            {/* FIX: Ajout de items-stretch pour que toutes les cartes aient la même hauteur */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                <ActionCard onClick={() => onNavigate('appointmentList')} icon={<CalendarIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Mes rendez-vous" />
                <ActionCard onClick={() => onNavigate('newAppointment')} icon={<PlusCircleIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Créer un rendez-vous" />
                <ActionCard onClick={() => onStartQuote()} icon={<FileTextIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Nouveau Devis" />
                <ActionCard onClick={() => onNavigate('presentation')} icon={<VideoIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Mode Présentation" />
                <ActionCard onClick={() => onNavigate('contract')} icon={<ContractIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Générer Contrat" />
                {/* Utilisation de la prop pour le lien externe */}
                <ActionCard onClick={onOpenSanitaryReportForm} icon={<ClipboardIcon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />} title="Rapport Sanitaire (Lien Externe)" />
            </div>
        </div>
    )
}

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
  const scriptsLoaded = useRef(false);

  // 1. NOUVELLE CONSTANTE POUR L'URL DU FORMULAIRE
  const SANITARY_REPORT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdykBNm7ZrVcaU4sbCS4dxk8vySpKtfwk6cJ_t5zxg1HVkZyA/viewform?usp=dialog";

  // --- MODIFICATION : Charge les scripts pour la génération de PDF ---
  const loadPdfScripts = () => {
      if (scriptsLoaded.current) return Promise.resolve();

      const scripts = [
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      ];
      
      const loadScript = (src) => new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
              return resolve();
          }
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
      });

      return Promise.all(scripts.map(loadScript)).then(() => {
          scriptsLoaded.current = true;
      });
  };

  const prepareDocumentForEmail = async (documentData, configData, documentType) => {
    try {
        // Vérification de l'initialisation Firebase avant utilisation
        if (!firebaseRef.current || !firebaseRef.current.db || !firebaseRef.current.appId) {
            console.error("Firebase non initialisé pour la sauvegarde.");
            throw new Error("Database non disponible.");
        }
        
        await addDoc(collection(firebaseRef.current.db, `/artifacts/${firebaseRef.current.appId}/public/data/${documentType === 'devis' ? 'devis' : 'sanitaryReports'}`), { ...documentData, createdAt: serverTimestamp() });

        await loadPdfScripts(); 
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;
        
        const elementId = documentType === 'devis' ? 'summary-content' : 'report-content';
        const input = document.getElementById(elementId);
        if (!input) throw new Error(`L'élément avec l'ID '${elementId}' est introuvable.`);
        
        const canvas = await html2canvas(input, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / pdfWidth;
        const projectedImgHeight = imgHeight / ratio;

        let position = 0;
        let heightLeft = projectedImgHeight;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, projectedImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, projectedImgHeight);
            heightLeft -= pdfHeight;
        }

        const filename = `${documentType}_${documentData.client.nom.replace(/ /g, '_')}.pdf`;
        pdf.save(filename);

        const isQuote = documentType === 'devis';
        const subject = isQuote 
            ? `Votre devis - ${documentData.client.prenom} ${documentData.client.nom}`
            : `Votre rapport d'intervention - ${documentData.client.prenom} ${documentData.client.nom}`;
            
        const body = `Bonjour ${documentData.client.prenom},\n\n` +
                     `Veuillez trouver ci-joint ${isQuote ? 'votre devis personnalisé' : 'le rapport suite à notre intervention'}.\n\n` +
                     `Pour rappel, l'adresse e-mail du client est : ${documentData.client.email}\n\n`+
                     `N'hésitez pas à y joindre des photos si nécessaire.\n\n` +
                     `Cordialement,\n\n` +
                     `${documentData.salesperson}`;
        
        const mailtoLink = `mailto:${documentData.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink, '_self');


    } catch (error) {
        console.error(`Erreur lors de la préparation du ${documentType}:`, error);
        setModal({
            title: `Erreur`,
            message: `Une erreur est survenue lors de la génération du document. Le document a été sauvegardé. Erreur: ${error.message}`
        });
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
            firebaseRef.current = { db, auth, appId, app }; 

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
  
  // 2. NOUVELLE FONCTION POUR OUVRIR LE LIEN EXTERNE
  const handleOpenSanitaryReportForm = () => {
    window.open(SANITARY_REPORT_URL, '_blank');
  };

  const renderCurrentView = () => {
    switch(currentView) {
        case 'login': return <SalespersonLogin onLogin={handleLogin} isFirebaseReady={isFirebaseReady} />;
        // 3. MISE À JOUR: Passage de la fonction de lien direct au composant HomeScreen
        case 'home': return <HomeScreen salesperson={salesperson} onNavigate={setCurrentView} onStartQuote={startNewQuote} onOpenSanitaryReportForm={handleOpenSanitaryReportForm} />;
        case 'quote': return <QuoteProcess data={quoteData} setData={setQuoteData} onBackToHome={handleBackToHome} onSend={(data, config) => prepareDocumentForEmail(data, config, 'devis')} />;
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
        // 4. RETRAIT de la navigation vers le processus interne. On garde la case pour éviter une "Vue non reconnue".
        case 'sanitaryReport': return <SanitaryReportProcess onBackToHome={handleBackToHome} />;
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
