'use client';

import { useEffect, useState } from 'react';

export interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingSlug?: string;
}

const STORAGE_KEY = 'infast_utm_params';

export function useUTM(): UTMParams {
  const [utmParams, setUtmParams] = useState<UTMParams>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source');
    const medium = urlParams.get('utm_medium');
    const campaign = urlParams.get('utm_campaign');
    const content = urlParams.get('utm_content');
    const term = urlParams.get('utm_term');

    let savedParams: UTMParams = {};
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) savedParams = JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse UTM storage:', e);
    }

    const currentParams: UTMParams = {
      utmSource: source || savedParams.utmSource || 'Website Direct',
      utmMedium: medium || savedParams.utmMedium || 'organic',
      utmCampaign: campaign || savedParams.utmCampaign || undefined,
      utmContent: content || savedParams.utmContent || undefined,
      utmTerm: term || savedParams.utmTerm || undefined,
      landingSlug: window.location.pathname.replace(/^\//, '') || 'home',
    };

    if (source || medium || campaign || content || term) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentParams));
      } catch (e) {
        console.error('Failed to save UTM to session:', e);
      }
    }

    setUtmParams(currentParams);
  }, []);

  return utmParams;
}
