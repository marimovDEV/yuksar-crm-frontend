import { createContext } from 'react';
import { AppLanguage } from './translations';

export type I18nContextValue = {
  language: AppLanguage;
  locale: string;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
