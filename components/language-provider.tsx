"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'sw';
  setLanguage: (lang: 'en' | 'sw') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.marketplace': 'Marketplace',
    'nav.how_it_works': 'How it Works',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.get_started': 'Get Started',
    
    // Hero Section
    'hero.badge': '🇰🇪 Kenya\'s Premier Mitumba Marketplace',
    'hero.title': 'Discover Quality Mitumba Fashion',
    'hero.subtitle': 'Connect with trusted traders, find unique pieces, and enjoy seamless delivery across all 47 counties in Kenya. Your sustainable fashion journey starts here.',
    'hero.cta_primary': 'Start Shopping in Kenya',
    'hero.cta_secondary': 'Watch Demo',
    
    // Stats
    'stats.active_traders': 'Active Traders in Kenya',
    'stats.products_listed': 'Products Available',
    'stats.cities_covered': 'Counties Covered',
    'stats.customer_satisfaction': 'Customer Satisfaction',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add_to_cart': 'Add to Cart',
    'common.buy_now': 'Buy Now',
    'common.price': 'Price',
    'common.location': 'Location',
    'common.condition': 'Condition',
    'common.size': 'Size',
    'common.category': 'Category'
  },
  sw: {
    // Navigation
    'nav.marketplace': 'Soko',
    'nav.how_it_works': 'Jinsi Inavyofanya Kazi',
    'nav.about': 'Kuhusu',
    'nav.contact': 'Wasiliana',
    'nav.login': 'Ingia',
    'nav.get_started': 'Anza',
    
    // Hero Section
    'hero.badge': '🇰🇪 Soko Kuu la Mitumba Kenya',
    'hero.title': 'Gundua Mitumba ya Ubora',
    'hero.subtitle': 'Unganisha na wafanyabiashara waaminifu, pata vitu vya kipekee, na furahia uwasilishaji rahisi katika kaunti zote 47 za Kenya. Safari yako ya mitumba inaanza hapa.',
    'hero.cta_primary': 'Anza Ununuzi Kenya',
    'hero.cta_secondary': 'Angalia Onyesho',
    
    // Stats
    'stats.active_traders': 'Wafanyabiashara Hai Kenya',
    'stats.products_listed': 'Bidhaa Zinazopatikana',
    'stats.cities_covered': 'Kaunti Zilizoshughulikiwa',
    'stats.customer_satisfaction': 'Kuridhika kwa Wateja',
    
    // Common
    'common.loading': 'Inapakia...',
    'common.error': 'Kuna tatizo',
    'common.success': 'Imefanikiwa!',
    'common.cancel': 'Ghairi',
    'common.save': 'Hifadhi',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.view': 'Angalia',
    'common.add_to_cart': 'Ongeza Kwenye Kikapu',
    'common.buy_now': 'Nunua Sasa',
    'common.price': 'Bei',
    'common.location': 'Mahali',
    'common.condition': 'Hali',
    'common.size': 'Ukubwa',
    'common.category': 'Aina'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'sw'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('adaze-language') as 'en' | 'sw';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'sw') => {
    setLanguage(lang);
    localStorage.setItem('adaze-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}