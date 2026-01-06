
import TradingViewWidget from "@/components/trading-view-widget";
import { WatchlistButton } from "@/components/watchlist-button";
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constant";
import { normalizeSymbol } from "@/lib/utils";

const scriptBase = "https://s3.tradingview.com/external-embedding/embed-widget-";

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { checkWatchlistStatus } from "@/lib/actions/watchlist.actions";

export default async function StockDetails({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await params;

    // Decode symbol if needed, though usually it's fine. 
    // Usually standard params are URL encoded.
    const decodedSymbol = normalizeSymbol(symbol);

    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    let isInWatchlist = false;
    let userEmail = "";

    if (session?.user?.email) {
        userEmail = session.user.email;
        isInWatchlist = await checkWatchlistStatus(userEmail, decodedSymbol);
    }

    return (
        <div className="w-full md:p-5 lg:p-6 space-y-3 bg-black text-white min-h-screen">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                {/* Left Column */}
                <div className="flex flex-col gap-2 xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={scriptBase + "symbol-info.js"}
                        config={SYMBOL_INFO_WIDGET_CONFIG(decodedSymbol)}
                        height={200}
                        className="w-full"
                    />
                    <TradingViewWidget
                        scriptUrl={scriptBase + "advanced-chart.js"}
                        config={CANDLE_CHART_WIDGET_CONFIG(decodedSymbol)}
                        height={600}
                        className="w-full"
                    />
                    <TradingViewWidget
                        scriptUrl={scriptBase + "advanced-chart.js"}
                        config={BASELINE_WIDGET_CONFIG(decodedSymbol)}
                        height={600}
                        className="w-full"
                    />
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-2 overflow-hidden">
                    <WatchlistButton
                        symbol={decodedSymbol}
                        initialIsInWatchlist={isInWatchlist}
                        userEmail={userEmail}
                        companyName={decodedSymbol} // Ideally we fetch the real name
                    />

                    <TradingViewWidget
                        scriptUrl={scriptBase + "technical-analysis.js"}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(decodedSymbol)}
                        height={400}
                        className="w-full"
                    />
                    <TradingViewWidget
                        scriptUrl={scriptBase + "symbol-profile.js"}
                        config={COMPANY_PROFILE_WIDGET_CONFIG(decodedSymbol)}
                        height={440}
                        className="w-full"
                    />
                    <TradingViewWidget
                        scriptUrl={scriptBase + "financials.js"}
                        config={COMPANY_FINANCIALS_WIDGET_CONFIG(decodedSymbol)}
                        height={464}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    )
}
