'use client';
import { useEffect, useRef } from "react";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (containerRef.current.dataset.loaded) return;

        containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="height: calc(100% - 32px); width: 100%"></div>`;

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify(config);

        containerRef.current.appendChild(script);
        containerRef.current.dataset.loaded = 'true';

        // No cleanup needed to remove script since we want it to persist,
        // but if strict mode runs twice, the dataset guard prevents duplication.
        // If config changes, we might want to reload?
        // If config changes, current implementation won't update because of the guard.
        // For now, assume config is static per instance or component key handles re-mount.
        // But to be safe for dev:
        /* 
        return () => {
             if (containerRef.current) {
                 delete containerRef.current.dataset.loaded;
                 containerRef.current.innerHTML = '';
             }
        } 
        */
        // Actually, if we want to handle updates, we should clear and re-run.
        // Let's rely on the cleanup function for correct behavior in Dev (Strict Mode).

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
                delete containerRef.current.dataset.loaded;
            }
        };

    }, [scriptUrl, config, height]);

    return containerRef;
};

export default useTradingViewWidget;