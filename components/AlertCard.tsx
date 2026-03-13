"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteWatchlistAlert } from "@/lib/actions/alert.actions";
import { CreateAlertButton } from "@/components/CreateAlertButton";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type WatchlistOption = {
    symbol: string;
    company: string;
};

type AlertCardProps = {
    userEmail: string;
    watchlist: WatchlistOption[];
    alert: {
        id: string;
        symbol: string;
        company: string;
        alertName: string;
        priceLabel: string;
        changeLabel: string;
        conditionLabel: string;
        frequencyLabel: string;
        metric: "price" | "volume";
        condition: "greater" | "less";
        threshold: number;
        frequency: "daily" | "hourly" | "once";
        priceTone: "up" | "down" | "flat";
        logoUrl?: string;
    };
};

export default function AlertCard({ userEmail, watchlist, alert }: AlertCardProps) {
    const router = useRouter();
    const [removing, setRemoving] = useState(false);

    const changeToneClass = alert.priceTone === "up"
        ? "text-emerald-400"
        : alert.priceTone === "down"
            ? "text-rose-400"
            : "text-neutral-400";

    const handleRemove = async () => {
        if (!userEmail || removing) {
            return;
        }

        setRemoving(true);
        try {
            const result = await deleteWatchlistAlert(userEmail, alert.id);

            if (!result.success) {
                toast.error(result.message || "Failed to remove alert.");
                return;
            }

            toast.success(result.message || "Alert removed.");
            router.refresh();
        } catch (error) {
            toast.error("Failed to remove alert.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-neutral-700 bg-zinc-900 shadow-sm transition-colors hover:border-neutral-600">
            <div className="flex items-start justify-between gap-4 px-4 py-4">
                <Link href={`/stocks/${alert.symbol}`} className="flex min-w-0 items-center gap-3 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#2a303b] text-sm font-bold text-white transition-transform group-hover:scale-105">
                        {alert.logoUrl ? (
                            <Image
                                src={alert.logoUrl}
                                alt={`${alert.company} logo`}
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                                loading="lazy"
                            />
                        ) : (
                            alert.symbol.slice(0, 1)
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium text-white group-hover:text-yellow-300">
                            {alert.company}
                        </div>
                        <div className="text-[14px] text-white">
                            {alert.symbol}
                        </div>
                    </div>
                </Link>

                <div className="shrink-0 text-right">
                    <Link href={`/stocks/${alert.symbol}`} className="text-[15px] font-medium text-white hover:text-yellow-300">
                        {alert.priceLabel}
                    </Link>
                    <div className={`text-[14px] font-semibold ${changeToneClass}`}>
                        {alert.changeLabel}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/6 px-4 py-3">
                <div className="mb-1 text-[13px] text-neutral-400">Alert:</div>
                <div className="flex items-end justify-between gap-3">
                    <div className="text-[16px] font-semibold text-white">
                        {alert.conditionLabel}
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateAlertButton
                            userEmail={userEmail}
                            watchlist={watchlist}
                            initialAlert={{
                                id: alert.id,
                                alertName: alert.alertName,
                                symbol: alert.symbol,
                                metric: alert.metric,
                                condition: alert.condition,
                                threshold: alert.threshold,
                                frequency: alert.frequency,
                            }}
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-neutral-300 hover:bg-white/5 hover:text-white cursor-pointer"
                            buttonLabel="Edit Alert"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={removing}
                            onClick={handleRemove}
                            className="size-7 text-neutral-300 hover:bg-rose-500/50 cursor-pointer hover:text-rose-500"
                            aria-label={`Remove ${alert.alertName}`}
                        >
                            {removing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-3.5" />}
                        </Button>
                        <span className="rounded-md bg-yellow-500/15 px-2.5 py-1 text-[12px] font-medium text-yellow-300">
                            {alert.frequencyLabel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

