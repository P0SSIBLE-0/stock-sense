'use client';

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WatchlistButtonProps {
    symbol: string;
}

export function WatchlistButton({ symbol }: WatchlistButtonProps) {
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleWatchlist = async () => {
        setIsLoading(true);
        try {
            // TODO: Integrate actual Server Action for adding/removing from watchlist
            // await toggleWatchlistAction(symbol);

            setIsInWatchlist(!isInWatchlist);
            // toast.success(isInWatchlist ? `Removed ${symbol} from watchlist` : `Added ${symbol} to watchlist`);
            toast.success("this feature is not available yet!");
        } catch (error) {
            toast.error("Failed to update watchlist");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={toggleWatchlist}
            disabled={isLoading}
            className={`max-w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-all duration-300 h-12 rounded! cursor-pointer mt-2 mx-2 ${isInWatchlist ? "bg-red-500 hover:bg-red-600" : ""}`}
        >
            <Star className={`mr-2 h-4 w-4 ${isInWatchlist ? "fill-black" : ""}`} />
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </Button>
    );
}
