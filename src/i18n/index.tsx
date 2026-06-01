import React, {
  startTransition,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  getLocale,
  getStoredLanguage,
  persistLanguage,
  translateText,
} from './translations';
import {
  I18nContext,
  I18nContextValue
} from './context';

type StoredValue = {
  source: string;
  translated: string;
};

export const ATTRIBUTE_NAMES = ['placeholder', 'title', 'aria-label', 'alt'];
const textNodeCache = new WeakMap<Text, StoredValue>();
const elementAttributeCache = new WeakMap<Element, Map<string, StoredValue>>();

function shouldSkipElement(element: Element | null): boolean {
  return Boolean(element?.closest('[data-i18n-skip="true"]'));
}

function canTranslateTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent || shouldSkipElement(parent)) {
    return false;
  }

  const blockedTagNames = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);
  if (blockedTagNames.has(parent.tagName)) {
    return false;
  }

  return Boolean(node.textContent?.trim());
}

function resolveNextValue(current: string, stored: StoredValue | undefined, language: AppLanguage): StoredValue {
  if (!stored) {
    const translated = language === 'ru' ? translateText(current, language) : current;
    return { source: current, translated };
  }

  if (language === 'uz') {
    if (current !== stored.translated) {
      stored.source = current;
    }
    stored.translated = stored.source;
    return stored;
  }

  if (current !== stored.translated) {
    stored.source = current;
  }

  stored.translated = translateText(stored.source, language);
  return stored;
}

function translateTextNode(node: Text, language: AppLanguage) {
  if (!canTranslateTextNode(node)) {
    return;
  }

  const current = node.textContent ?? '';
  const stored = resolveNextValue(current, textNodeCache.get(node), language);
  textNodeCache.set(node, stored);

  if (current !== stored.translated) {
    node.textContent = stored.translated;
  }
}

function translateAttributes(element: Element, language: AppLanguage) {
  if (shouldSkipElement(element)) {
    return;
  }

  let storedMap = elementAttributeCache.get(element);
  if (!storedMap) {
    storedMap = new Map();
    elementAttributeCache.set(element, storedMap);
  }

  ATTRIBUTE_NAMES.forEach((attributeName) => {
    const current = element.getAttribute(attributeName);
    if (current === null) {
      storedMap?.delete(attributeName);
      return;
    }

    const stored = resolveNextValue(current, storedMap?.get(attributeName), language);
    storedMap?.set(attributeName, stored);

    if (current !== stored.translated) {
      element.setAttribute(attributeName, stored.translated);
    }
  });
}

export function translateNode(node: Node, language: AppLanguage) {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node as Text, language);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as Element;
  translateAttributes(element, language);

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let currentNode: Node | null = walker.currentNode;
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      translateTextNode(currentNode as Text, language);
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(currentNode as Element, language);
    }
    currentNode = walker.nextNode();
  }
}

export { I18nProvider } from './I18nProvider';

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      locale: getLocale(DEFAULT_LANGUAGE),
      setLanguage: () => undefined,
      toggleLanguage: () => undefined,
      t: (text: string) => text,
    };
  }

  return context;
}
