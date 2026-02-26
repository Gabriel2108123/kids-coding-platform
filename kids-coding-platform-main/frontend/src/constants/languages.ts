/**
 * Language configuration for Bugsby Coding World
 * Supporting multiple languages for international accessibility
 */

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Text strings for different languages
export const translations = {
  en: {
    // App name
    appName: 'Bugsby Coding World',
    appTagline: 'Learn • Build • Create',
    
    // Login page
    welcomeBack: 'Welcome back! Let\'s start coding!',
    signInParent: 'I\'m a Parent',
    signInChild: 'I\'m a Kid',
    emailAddress: 'Email Address',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In',
    newToPlatform: 'New to Bugsby Coding World?',
    dontHaveAccount: 'Don\'t have an account yet?',
    createAccount: 'Create Account',
    
    // Dashboard
    familyDashboard: 'Family\'s Dashboard',
    loadingDashboard: 'Loading your family dashboard...',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    
    // Time limits
    timeLimit: 'Time Limit',
    minutes: 'minutes',
    daily: 'daily',
  },
  es: {
    // App name
    appName: 'Mundo de Programación Bugsby',
    appTagline: 'Aprende • Construye • Crea',
    
    // Login page
    welcomeBack: '¡Bienvenido de vuelta! ¡Empecemos a programar!',
    signInParent: 'Soy un Padre',
    signInChild: 'Soy un Niño',
    emailAddress: 'Dirección de Correo',
    username: 'Nombre de Usuario',
    password: 'Contraseña',
    signIn: 'Iniciar Sesión',
    newToPlatform: '¿Nuevo en Mundo de Programación Bugsby?',
    dontHaveAccount: '¿Aún no tienes una cuenta?',
    createAccount: 'Crear Cuenta',
    
    // Dashboard
    familyDashboard: 'Panel de la Familia',
    loadingDashboard: 'Cargando el panel de tu familia...',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    
    // Time limits
    timeLimit: 'Límite de Tiempo',
    minutes: 'minutos',
    daily: 'diario',
  },
  fr: {
    // App name
    appName: 'Monde de Programmation Bugsby',
    appTagline: 'Apprendre • Construire • Créer',
    
    // Login page
    welcomeBack: 'Content de vous revoir ! Commençons à coder !',
    signInParent: 'Je suis un Parent',
    signInChild: 'Je suis un Enfant',
    emailAddress: 'Adresse Email',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    newToPlatform: 'Nouveau sur Monde de Programmation Bugsby?',
    dontHaveAccount: 'Vous n\'avez pas encore de compte?',
    createAccount: 'Créer un Compte',
    
    // Dashboard
    familyDashboard: 'Tableau de Bord de la Famille',
    loadingDashboard: 'Chargement de votre tableau de bord familial...',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    edit: 'Modifier',
    delete: 'Supprimer',
    
    // Time limits
    timeLimit: 'Limite de Temps',
    minutes: 'minutes',
    daily: 'quotidien',
  },
  de: {
    // App name
    appName: 'Bugsby Programmierwelt',
    appTagline: 'Lernen • Bauen • Erschaffen',
    
    // Login page
    welcomeBack: 'Willkommen zurück! Lass uns programmieren!',
    signInParent: 'Ich bin ein Elternteil',
    signInChild: 'Ich bin ein Kind',
    emailAddress: 'E-Mail-Adresse',
    username: 'Benutzername',
    password: 'Passwort',
    signIn: 'Anmelden',
    newToPlatform: 'Neu bei Bugsby Programmierwelt?',
    dontHaveAccount: 'Noch kein Konto?',
    createAccount: 'Konto Erstellen',
    
    // Dashboard
    familyDashboard: 'Familien-Dashboard',
    loadingDashboard: 'Lade dein Familien-Dashboard...',
    
    // Common
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    save: 'Speichern',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    
    // Time limits
    timeLimit: 'Zeitlimit',
    minutes: 'Minuten',
    daily: 'täglich',
  },
  pt: {
    // App name
    appName: 'Mundo de Programação Bugsby',
    appTagline: 'Aprender • Construir • Criar',
    
    // Login page
    welcomeBack: 'Bem-vindo de volta! Vamos começar a programar!',
    signInParent: 'Sou um Pai/Mãe',
    signInChild: 'Sou uma Criança',
    emailAddress: 'Endereço de Email',
    username: 'Nome de Usuário',
    password: 'Senha',
    signIn: 'Entrar',
    newToPlatform: 'Novo no Mundo de Programação Bugsby?',
    dontHaveAccount: 'Ainda não tem uma conta?',
    createAccount: 'Criar Conta',
    
    // Dashboard
    familyDashboard: 'Painel da Família',
    loadingDashboard: 'Carregando o painel da sua família...',
    
    // Common
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Deletar',
    
    // Time limits
    timeLimit: 'Limite de Tempo',
    minutes: 'minutos',
    daily: 'diário',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
