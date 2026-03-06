import { useEffect } from 'react';

interface AdBannerProps {
  className?: string;
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}

export default function AdBanner({ 
  className = '', 
  dataAdSlot, 
  dataAdFormat = 'auto', 
  dataFullWidthResponsive = true 
}: AdBannerProps) {
  useEffect(() => {
    try {
      const uninitializedAds = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status="done"])');
      if (uninitializedAds.length > 0) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || '';
      if (errorMessage.includes('already have ads')) {
        return;
      }
      console.error('AdSense error:', err);
    }
  }, [dataAdSlot]);

  return (
    <div className={`relative w-full overflow-hidden flex justify-center items-center bg-gray-50 dark:bg-zinc-900/30 border border-gray-100 dark:border-zinc-800/50 rounded-xl p-2 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-YOUR_ADSENSE_ID"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
      />
      {/* Placeholder text visible only during development/before ads load */}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 dark:text-zinc-500 pointer-events-none font-mono -z-10">
        Advertisement Space
      </div>
    </div>
  );
}
