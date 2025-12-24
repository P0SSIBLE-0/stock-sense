"use client"

import { useState, useEffect } from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import Link from "next/link"
import { Loader2, TrendingUp, X } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { searchStocks } from "@/lib/actions/finnhub.actions"

export function SearchCommand({
    renderAs,
    label = 'Add Stock',
    initialStock,
}: {
    renderAs: "text" | "button"
    label: string
    initialStock: StockWithWatchlistStatus[]
}) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStock);


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


    const handleSelectStock = (value: string) => {
        setOpen(false)
        setSearchTerm('');
        setStocks(initialStock);
    }

    return (
        <>
            {
                renderAs === 'text' ? (
                    <span onClick={() => setOpen(true)}>
                        {label}
                    </span>
                ) : (
                    <button onClick={() => setOpen(true)}>
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
                                            className="rounded-none my-3 px-1 w-full data-selected:bg-gray-600 flex "
                                            key={stock.symbol}>
                                            <Link
                                                onClick={() => handleSelectStock}
                                                className="px-2 w-full cursor-pointer border-b border-gray-600 last:border-b-0 transition-colors flex items-center gap-3" href={`/stock/${stock.symbol}`}>
                                                <TrendingUp className="size-4" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{stock.name}</div>
                                                    <div className="text-xs text-neutral-400">{stock.symbol} | {stock.exchange} | {stock.type}</div>
                                                </div>
                                            </Link>
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
