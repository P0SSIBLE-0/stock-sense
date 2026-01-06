import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getWatchlistData, getNews } from "@/lib/actions/finnhub.actions";
import WatchlistTable from "@/components/WatchlistTable";
import { CreateAlertButton } from "@/components/CreateAlertButton";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AlertCard from "@/components/AlertCard";

const MOCK_ALERTS = [
    {
        symbol: "AAPL",
        image: 'https://s3-symbol-logo.tradingview.com/apple--big.svg',
        name: "Apple Inc.",
        price: "$229.65",
        change: "+1.4%",
        condition: "Price > $240.60",
        freq: "Once per day"
    },
    {
        symbol: "TSLA",
        image: 'https://s3-symbol-logo.tradingview.com/tesla--big.svg',
        name: "Tesla, Inc.",
        price: "$340.84",
        change: "-2.53%",
        condition: "Price = $300.80",
        freq: "Once per minute"
    },
    {
        symbol: "META",
        image: 'https://s3-symbol-logo.tradingview.com/meta--big.svg',
        name: "Meta Platforms Inc.",
        price: "$790.00",
        change: "+1.4%",
        condition: "Price < $700.40",
        freq: "Once per hour"
    }
];

export default async function WatchlistPage() {
    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/sign-in");
    }

    const symbols = await getWatchlistSymbolsByEmail(session.user.email);
    const [watchlistData, news] = await Promise.all([
        getWatchlistData(symbols),
        getNews(symbols.length > 0 ? symbols : undefined)
    ]);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
                    {/* <WatchlistAddStock userEmail={session.user.email} /> */}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Watchlist Table (Left 8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <WatchlistTable data={watchlistData} />
                    </div>

                    {/* Alerts Section (Right 4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Alerts</h2>
                            <CreateAlertButton />
                        </div>

                        <div className="space-y-4">
                            {/* Static Mock Alerts for visual completeness */}
                            {MOCK_ALERTS.map((alert, i) => (
                                <AlertCard key={i} alert={alert} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* News Section (Bottom) */}
                <div className="pt-4 border-t border-neutral-800">
                    <h2 className="text-xl font-bold mb-6">News</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {news.length > 0 ? news.map((article, idx) => (
                            <div key={idx} className="bg-[#111] border border-neutral-800 rounded-lg overflow-hidden flex flex-col hover:border-neutral-600 transition-colors h-full">
                                <div className="p-5 flex flex-col justify-between h-full">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            {article.related && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/30 text-green-500 border border-green-900/50 uppercase">
                                                    {article.related}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-white leading-snug line-clamp-3">
                                            {article.headline}
                                        </h3>
                                        <div className="text-xs text-neutral-500">
                                            {article.source} • {article.datetime ? new Date(article.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                        </div>
                                        <p className="text-sm text-neutral-400 line-clamp-3">
                                            {article.summary}
                                        </p>
                                    </div>
                                    <Link
                                        href={article.url || '#'}
                                        target="_blank"
                                        className="inline-flex items-center text-xs font-medium text-yellow-500 hover:text-yellow-400 mt-4"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-4 text-center text-neutral-500 py-10">
                                No news available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
