import React, {
  useState,
  useDeferredValue,
  useEffect,
  useMemo,
  startTransition
} from 'react';
import {
  AppLanguage,
  getStoredLanguage,
  persistLanguage,
  getLocale,
  translateText
} from './translations';
import {
  translateNode,
  ATTRIBUTE_NAMES
} from './index';
import {
  I18nContext,
  I18nContextValue
} from './context';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => getStoredLanguage());
  const deferredLanguage = useDeferredValue(language);

  useEffect(() => {
    persistLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dataset.appLanguage = language;
  }, [language]);

  useEffect(() => {
    if (deferredLanguage === 'uz') {
      return;
    }

    const root = document.getElementById('root');
    if (!root) {
      return;
    }

    // 1. Initial translation
    translateNode(root, deferredLanguage);

    // 2. Safe MutationObserver that disconnects during DOM writes to avoid infinite feedback loops
    let isMutating = false;

    const observer = new MutationObserver((mutations) => {
      if (isMutating) return;

      try {
        isMutating = true;
        observer.disconnect();

        mutations.forEach((mutation) => {
          if (mutation.type === 'characterData') {
            translateNode(mutation.target, deferredLanguage);
            return;
          }

          if (mutation.type === 'attributes') {
            translateNode(mutation.target, deferredLanguage);
            return;
          }

          mutation.addedNodes.forEach((node) => translateNode(node, deferredLanguage));
        });
      } finally {
        observer.observe(root, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ATTRIBUTE_NAMES,
        });
        isMutating = false;
      }
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTE_NAMES,
    });

    return () => observer.disconnect();
  }, [deferredLanguage]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    locale: getLocale(language),
    setLanguage: (nextLanguage: AppLanguage) => {
      if (nextLanguage === language) {
        return;
      }

      startTransition(() => {
        setLanguageState(nextLanguage);
      });
    },
    toggleLanguage: () => {
      startTransition(() => {
        setLanguageState((current) => current === 'uz' ? 'ru' : 'uz');
      });
    },
    t: (text: string) => translateText(text, language),
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
