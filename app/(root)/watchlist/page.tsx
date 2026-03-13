import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AlertCard from "@/components/AlertCard";
import { CreateAlertButton } from "@/components/CreateAlertButton";
import WatchlistTable from "@/components/WatchlistTable";
import { getAlertsByEmail } from "@/lib/actions/alert.actions";
import { getNews, getWatchlistData } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getAuth } from "@/lib/better-auth/auth";

export default async function WatchlistPage() {
    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const symbols = await getWatchlistSymbolsByEmail(session.user.email);
    const [watchlistData, news, alerts] = await Promise.all([
        getWatchlistData(symbols),
        getNews(symbols.length > 0 ? symbols : undefined),
        getAlertsByEmail(session.user.email),
    ]);

    const watchlistOptions = watchlistData.map((item) => ({
        symbol: item.symbol,
        company: item.company,
    }));

    return (
        <div className="min-h-screen px-2 font-sans text-white md:px-4">
            <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="flex flex-col gap-4 lg:col-span-8">
                        <div className="flex h-12 items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
                        </div>
                        <WatchlistTable data={watchlistData} userEmail={session.user.email} />
                    </div>

                    <div className="space-y-4 lg:col-span-4">
                        <div className="flex h-12 items-center justify-between gap-3">
                            <h2 className="text-xl font-bold">Alerts</h2>
                            <CreateAlertButton userEmail={session.user.email} watchlist={watchlistOptions} />
                        </div>

                        <div className="space-y-4">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <AlertCard
                                        key={alert.id}
                                        userEmail={session.user.email}
                                        watchlist={watchlistOptions}
                                        alert={alert}
                                    />
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-neutral-800 bg-[#111111] px-5 py-8 text-center text-sm text-neutral-500">
                                    No alerts yet. Create one from the watchlist or the button above.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-4">
                    <h2 className="mb-6 text-xl font-bold">News</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {news.length > 0 ? news.map((article, idx) => (
                            <div key={idx} className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-[#111111] transition-colors hover:border-neutral-600">
                                <div className="flex h-full flex-col justify-between p-5">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            {article.related && (
                                                <span className="rounded border border-green-900/50 bg-green-900/30 px-2 py-0.5 text-[10px] font-bold uppercase text-green-500">
                                                    {article.related}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="line-clamp-3 font-semibold leading-snug text-white">
                                            {article.headline}
                                        </h3>
                                        <div className="text-xs text-neutral-500">
                                            {article.source} | {article.datetime ? new Date(article.datetime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"}
                                        </div>
                                        <p className="line-clamp-3 text-sm text-neutral-400">
                                            {article.summary}
                                        </p>
                                    </div>
                                    <Link
                                        href={article.url || "#"}
                                        target="_blank"
                                        className="mt-4 inline-flex items-center text-xs font-medium text-yellow-500 hover:text-yellow-400"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-4 py-10 text-center text-neutral-500">
                                No news available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
