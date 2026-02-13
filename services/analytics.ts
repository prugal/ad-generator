
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Next.js handles script loading via 'next/script' in layout.tsx.
// This function is kept for backward compatibility if called, but initialization happens in Layout.
export const initGA = (measurementId: string | undefined) => {
  // No-op for Next.js as script is loaded in Layout
};

export const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  }
};
