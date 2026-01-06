'use client';
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";
import { memo } from "react";

type TradingViewWidgetProps = {
    title?: string;
    scriptUrl: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
}

const TradingViewWidget = ({ title, scriptUrl, config, height = 600, className }: TradingViewWidgetProps) => {

    const containerRef = useTradingViewWidget(scriptUrl, config, height);
    return (
        <div className="w-full p-2">
            {title && <h2 className="text-xl lg:text-2xl xl:text-2xl font-semibold mb-4 text-gray-200">{title}</h2>}
            <div className={cn("tradingview-widget-container", className)} ref={containerRef} style={{ height: `${height}px`, width: '100%' }}>
                <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
                <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/NASDAQ-AAPL/" rel="noopener nofollow" target="_blank"><span className="blue-text">AAPL stock chart</span></a><span className="trademark"> by TradingView</span></div>

            </div>
        </div>
    );
};

export default memo(TradingViewWidget);