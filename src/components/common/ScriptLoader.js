"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Enterprise Script Injection Engine
 * Handles location-aware loading, route targeting, and de-duplication.
 */
export default function ScriptLoader({ location = "head" }) {
  const pathname = usePathname();
  const [scripts, setScripts] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        const res = await fetch("/api/scripts");
        if (res.ok) {
          const data = await res.json();
          setScripts(data);
        }
      } catch (err) {
        console.error("ScriptLoader Error:", err);
      } finally {
        setHasLoaded(true);
      }
    };
    loadScripts();
  }, []);

  if (!hasLoaded) return null;

  // 1. Filter by Location
  const locationScripts = scripts.filter(s => s.location === location);

  // 2. Filter by Route Targeting (Glob + Exclusion support)
  const activeScripts = locationScripts.filter(s => {
    if (!s.targeting || s.targeting.type === 'all') return true;
    
    const { routes, type } = s.targeting;
    
    const checkMatch = (path, pattern) => {
        if (pattern.startsWith('!')) {
            return !checkMatch(path, pattern.slice(1));
        }
        if (pattern.endsWith('*')) {
            return path.startsWith(pattern.slice(0, -1));
        }
        return path === pattern;
    };

    const isMatched = routes.some(pattern => checkMatch(pathname, pattern));
    return type === 'specific' ? isMatched : !isMatched;
  });

  // 3. De-duplication (Keep only one script per unique template ID)
  const uniqueScripts = [];
  const seenIds = new Set();

  activeScripts.forEach(s => {
    const uniqueKey = s.type === 'custom' ? s._id : `${s.type}-${s.templateConfig.trackingId || s.templateConfig.pixelId || s.templateConfig.verificationId}`;
    if (!seenIds.has(uniqueKey)) {
        uniqueScripts.push(s);
        seenIds.add(uniqueKey);
    }
  });

  const renderScript = (s) => {
    const { type, templateConfig, loadStrategy, _id } = s;
    const scriptId = _id.toString();
    
    // Mapping strategies to Next/Script
    const strategyMap = {
        'async': 'afterInteractive',
        'defer': 'afterInteractive',
        'beforeInteractive': 'beforeInteractive',
        'afterInteractive': 'afterInteractive',
        'lazyOnload': 'lazyOnload'
    };
    const strategy = strategyMap[loadStrategy] || 'afterInteractive';

    switch (type) {
      case 'ga4':
        return (
          <React.Fragment key={scriptId}>
            <Script 
              id={`ga4-js-${scriptId}`}
              src={`https://www.googletagmanager.com/gtag/js?id=${templateConfig.trackingId}`}
              strategy={strategy}
            />
            <Script id={`ga4-init-${scriptId}`} strategy={strategy}>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${templateConfig.trackingId}', {
                    page_path: window.location.pathname,
                });
              `}
            </Script>
          </React.Fragment>
        );
      
      case 'gtm':
        return (
          <Script key={scriptId} id={`gtm-init-${scriptId}`} strategy={strategy}>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${templateConfig.trackingId}');
            `}
          </Script>
        );

      case 'meta_pixel':
        return (
          <Script key={scriptId} id={`meta-pixel-${scriptId}`} strategy={strategy}>
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${templateConfig.pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        );

      case 'verification':
        return <meta key={scriptId} name="google-site-verification" content={templateConfig.verificationId} />;

      case 'custom':
        if (!s.code) return null;
        
        const scriptMatch = s.code.match(/<script.*?>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            return (
                <Script key={scriptId} id={`custom-script-${scriptId}`} strategy={strategy}>
                    {scriptMatch[1]}
                </Script>
            );
        }

        return <div key={scriptId} dangerouslySetInnerHTML={{ __html: s.code }} />;

      default:
        return null;
    }
  };

  return (
    <>
      {uniqueScripts.map((s) => renderScript(s))}
    </>
  );
}
