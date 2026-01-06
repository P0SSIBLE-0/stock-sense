"use client"

import { useState, useEffect } from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, TrendingUp, Check, X } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { addToWatchlist } from "@/lib/actions/watchlist.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface WatchlistAddStockProps {
    userEmail: string;
}

export function WatchlistAddStock({ userEmail }: WatchlistAddStockProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [adding, setAdding] = useState<string | null>(null)
    const [stocks, setStocks] = useState<any[]>([])
    const router = useRouter() // Use router to refresh page after adding

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setStocks([]);
            return;
        }

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

    const handleAdd = async (stock: any) => {
        if (!userEmail) return toast.error("User not found");
        setAdding(stock.symbol);
        try {
            const success = await addToWatchlist(userEmail, stock.symbol, stock.name);
            if (success) {
                toast.success(`Added ${stock.symbol} to watchlist`);
                setOpen(false);
                setSearchTerm("");
                router.refresh();
            } else {
                toast.error("Failed to add to watchlist");
            }
        } catch (e) {
            toast.error("Error adding stock");
        } finally {
            setAdding(null);
        }
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-yellow-500 text-black hover:bg-yellow-400 font-medium">
                Add Stock
            </Button>
            <CommandDialog shouldFilter={false} className="bg-zinc-900 border-neutral-800" open={open} onOpenChange={setOpen}>
                <div className="border-b border-neutral-800 relative flex items-center px-3">
                    <CommandInput
                        placeholder="Search stocks to add..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-500 h-12"
                    />
                    {searchTerm.length > 0 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <X onClick={() => setSearchTerm('')} className="size-4 cursor-pointer text-neutral-500 hover:text-white" />
                        </div>
                    )}
                </div>
                <CommandList className="bg-zinc-900 max-h-[400px]">
                    {loading ? (
                        <div className="py-6 text-center text-sm text-neutral-500 font-semibold flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin size-5" />
                            Loading...
                        </div>
                    ) : (
                        <CommandGroup heading={searchTerm ? "SearchResults" : "Start typing to search"}>
                            {searchTerm && stocks.length === 0 && (
                                <div className="text-sm text-neutral-500 py-4 text-center">
                                    No stocks found.
                                </div>
                            )}
                            {stocks.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                                    onClick={() => handleAdd(stock)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-neutral-800 p-2 rounded-md">
                                            <TrendingUp className="size-4 text-neutral-400 group-hover:text-yellow-500 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{stock.symbol}</div>
                                            <div className="text-xs text-neutral-400">{stock.name} • {stock.exchange}</div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-neutral-400 hover:text-white hover:bg-neutral-700"
                                        disabled={adding === stock.symbol}
                                    >
                                        {adding === stock.symbol ? <Loader2 className="animate-spin size-4" /> : <Plus className="size-4" />}
                                    </Button>
                                </div>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
