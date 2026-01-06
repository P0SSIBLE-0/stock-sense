"use client"

import { useState, useEffect } from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandList,
} from "@/components/ui/command"
import Link from "next/link"
import { Loader2, TrendingUp, X, Star } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SearchCommand({
    renderAs,
    label = 'Add Stock',
    initialStock,
    userEmail,
    watchlistSymbols
}: {
    renderAs: "text" | "button"
    label: string
    initialStock: StockWithWatchlistStatus[]
    userEmail?: string
    watchlistSymbols?: string[]
}) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStock);
    const [localWatchlist, setLocalWatchlist] = useState<Set<string>>(new Set(watchlistSymbols || []));
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();


    const isSearchMode = !!searchTerm.trim()
    const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Update local watchlist when prop changes
    useEffect(() => {
        if (watchlistSymbols) {
            setLocalWatchlist(new Set(watchlistSymbols));
        }
    }, [watchlistSymbols]);

    const handleSearch = async () => {
        if (!isSearchMode) return setStocks(initialStock);

        setLoading(true)
        try {
            const results = await searchStocks(searchTerm.trim());
            setStocks(results);
        } catch {
            setStocks([])
        } finally {
            setLoading(false)
        }
    }


    const debouncedSearch = useDebounce(handleSearch, 300);
    useEffect(() => {
        debouncedSearch()
    }, [searchTerm])


    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm('');
        setStocks(initialStock);
    }

    const handleToggleWatchlist = async (e: React.MouseEvent, stock: StockWithWatchlistStatus) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userEmail) return toast.error("Please sign in to use watchlist");
        if (processing) return;

        setProcessing(stock.symbol);
        const isIn = localWatchlist.has(stock.symbol);

        try {
            if (isIn) {
                const ok = await removeFromWatchlist(userEmail, stock.symbol);
                if (ok) {
                    const next = new Set(localWatchlist);
                    next.delete(stock.symbol);
                    setLocalWatchlist(next);
                    toast.success("Removed from watchlist");
                    router.refresh();
                } else {
                    toast.error("Failed to remove from watchlist");
                }
            } else {
                const ok = await addToWatchlist(userEmail, stock.symbol, stock.name);
                if (ok) {
                    const next = new Set(localWatchlist);
                    next.add(stock.symbol);
                    setLocalWatchlist(next);
                    toast.success("Added to watchlist");
                    router.refresh();
                } else {
                    toast.error("Failed to add to watchlist");
                }
            }
        } catch {
            toast.error("Failed to update watchlist");
        } finally {
            setProcessing(null);
        }
    }

    return (
        <>
            {
                renderAs === 'text' ? (
                    <span className="cursor-pointer" onClick={() => setOpen(true)}>
                        {label}
                    </span>
                ) : (
                    <button className="cursor-pointer" onClick={() => setOpen(true)}>
                        {label}
                    </button>
                )
            }
            <CommandDialog shouldFilter={false} className="bg-zinc-800! lg:max-w-[800px] border-gray-600 fixed top-10 left-1/2 -translate-x-1/2 translate-y-10" open={open} onOpenChange={setOpen}>
                <div className="bg-zinc-800! border-b border-gray-600 relative">
                    <CommandInput
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className=""
                    />
                    {searchTerm.length > 0 && (
                        <div className="absolute right-4 top-4">
                            <X onClick={() => setSearchTerm('')} className="size-4 cursor-pointer" />
                        </div>
                    )}
                </div>
                <CommandList className="bg-zinc-800! max-h-[400px]">
                    {loading ? (
                        <div className="py-6 text-center text-sm text-neutral-500 font-semibold animate-pulse">
                            Loading...
                        </div>
                    ) : (
                        <CommandGroup heading="Stocks">
                            {loading ? (
                                <CommandEmpty className="py-6! bg-transparent! text-center! text-gray-500! ">Loading...</CommandEmpty>
                            ) : displayStocks?.length === 0 ? (
                                <div className="text-sm text-neutral-400 mx-2 py-2">
                                    {!!isSearchMode ? 'no results found' : 'no stocks available'}
                                </div>
                            ) : (
                                <ul>
                                    <div className="py-2 px-4 text-sm font-medium text-gray-400 bg-gray-700 border-b border-gray-700">
                                        {isSearchMode ? 'Results' : 'Top Stocks'} ({displayStocks?.length || 0})
                                    </div>
                                    {displayStocks?.map((stock) => (
                                        <li
                                            className="rounded-none my-3 px-1 w-full data-selected:bg-gray-600 flex items-center hover:bg-zinc-700/50 transition-colors"
                                            key={stock.symbol}>
                                            <Link
                                                onClick={() => handleSelectStock()}
                                                className="px-2 flex-1 cursor-pointer border-b border-gray-600 last:border-b-0 flex items-center gap-3 py-2" href={`/stocks/${stock.symbol}`}>
                                                <TrendingUp className="size-4 text-green-500" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-white">{stock.name}</div>
                                                    <div className="text-xs text-neutral-400">{stock.symbol} | {stock.exchange} | {stock.type}</div>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={(e) => handleToggleWatchlist(e, stock)}
                                                className="p-2 mr-2 rounded-full hover:bg-zinc-600 transition-colors"
                                                disabled={processing === stock.symbol}
                                            >
                                                {processing === stock.symbol ? (
                                                    <Loader2 className="size-4 animate-spin text-neutral-400" />
                                                ) : (
                                                    <Star
                                                        className={`size-4 transition-colors ${localWatchlist.has(stock.symbol) ? "fill-yellow-500 text-yellow-500" : "text-neutral-500 hover:text-yellow-500"}`}
                                                    />
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
