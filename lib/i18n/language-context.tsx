"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dictionaries, Locale } from './dictionaries';

type LanguageContextType = {
    locale: Locale;
    t: typeof dictionaries['en'];
    setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    useEffect(() => {
        const savedLocale = localStorage.getItem('finance-app-locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'pt')) {
            setLocale(savedLocale);
        }
    }, []);

    const handleSetLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        localStorage.setItem('finance-app-locale', newLocale);
    };

    const value = {
        locale,
        t: dictionaries[locale],
        setLocale: handleSetLocale,
    };

    return (
        <LanguageContext.Provider value={value}>
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
