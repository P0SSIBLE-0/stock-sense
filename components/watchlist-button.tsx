'use client';

import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
    symbol: string;
    initialIsInWatchlist?: boolean;
    userEmail?: string;
    companyName?: string;
}

export function WatchlistButton({ symbol, initialIsInWatchlist = false, userEmail, companyName }: WatchlistButtonProps) {
    const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleWatchlist = async () => {
        if (!userEmail) {
            toast.error("Please sign in to manage your watchlist");
            return;
        }

        setIsLoading(true);
        try {
            if (isInWatchlist) {
                const success = await removeFromWatchlist(userEmail, symbol);
                if (success) {
                    setIsInWatchlist(false);
                    toast.success(`Removed ${symbol} from watchlist`);
                    router.refresh();
                } else {
                    toast.error("Failed to remove from watchlist");
                }
            } else {
                const success = await addToWatchlist(userEmail, symbol, companyName || symbol);
                if (success) {
                    setIsInWatchlist(true);
                    toast.success(`Added ${symbol} to watchlist`);
                    router.refresh();
                } else {
                    toast.error("Failed to add to watchlist");
                }
            }
        } catch (error) {
            toast.error("Failed to update watchlist");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={toggleWatchlist}
            disabled={isLoading || !userEmail}
            className={`max-w-full font-semibold transition-all duration-300 h-12 rounded! cursor-pointer mt-2 mx-2 ${isInWatchlist
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-black"
                }`}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Star className={`mr-2 h-4 w-4 ${isInWatchlist ? "fill-white" : "fill-transparent"}`} />
            )}
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </Button>
    );
}
