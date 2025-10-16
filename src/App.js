/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useMemo, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, updateDoc, serverTimestamp, setLogLevel, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// La librairie d'optimisation sera chargée dynamiquement

// Configuration des styles : On utilise de meilleures couleurs et des ombres plus profondes
const PRIMARY_COLOR = 'blue-600';
const SECONDARY_COLOR = 'slate-800';
const ACCENT_COLOR = 'teal-500';

// --- Icônes (SVG) ---
const UserIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BuildingIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const CheckCircleIcon = ({ className = "h-16 w-16 text-green-500" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const TrashIcon = ({ className = "h-4 w-4" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const XCircleIcon = ({ className = "h-4 w-4" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const LogInIcon = ({ className = "h-12 w-12 text-slate-400" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>;
const FileTextIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const CalendarIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ArrowLeftIcon = ({ className="h-5 w-5" }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const VideoIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const ContractIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m16 14-4-4-4 4"></path><path d="M12 10v9"></path></svg>;
const ClipboardIcon = ({ className = "h-8 w-8 text-slate-600" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const PlusCircleIcon = ({ className="h-6 w-6" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;

// FIX: Utilisation de React.forwardRef pour permettre le passage de la ref
const FormInput = React.forwardRef((props, ref) => (
    <input
        {...props}
        ref={ref} // Passage de la ref à l'élément natif
        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition shadow-inner"
    />
));

const FormTextarea = (props) => (
    <textarea
        {...props}
        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition shadow-inner text-sm"
    />
);
const FormSelect = (props) => (
    <select
        {...props}
        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition shadow-inner"
    />
);


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
  extraItems: [
    { id: 'camera', name: 'Caméra de surveillance HD', price: 150 },
    { id: 'detecteur', name: 'Détecteur de fumée connecté', price: 80 },
  ],
  discounts: [
    { id: 'D1', code: 'PROMO10', type: 'materiel', value: 100, active: true },
    { id: 'D2', code: 'INSTALLOFFERTE', type: 'installation_offerte', value: 350, active: true },
    { id: 'D3', code: 'MOISGRATUIT', type: 'abonnement', value: 30, active: true },
  ],
  settings: { installationFee: 350, vat: { residentiel: 0.10, professionnel: 0.20 } }
};

// --- Composants ---
const Modal = ({ title, message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
            <h3 className="text-xl font-extrabold text-slate-800">{title}</h3>
            <p className="text-slate-600 mt-3 mb-6">{message}</p>
            <button onClick={onClose} className={`w-full bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md`}>Fermer</button>
        </div>
      </div>
);

const SalespersonLogin = ({ onLogin, isFirebaseReady }) => {
  const [salesperson, setSalesperson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const handleAttemptLogin = async () => {
    if (!salesperson || salesperson.trim() === '') {
        setModal({ title: "Saisie requise", message: "Veuillez entrer votre nom." });
        return;
    }
    setModal(null);
    setIsLoading(true);
    const result = await onLogin(salesperson.trim());
    if (!result.success) {
      setModal({ title: "Erreur d'Identification", message: result.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 text-center p-8 bg-slate-50 rounded-2xl shadow-lg">
      {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
      <LogInIcon className={`mx-auto h-16 w-16 text-${PRIMARY_COLOR}`} />
      <h2 className="text-4xl font-extrabold text-slate-900">Espace Commercial</h2>
      <p className="text-slate-600">Veuillez entrer votre nom pour accéder aux outils de vente.</p>
      <FormInput
        value={salesperson} 
        onChange={(e) => setSalesperson(e.target.value)} 
        placeholder="Votre Prénom Nom" 
        onKeyDown={(e) => { if (e.key === 'Enter' && salesperson.trim() && isFirebaseReady && !isLoading) handleAttemptLogin(); }}
        className="text-center text-lg placeholder:text-slate-400" 
      />
      <button 
        onClick={handleAttemptLogin} 
        disabled={isLoading || !salesperson.trim() || !isFirebaseReady} 
        className={`w-full bg-${PRIMARY_COLOR} text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-slate-300 disabled:text-slate-500 shadow-lg hover:shadow-xl`}
      >
        {!isFirebaseReady ? 'Connexion en cours...' : (isLoading ? 'Vérification...' : 'Accéder à l\'espace')}
      </button>
    </div>
  );
};

const CustomerInfo = ({ data, setData, nextStep, prevStep }) => {
  const handleChange = (e) => setData({ ...data, client: { ...data.client, [e.target.name]: e.target.value } });
  const isFormValid = () => data.client.nom && data.client.prenom && data.client.email && data.client.telephone && data.client.adresse;

  return (
    <div className="space-y-8">
      <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR} text-center`}>Informations du Client</h2>
      <div className="space-y-5 p-6 bg-white rounded-2xl shadow-md border border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
                <label htmlFor="nom" className="block text-sm font-semibold text-slate-700 mb-2">Nom *</label>
                <FormInput id="nom" name="nom" value={data.client.nom} onChange={handleChange} placeholder="Dupont" />
            </div>
            <div>
                <label htmlFor="prenom" className="block text-sm font-semibold text-slate-700 mb-2">Prénom *</label>
                <FormInput id="prenom" name="prenom" value={data.client.prenom} onChange={handleChange} placeholder="Jean" />
            </div>
        </div>
        <div>
            <label htmlFor="adresse" className="block text-sm font-semibold text-slate-700 mb-2">Adresse *</label>
            <FormInput id="adresse" name="adresse" value={data.client.adresse} onChange={handleChange} placeholder="123 Rue de l'Exemple, 75001 Paris" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
                <label htmlFor="telephone" className="block text-sm font-semibold text-slate-700 mb-2">Téléphone *</label>
                <FormInput id="telephone" type="tel" name="telephone" value={data.client.telephone} onChange={handleChange} placeholder="06 12 34 56 78" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <FormInput id="email" type="email" name="email" value={data.client.email} onChange={handleChange} placeholder="jean.dupont@email.com" />
            </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Retour
        </button>
        <button onClick={nextStep} disabled={!isFormValid()} className={`w-full bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors duration-300 disabled:bg-slate-300 disabled:text-slate-500 shadow-lg`}>
            Passer à l'étape suivante
        </button>
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
    <div className="space-y-8 text-center">
      <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR}`}>Type de Client</h2>
      <p className="text-slate-600">Sélectionnez le statut du client pour appliquer la bonne tarification (TVA, etc.).</p>
      <div className="flex flex-col md:flex-row gap-6 justify-center pt-4">
        <div onClick={() => setType('residentiel')} className={`flex flex-col items-center justify-center p-8 border-4 border-transparent rounded-2xl hover:border-${PRIMARY_COLOR} hover:bg-blue-50 transition-all duration-300 w-full md:w-64 h-56 cursor-pointer shadow-lg hover:shadow-blue-300/50 bg-white`}>
          <UserIcon className={`h-12 w-12 text-${PRIMARY_COLOR}`} />
          <span className="mt-4 text-xl font-extrabold text-slate-800">Particulier</span>
          <span className="text-sm text-slate-500 mt-1">Tarif Résidentiel (TVA 10%)</span>
        </div>
        <div onClick={() => setType('professionnel')} className={`flex flex-col items-center justify-center p-8 border-4 border-transparent rounded-2xl hover:border-${PRIMARY_COLOR} hover:bg-blue-50 transition-all duration-300 w-full md:w-64 h-56 cursor-pointer shadow-lg hover:shadow-blue-300/50 bg-white`}>
          <BuildingIcon className={`h-12 w-12 text-${PRIMARY_COLOR}`} />
          <span className="mt-4 text-xl font-extrabold text-slate-800">Professionnel</span>
          <span className="text-sm text-slate-500 mt-1">Tarif Commercial (TVA 20%)</span>
        </div>
      </div>
      <div className="pt-6">
        <button onClick={prevStep} className="w-full sm:w-64 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Précédent
        </button>
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
    <div className="space-y-8">
      <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR} text-center`}>Choisissez l'Offre de Base</h2>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch pt-4">
        {Object.entries(config.offers).map(([key, offer]) => {
          const priceInfo = offer[data.type] || { price: 0, mensualite: 0 };
          return (
            <div key={key} onClick={() => selectOffer(key)} className={`flex flex-col p-8 border-4 border-transparent rounded-2xl text-left transition-all duration-300 w-full cursor-pointer bg-white shadow-xl hover:shadow-blue-400/50 transform hover:scale-[1.02] ${data.offer === key ? `border-${PRIMARY_COLOR} bg-blue-50` : 'hover:border-slate-200'}`}>
              <h3 className={`text-2xl font-extrabold text-${PRIMARY_COLOR} mb-2`}>{offer.name}</h3>
              <p className="text-sm text-slate-600 mb-6 flex-grow">{offer.description}</p>
              <div className="mt-auto">
                  <p className={`text-4xl font-black text-slate-900`}>{priceInfo.price.toFixed(2)} €</p>
                  <p className="text-lg font-bold text-slate-700 mt-1">
                        + {priceInfo.mensualite.toFixed(2)} €<span className="text-sm font-normal text-slate-500">/mois</span>
                    </p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="pt-6">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Précédent
        </button>
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
        <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR} text-center`}>Packs d'Extension</h2>
        <p className="text-slate-600 text-center mb-6">Ajoutez les packs optionnels à l'offre de base.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {Object.entries(config.packs).map(([key, pack]) => {
            const priceInfo = pack[data.type] || { price: 0, mensualite: 0 };
            return (
                <div key={key} onClick={() => addPack(key)} className="p-5 border border-slate-200 bg-white rounded-2xl text-center transition-all duration-300 hover:border-green-500 hover:bg-green-50 cursor-pointer shadow-md hover:shadow-lg">
                    <h3 className="text-xl font-extrabold text-slate-800">{pack.name}</h3>
                    <p className="text-lg font-bold mt-1 text-slate-900">{priceInfo.price.toFixed(2)} €</p>
                    <p className="text-sm font-semibold text-slate-600 mb-3">+ {priceInfo.mensualite.toFixed(2)} €/mois</p>
                    <span className={`inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md`}>
                        <PlusCircleIcon className="w-4 h-4"/> Ajouter
                    </span>
                </div>
            )
            })}
        </div>
            </div>

            <div>
                <h3 className={`text-2xl font-bold text-${SECONDARY_COLOR} mb-4`}>Packs sélectionnés ({data.packs.length})</h3>
                {data.packs.length === 0 ? (
                    <div className="text-center py-8 border-4 border-dashed rounded-2xl border-slate-200 bg-slate-50">
                        <p className="text-slate-500 font-medium">Aucun pack sélectionné pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.packs.map((pack) => {
                            const packInfo = config.packs[pack.key];
                            return (
                                <div key={pack.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className={`font-extrabold text-lg text-${PRIMARY_COLOR}`}>{packInfo.name}</h4>
                                        <button onClick={() => removePack(pack.id)} className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-50" title="Supprimer le pack"><TrashIcon /></button>
                                    </div>
                                    <FormTextarea value={pack.details} onChange={(e) => handleDetailChange(pack.id, e.target.value)} placeholder="Détaillez les éléments inclus (ex: 5 détecteurs, 2 sirènes...)" rows="2"/>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Précédent
        </button>
        <button onClick={nextStep} className={`w-full bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg`}>
            Passer aux options supplémentaires
        </button>
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
    <div className="space-y-8">
      <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR} text-center`}>Options & Équipements Supp.</h2>
      <div className="space-y-4 p-6 bg-white rounded-2xl shadow-md border border-slate-100">
        {config.extraItems.map(item => (
          <label key={item.id} className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors shadow-sm">
            <input type="checkbox" checked={data.extraItems.includes(item.id)} onChange={() => toggleItem(item.id)} className={`h-6 w-6 rounded text-${PRIMARY_COLOR} border-slate-300 focus:ring-blue-500 focus:ring-offset-2`} />
            <span className="ml-4 text-lg font-medium text-slate-700">{item.name}</span>
            <span className="ml-auto font-extrabold text-lg text-slate-900">{item.price.toFixed(2)} €</span>
          </label>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Précédent
        </button>
        <button onClick={nextStep} className={`w-full bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg`}>
            Passer au résumé et devis
        </button>
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
          // Logique pour éviter les doublons ou conflits (simple : on autorise un seul type de chaque)
          const newDiscounts = appliedDiscounts.filter(d => d.type !== discount.type);
          setAppliedDiscounts([...newDiscounts, discount]);
          setDiscountCode('');
          setModal({title: "Succès", message: `Le code ${code} a été appliqué.`});
      } else {
        setModal({title: "Erreur", message: "Code de réduction invalide ou inactif."});
      }
  };

  const removeDiscount = (discountId) => {
    setAppliedDiscounts(prev => prev.filter(d => d.id !== discountId));
  };

  return (
    <div className="space-y-8">
      {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
      <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR} text-center`}>Résumé et Devis Client</h2>
      <div id="summary-content" className="p-2">
        <QuoteForPDF data={data} config={config} calculation={calculation} appliedDiscounts={appliedDiscounts} removeDiscount={removeDiscount} />
      </div>
        <div className="space-y-4 p-6 bg-slate-50 rounded-2xl shadow-inner border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">Appliquer une Réduction</h3>
            <div className="flex gap-3">
                <FormInput type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="CODEPROMO" className="uppercase"/>
                <button onClick={applyDiscount} disabled={!discountCode.trim()} className={`bg-${ACCENT_COLOR} text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-md disabled:bg-slate-300`}>Appliquer</button>
            </div>
        </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Précédent
        </button>
        <button onClick={nextStep} className={`w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg`}>
            Valider et planifier l'Installation
        </button>
      </div>
    </div>
  );
};

const QuoteForPDF = ({ data, config, calculation, appliedDiscounts, removeDiscount }) => (
  <div className="space-y-6">
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
      <h3 className={`font-extrabold text-xl mb-4 text-${SECONDARY_COLOR}`}>Client</h3>
      <p className="font-semibold text-lg">{data.client.prenom} {data.client.nom}</p>
      <p className="text-slate-600 mt-1">{data.client.adresse}</p>
      <p className="text-slate-600">{data.client.telephone} | {data.client.email}</p>
      <p className={`capitalize mt-3 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block font-bold shadow-sm`}>{data.type}</p>
    </div>
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-lg space-y-4">
      <h3 className={`font-extrabold text-xl mb-4 text-${PRIMARY_COLOR}`}>Paiement Unique (Matériel & Installation)</h3>
      {data.offer && (
        <div className="border-l-4 border-blue-200 pl-4 py-1">
            <div className="flex justify-between font-semibold">
                <span className="text-slate-700">{config.offers[data.offer].name}</span>
                <span className="text-slate-900">{calculation.offerPrice.toFixed(2)} €</span>
            </div>
            <p className="text-xs text-slate-500 italic">{config.offers[data.offer].description}</p>
        </div>
      )}
      {data.packs.length > 0 && <p className="font-bold pt-3 text-slate-700 border-t pt-4">Packs supplémentaires :</p>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? (<div key={packInstance.id} className="pl-4"><div className="flex justify-between text-sm"><span>{packInfo.name}</span><span>{packInfo[data.type]?.price.toFixed(2) || '0.00'} €</span></div>{packInstance.details && <p className="text-xs text-slate-500 italic whitespace-pre-wrap ml-2"> - {packInstance.details}</p>}</div>) : null;
      })}
      {data.extraItems.length > 0 && <p className="font-bold pt-3 text-slate-700 border-t pt-4">Éléments supplémentaires :</p>}
      {data.extraItems.map(id => {
        const item = config.extraItems.find(i => i.id === id);
        return item ? <div key={id} className="flex justify-between pl-4 text-sm"><span>{item.name}</span><span>{item.price.toFixed(2)} €</span></div> : null;
      })}
      <div className="border-t border-slate-300 pt-3 flex justify-between font-bold text-base"><span>Sous-total Matériel</span><span>{calculation.oneTimeSubtotal.toFixed(2)} €</span></div>
      {appliedDiscounts.map(discount => {
        if (discount.type === 'materiel' || discount.type === 'prix_fixe') {
            return ( <div key={discount.id} className="flex justify-between items-center text-green-600 text-sm italic"> <div className="flex items-center gap-2"> <span>Réduction ({discount.code})</span> <button onClick={() => removeDiscount(discount.id)} className="text-red-500 hover:text-red-700 p-1"><XCircleIcon /></button> </div> <span>- {calculation.oneTimeDiscountAmount.toFixed(2)} €</span> </div> )
        }
        return null;
      })}
      <div className="flex justify-between font-semibold"><span>Frais d'installation</span><span>{config.settings.installationFee.toFixed(2)} €</span></div>
      {appliedDiscounts.map(discount => {
        if (discount.type === 'installation_offerte') {
            return ( <div key={discount.id} className="flex justify-between items-center text-green-600 text-sm italic"> <div className="flex items-center gap-2"> <span>Installation Offerte ({discount.code})</span> <button onClick={() => removeDiscount(discount.id)} className="text-red-500 hover:text-red-700 p-1"><XCircleIcon /></button> </div> <span>- {config.settings.installationFee.toFixed(2)} €</span> </div> )
        }
        return null;
      })}
      <div className="flex justify-between font-bold border-t border-slate-300 pt-3"><span>Total HT</span><span>{calculation.totalWithInstall.toFixed(2)} €</span></div>
      <div className="flex justify-between text-sm text-slate-600"><span>TVA ({(config.settings.vat[data.type] * 100)}%)</span><span>{calculation.vatAmount.toFixed(2)} €</span></div>
      <div className="flex justify-between font-black text-3xl pt-3 border-t-2 border-slate-700 text-slate-900"><span>TOTAL À PAYER</span><span>{calculation.oneTimeTotal.toFixed(2)} €</span></div>
    </div>
     <div className="p-6 mt-6 bg-white rounded-2xl border border-slate-200 shadow-lg space-y-4">
      <h3 className={`font-extrabold text-xl mb-4 text-${ACCENT_COLOR}`}>Abonnement Mensuel</h3> {/* FIX: Ajout de la balise de fermeture </h3> */}
      {data.offer && <div className="flex justify-between font-medium"><span>Abonnement {config.offers[data.offer].name}</span><span>{config.offers[data.offer][data.type]?.mensualite.toFixed(2) || '0.00'} €</span></div>}
      {data.packs.map(packInstance => {
          const packInfo = config.packs[packInstance.key];
          return packInfo ? <div key={packInstance.id} className="flex justify-between pl-4 text-sm text-slate-600"><span>Abonnement {packInfo.name}</span><span>{packInfo[data.type]?.mensualite.toFixed(2) || '0.00'} €</span></div> : null;
      })}
      <div className="border-t border-slate-300 pt-3 flex justify-between font-bold text-base"><span>Sous-total mensuel</span><span>{calculation.monthlySubtotal.toFixed(2)} €</span></div>
      {appliedDiscounts.map(discount => {
        if (discount.type === 'abonnement') {
            return ( <div key={discount.id} className="flex justify-between items-center text-green-600 text-sm italic"> <div className="flex items-center gap-2"> <span>Réduction Abonnement ({discount.code})</span> <button onClick={() => removeDiscount(discount.id)} className="text-red-500 hover:text-red-700 p-1"><XCircleIcon /></button> </div> <span>- {calculation.monthlyDiscountAmount.toFixed(2)} €</span> </div> )
        }
        return null;
      })}
      <div className="flex justify-between font-black text-3xl pt-3 border-t-2 border-slate-700 text-slate-900"><span>TOTAL MENSUEL</span><span>{calculation.monthlyTotal.toFixed(2)} €</span></div>
    </div>
  </div>
);

const InstallationDate = ({ data, setData, nextStep, prevStep, onSend }) => {
  const [status, setStatus] = useState(data.installationDate ? 'accepted' : (data.followUpDate ? 'thinking' : ''));
  const [isSending, setIsSending] = useState(false);
  
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'accepted') {
        setData(prev => ({...prev, followUpDate: null}));
    } else if (newStatus === 'thinking') {
        setData(prev => ({...prev, installationDate: null}));
    } else {
        setData(prev => ({...prev, installationDate: null, followUpDate: null}));
    }
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
    <div className="space-y-8">
      <h2 className={`text-3xl font-extrabold text-${SECONDARY_COLOR} text-center`}>Planification et Envoi</h2>
      <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 space-y-5">
        <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${status === 'accepted' ? `bg-green-50 border-green-400 shadow-md` : 'hover:bg-slate-50 border-slate-200'}`}>
          <input type="radio" name="status" checked={status === 'accepted'} onChange={() => handleStatusChange('accepted')} className={`mt-1 h-5 w-5 text-green-600 focus:ring-green-500`}/>
          <div className="ml-4 flex-1">
                <span className="font-bold text-slate-800">Devis Accepté</span>
                {status === 'accepted' && (
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date d'installation</label>
                        <FormInput type="date" value={data.installationDate || ''} onChange={(e) => setData(prev => ({ ...prev, installationDate: e.target.value }))} />
                    </div>
                )}
            </div>
        </label>
        <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${status === 'thinking' ? `bg-blue-50 border-blue-400 shadow-md` : 'hover:bg-slate-50 border-slate-200'}`}>
          <input type="radio" name="status" checked={status === 'thinking'} onChange={() => handleStatusChange('thinking')} className={`mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500`}/>
          <div className="ml-4 flex-1">
                <span className="font-bold text-slate-800">En Attente de Décision</span>
                {status === 'thinking' && (
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date de relance</label>
                        <FormInput type="date" value={data.followUpDate || ''} onChange={(e) => setData(prev => ({ ...prev, followUpDate: e.target.value }))} />
                    </div>
                )}
            </div>
        </label>
      </div>
       <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={prevStep} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors shadow-md">
            <ArrowLeftIcon className="inline-block mr-2" /> Précédent
        </button>
        <button onClick={handleSend} disabled={isSending || (status === 'accepted' && !data.installationDate) || (status === 'thinking' && !data.followUpDate)} className={`w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-500 shadow-lg`}>
            {isSending ? 'Préparation...' : "Sauvegarder & Préparer l'Email"}
        </button>
      </div>
    </div>
  );
};

const Confirmation = ({ reset, title, message }) => (
    <div className="text-center space-y-6 p-8 bg-green-50 rounded-2xl shadow-xl border border-green-200">
        <CheckCircleIcon className="mx-auto h-20 w-20 text-green-600" />
        <h2 className="text-3xl font-extrabold text-slate-800">{title}</h2>
        <p className="text-slate-600 text-lg">{message}</p>
        <button onClick={reset} className={`w-full bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg mt-6`}>Démarrer un Nouveau Document</button>
        </div>
);

const AppointmentCard = ({ app, onSelectAppointment, onUpdateStatus, getStatusClass }) => (
    <div onClick={() => onSelectAppointment(app)} className="p-5 border border-slate-200 bg-white rounded-2xl hover:bg-blue-50 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer shadow-md">
        <div className="flex-grow">
            <p className="font-extrabold text-xl text-slate-800">{app.clientName}</p>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 inline-block text-slate-400" />
                Le {new Date(app.date).toLocaleDateString()} {app.time ? `à ${app.time}` : ''}
            </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className={`px-4 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusClass(app.status)}`}>{app.status}</span>
            <FormSelect value={app.status} onChange={(e) => { e.stopPropagation(); onUpdateStatus(app.docId, e.target.value); }} onClick={(e) => e.stopPropagation()} className="p-2 text-sm bg-white shadow-inner">
                <option value="en attente">En attente</option>
                <option value="relance">Relance</option>
                <option value="pas vendu">Pas vendu</option>
                <option value="confirmé">Confirmé</option>
            </FormSelect>
        </div>
    </div>
);

const AppointmentList = ({ salesperson, onNavigate, onSelectAppointment, appointments, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmé': return 'bg-green-500 text-white';
      case 'en attente': return 'bg-yellow-400 text-slate-800';
      case 'relance': return 'bg-blue-500 text-white';
      case 'pas vendu': return 'bg-red-500 text-white';
      default: return 'bg-slate-300 text-slate-800';
    }
  };

  const filteredAppointments = appointments.filter(app =>
    app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.phone && app.phone.includes(searchTerm))
  );

  return (
    <div className="w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-200">
          <h1 className={`text-3xl font-extrabold text-${SECONDARY_COLOR}`}>Mes Rendez-vous</h1>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 bg-slate-200 text-slate-700 py-2 px-4 rounded-xl font-bold hover:bg-slate-300 transition-colors self-start shadow-md">
             <ArrowLeftIcon /> Retour à l'accueil
          </button>
        </div>
        <div className="space-y-4">
          <FormInput
            type="text"
            placeholder="Rechercher par client ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-4 w-full text-lg shadow-lg"
          />
          {filteredAppointments.length === 0 ? (
            <div className="text-center text-slate-500 py-12 border-4 border-dashed rounded-2xl bg-slate-50">
              <p className="text-lg font-medium">{appointments.length > 0 ? "Aucun rendez-vous ne correspond à votre recherche." : "Vous n'avez aucun rendez-vous planifié."}</p>
            </div>
          ) : (
            <div className="space-y-4">
                {filteredAppointments.map(app => (
                    <AppointmentCard 
                        key={app.docId} 
                        app={app} 
                        onSelectAppointment={onSelectAppointment} 
                        onUpdateStatus={onUpdateStatus} 
                        getStatusClass={getStatusClass}
                    />
                ))}
            </div>
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
      email: appointment.email || '', 
      telephone: appointment.phone || '',
      adresse: appointment.address || ''
  };

  return (
    <div className="w-full space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 bg-slate-100 p-2 rounded-xl transition">
          <ArrowLeftIcon /> Tous les rendez-vous
        </button>
        <div className="mt-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
          <h2 className={`text-3xl font-extrabold text-${PRIMARY_COLOR}`}>{appointment.clientName}</h2>
          <hr className="my-4 border-slate-200"/>
          <p className="text-lg text-slate-700 font-medium flex items-center gap-3 mt-3">
              <CalendarIcon className="h-6 w-6 text-slate-500" />
              Date : <span className="font-semibold">{new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} {appointment.time ? `à ${appointment.time}` : ''}</span>
          </p>
          <p className="text-lg text-slate-700 font-medium mt-3">Adresse : <span className="font-semibold">{appointment.address}</span></p>
          <p className="text-lg text-slate-700 font-medium mt-3">Téléphone : <span className="font-semibold">{appointment.phone}</span></p>
          <p className="text-lg text-slate-700 font-medium mt-3">Statut : <span className={`font-extrabold ${appointment.status === 'confirmé' ? 'text-green-600' : 'text-yellow-600'} capitalize`}>{appointment.status}</span></p>
          <hr className="my-6 border-slate-200" />
          <button onClick={() => onStartQuote(clientDataForQuote)} className={`w-full bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg`}>
            Démarrer un devis pour ce client
          </button>
        </div>
      </div>
  );
};

const NewAppointment = ({ salesperson, onBack, onAppointmentCreated }) => {
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [modal, setModal] = useState(null);

  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Pas de changement esthétique majeur ici, on utilise FormInput
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
      document.head.appendChild(script);
      script.onload = initAutocomplete;
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
    const newAppointmentData = { salesperson, clientName, date, time, address, phone, email, status: 'en attente', createdAt: serverTimestamp() };
    const success = await onAppointmentCreated(newAppointmentData);
    if(success) {
        const title = `Rendez-vous - ${clientName}`;
        const details = `Prospect: ${clientName}\nTéléphone: ${phone}\nEmail: ${email}\nCommercial: ${salesperson}`;
        const formattedDateTime = formatDateTimeForGoogle(date, time);
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDateTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(address)}`;
        window.open(calendarUrl, '_blank');
    } else {
        setModal({title: "Erreur", message: "Impossible de sauvegarder le rendez-vous."});
    }
  };

  const isFormValid = () => clientName && date && time && address && phone;

  return (
    <div className="w-full space-y-8">
        {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 bg-slate-100 p-2 rounded-xl transition">
            <ArrowLeftIcon /> Retour à l'accueil
        </button>
        <div className="space-y-6 mt-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
            <h2 className={`text-3xl font-extrabold text-${PRIMARY_COLOR}`}>Planifier un Nouveau Rendez-vous</h2>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom du prospect *</label>
                <FormInput value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jean Dupont"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                    <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Heure *</label>
                    <FormInput type="time" value={time} onChange={(e) => setTime(e.target.value)}/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse *</label>
                <FormInput 
                ref={addressInputRef}
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="123 Rue de l'Exemple, 75001 Paris" 
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Numéro de téléphone *</label>
                <FormInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78"/>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Optionnel)</label>
                <FormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email.prospect@exemple.fr"/>
            </div>
            <button onClick={handleSave} disabled={!isFormValid()} className={`w-full bg-${ACCENT_COLOR} text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg disabled:bg-slate-300`}>
                Enregistrer le rendez-vous & Ajouter au Calendrier
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
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <h1 className={`text-3xl font-extrabold text-${SECONDARY_COLOR}`}>Mode Présentation Client</h1>
                <button onClick={onBack} className="flex items-center gap-2 bg-slate-200 text-slate-700 py-2 px-4 rounded-xl font-bold hover:bg-slate-300 shadow-md">
                    <ArrowLeftIcon /> Retour
                </button>
            </div>
            {videos.length > 0 ? (
                <div className="space-y-8 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
                    {videos.map(video => (
                        <div key={video.id} className="pb-4 border-b border-slate-100 last:border-b-0">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">{video.title}</h2>
                            <div className="relative pt-[56.25%] rounded-xl overflow-hidden shadow-xl">
                                <iframe
                                    title={video.title}
                                    src={getEmbedUrl(video.url)}
                                    allow="autoplay; encrypted-media"
                                    className="absolute top-0 left-0 w-full h-full"
                                    frameBorder="0"
                                ></iframe>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-4 border-dashed rounded-2xl bg-slate-50">
                    <p className="text-slate-500 font-medium text-lg">Aucune vidéo de présentation n'a été configurée.</p>
                </div>
            )}
        </div>
    );
};

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
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <h1 className={`text-3xl font-extrabold text-${SECONDARY_COLOR}`}>Générer un Contrat (YouSign)</h1>
                <button onClick={onBack} className="flex items-center gap-2 bg-slate-200 text-slate-700 py-2 px-4 rounded-xl font-bold hover:bg-slate-300 shadow-md">
                    <ArrowLeftIcon /> Retour
                </button>
            </div>

            <div className="space-y-6 mt-6">
                {/* Option 1 : Contrat Sanisecurité */}
                <div className="text-center space-y-4 p-8 border border-slate-200 bg-white rounded-2xl shadow-xl">
                    <ContractIcon className={`mx-auto h-12 w-12 text-${PRIMARY_COLOR}`} />
                    <h2 className="text-2xl font-bold text-slate-800">Contrat Sanisecurité</h2>
                    <p className="text-slate-600">Ouvrir le formulaire pour un contrat de prestation de services standard.</p>
                    <button 
                        onClick={() => handleOpenLink(contractUrls.prestation)} 
                        className={`w-full sm:w-auto px-8 bg-${PRIMARY_COLOR} text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg`}
                    >
                        Ouvrir Contrat Sanisecurité
                    </button>
                </div>

                {/* Option 2 : Contrat Sanitaire */}
                <div className="text-center space-y-4 p-8 border border-slate-200 bg-white rounded-2xl shadow-xl">
                    <ContractIcon className={`mx-auto h-12 w-12 text-${ACCENT_COLOR}`} />
                    <h2 className="text-2xl font-bold text-slate-800">Contrat Sanitaire (Dératisation, etc.)</h2>
                    <p className="text-slate-600">Choisir le type de contrat sanitaire à générer.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {contractUrls.sanitaireOptions.map(option => (
                             <button 
                                key={option.name}
                                onClick={() => handleOpenLink(option.url)} 
                                className={`w-full px-6 bg-${ACCENT_COLOR} text-white py-2 rounded-xl font-bold hover:bg-teal-600 transition shadow-md text-sm sm:text-base`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Option 3 : Contrat Maintenance Alarme */}
                <div className="text-center space-y-4 p-8 border border-slate-200 bg-white rounded-2xl shadow-xl">
                    <ContractIcon className="mx-auto h-12 w-12 text-green-500" />
                    <h2 className="text-2xl font-bold text-slate-800">Contrat de Maintenance Alarme</h2>
                    <p className="text-slate-600">Maintenance et vidéosurveillance.</p>
                    <button 
                        onClick={() => handleOpenLink(contractUrls.maintenanceAlarme)} 
                        className="w-full sm:w-auto px-8 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
                    >
                        Ouvrir Contrat Maintenance
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomeScreen = ({ salesperson, onNavigate, onStartQuote, onOpenSanitaryReportForm }) => {
    
    const ActionCard = ({ onClick, icon, title, description }) => (
        // FIX 2: Suppression de aspect-square et utilisation de h-full, min-h pour la hauteur
        // et flex-col justify-between pour aligner le contenu même si la hauteur varie.
         <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all duration-300 text-center cursor-pointer group flex flex-col justify-between items-center h-full min-h-[200px] border border-slate-100">
            <div className={`bg-blue-100 p-4 rounded-full inline-block group-hover:bg-${PRIMARY_COLOR} transition-colors duration-300 shadow-md`}>
                {React.cloneElement(icon, { className: `h-8 w-8 text-${PRIMARY_COLOR} group-hover:text-white transition-colors` })}
            </div>
            <div className='flex flex-col flex-grow justify-center py-2'>
                <p className="mt-4 font-extrabold text-lg text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full text-center space-y-8">
            <h1 className={`text-4xl font-black text-${SECONDARY_COLOR}`}>Bienvenue, {salesperson} !</h1>
            <p className="text-slate-600 text-lg">Choisissez une action pour commencer.</p>
            
            {/* FIX 3: Réglage de la grille pour mobile (2 colonnes) et bureau (3 colonnes) avec items-stretch pour l'alignement */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-stretch"> 
                <ActionCard onClick={() => onNavigate('appointmentList')} icon={<CalendarIcon />} title="Mes Rendez-vous" description="Voir le statut de mes prospects" />
                <ActionCard onClick={() => onNavigate('newAppointment')} icon={<PlusCircleIcon />} title="Créer un RDV" description="Planifier une nouvelle visite client" />
                <ActionCard onClick={() => onStartQuote()} icon={<FileTextIcon />} title="Nouveau Devis" description="Démarrer une cotation personnalisée" />
                <ActionCard onClick={() => onNavigate('presentation')} icon={<VideoIcon />} title="Mode Présentation" description="Démarrer la vidéo de vente" />
                <ActionCard onClick={() => onNavigate('contract')} icon={<ContractIcon />} title="Générer Contrat" description="Accéder aux formulaires YouSign" />
                <ActionCard onClick={onOpenSanitaryReportForm} icon={<ClipboardIcon />} title="Rapport Sanitaire" description="Remplir le rapport d'intervention (Lien Externe)" />
            </div>
        </div>
    )
}

const QuoteProcess = ({ data, setData, onBackToHome, onSend }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const firebaseRef = useRef(null);
  const configRef = useRef(null);
  
  // Répétition de l'initialisation Firebase pour que le composant QuoteProcess fonctionne,
  // bien que l'initialisation principale soit dans App.
  // Dans un environnement React réel, ces refs seraient passées via Context.
  useEffect(() => {
    // Si la config globale a déjà été chargée par App, on l'utilise.
    if (window.__global_config_ref && window.__global_config_ref.current) {
        setConfig(window.__global_config_ref.current.config);
        firebaseRef.current = window.__global_config_ref.current.firebase;
        setIsLoading(false);
        return;
    }
    // Sinon, chargement minimal (simulé ici car le chargement réel est dans App)
    setConfig(initialConfigData); 
    setIsLoading(false); 
    // On suppose que firebaseRef.current est mis à jour dans le composant App.
  }, []);

  const calculation = useMemo(() => {
    if (!config || !data.type) return { oneTimeTotal: 0, monthlyTotal: 0, totalWithInstall: 0, vatAmount: 0, offerPrice: 0, oneTimeSubtotal: 0, oneTimeDiscountAmount: 0, monthlySubtotal: 0, monthlyDiscountAmount: 0, installationFee: config?.settings.installationFee || 0 };
    let offerPrice = 0;
    if (data.offer && config.offers[data.offer]) offerPrice = config.offers[data.offer][data.type]?.price || 0;
    const fixedPriceDiscount = appliedDiscounts.find(d => d.type === 'prix_fixe' && d.targetOffer === data.offer);
    if (fixedPriceDiscount) offerPrice = fixedPriceDiscount.value;
    let oneTimeSubtotal = offerPrice;
    data.packs.forEach(p => { if(config.packs[p.key]) oneTimeSubtotal += config.packs[p.key][data.type]?.price || 0; });
    data.extraItems.forEach(id => { const i = config.extraItems.find(it => it.id === id); if (i) oneTimeSubtotal += i.price; });
    const materialDiscount = appliedDiscounts.find(d => d.type === 'materiel');
    let oneTimeDiscountAmount = materialDiscount ? materialDiscount.value : 0;
    const subtotalAfterDiscount = Math.max(0, oneTimeSubtotal - oneTimeDiscountAmount);
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
    const monthlyTotal = Math.max(0, monthlySubtotal - monthlyDiscountAmount);
    return { oneTimeSubtotal, oneTimeDiscountAmount, totalWithInstall, vatAmount, oneTimeTotal, monthlySubtotal, monthlyDiscountAmount, monthlyTotal, offerPrice, installationFee };
  }, [data, data.offer, data.extraItems, appliedDiscounts, config]);

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

  if (isLoading || !config) return <p className="animate-pulse text-center p-8 text-xl font-semibold text-blue-600">Chargement de la configuration des tarifs...</p>;
  if (error) return <div className="bg-red-100 p-4 rounded-xl"><p className="text-red-700 text-center font-semibold"><b>Erreur:</b> {error || "Config introuvable."}</p></div>;

  const progress = (data.step / 8) * 100;

  return (
    <div className="w-full">
        <div className="mb-8 p-4 bg-slate-50 rounded-xl shadow-inner border border-slate-200">
            <div className="flex justify-between mb-2"><span className={`text-base font-extrabold text-${PRIMARY_COLOR}`}>Progression Devis</span><span className="text-sm font-bold text-slate-700">Étape {data.step} sur 8</span></div>
            <div className="w-full bg-slate-200 rounded-full h-3">
                <div className={`bg-${PRIMARY_COLOR} h-3 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
            </div>
            </div>
        <div>{renderStep()}</div>
      </div>
  );
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
  
  // URL DU FORMULAIRE GOOGLE POUR LE RAPPORT SANITAIRE
  const SANITARY_REPORT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdykBNm7ZrVcaU4sbCS4dxk8vySpKtfwk6cJ_t5zxg1HVkZyA/viewform?usp=dialog";

  // Ajout d'une référence globale pour l'accès par d'autres composants (QuoteProcess)
  if (typeof window !== 'undefined') {
    // S'assurer que l'objet est initialisé même si les refs sont nulles initialement
    window.__global_config_ref = { firebase: firebaseRef.current, config: configRef.current };
  }

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
        const { db, appId } = firebaseRef.current;
        await addDoc(collection(db, `/artifacts/${appId}/public/data/${documentType === 'devis' ? 'devis' : 'sanitaryReports'}`), { ...documentData, createdAt: serverTimestamp() });

        await loadPdfScripts(); 
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;
        
        const elementId = documentType === 'devis' ? 'summary-content' : 'report-content';
        const input = document.getElementById(elementId);
        if (!input) throw new Error(`L'élément avec l'ID '${elementId}' est introuvable. Veuillez réessayer.`);
        
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false });
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
                     `Ceci est un email préparé automatiquement, merci d'y joindre le fichier ${filename} qui a été téléchargé, ainsi que toute autre pièce jointe nécessaire (ex: photos).\n\n` +
                     `Cordialement,\n\n` +
                     `${documentData.salesperson}`;
        
        const mailtoLink = `mailto:${documentData.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink, '_self');


    } catch (error) {
        console.error(`Erreur lors de la préparation du ${documentType}:`, error);
        setModal({
            title: `Erreur de Génération`,
            message: `Le document a été sauvegardé mais la génération PDF ou l'ouverture de l'email a échoué. Veuillez contacter le support. Erreur: ${error.message}`
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
            
            // Mise à jour de la référence globale
            window.__global_config_ref = { firebase: firebaseRef.current, config: configRef.current };
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
  
  // Redirige vers le Google Form
  const handleOpenSanitaryReportForm = () => {
    window.open(SANITARY_REPORT_URL, '_blank');
  };

  const renderCurrentView = () => {
    switch(currentView) {
        case 'login': return <SalespersonLogin onLogin={handleLogin} isFirebaseReady={isFirebaseReady} />;
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
        default: return <div>Vue non reconnue</div>;
    }
  }
  
  return (
    <main className="bg-slate-50 min-h-screen font-sans p-4 sm:p-8 md:p-10 antialiased overflow-x-hidden">
        {/* FIX 4: Ajout de overflow-x-hidden au conteneur principal pour éviter le débordement horizontal sur mobile */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 md:p-12 border border-slate-100 min-h-[85vh]">
            {modal && <Modal title={modal.title} message={modal.message} onClose={() => setModal(null)} />}
            {renderCurrentView()}
        </div>
    </main>
  );
}
