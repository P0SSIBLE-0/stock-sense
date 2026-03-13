"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { createWatchlistAlert, updateWatchlistAlert } from "@/lib/actions/alert.actions";
import { ALERT_FREQUENCY_OPTIONS, ALERT_METRIC_OPTIONS, CONDITION_OPTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

type WatchlistOption = {
    symbol: string;
    company: string;
};

type EditableAlert = {
    id: string;
    alertName: string;
    symbol: string;
    metric: "price" | "volume";
    condition: "greater" | "less";
    threshold: number;
    frequency: "daily" | "hourly" | "once";
};

type CreateAlertButtonProps = {
    userEmail: string;
    watchlist: WatchlistOption[];
    buttonLabel?: string;
    defaultSymbol?: string;
    initialAlert?: EditableAlert;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "icon-sm";
    className?: string;
};

type AlertFormState = {
    alertName: string;
    symbol: string;
    metric: "price" | "volume";
    condition: "greater" | "less";
    threshold: string;
    frequency: "daily" | "hourly" | "once";
};

function buildInitialState(defaultSymbol?: string, initialAlert?: EditableAlert): AlertFormState {
    if (initialAlert) {
        return {
            alertName: initialAlert.alertName,
            symbol: initialAlert.symbol,
            metric: initialAlert.metric,
            condition: initialAlert.condition,
            threshold: String(initialAlert.threshold),
            frequency: initialAlert.frequency,
        };
    }

    return {
        alertName: "",
        symbol: defaultSymbol ?? "",
        metric: "price",
        condition: "greater",
        threshold: "",
        frequency: "daily",
    };
}

export function CreateAlertButton({
    userEmail,
    watchlist,
    buttonLabel,
    defaultSymbol,
    initialAlert,
    variant = "default",
    size = "sm",
    className,
}: CreateAlertButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<AlertFormState>(() => buildInitialState(defaultSymbol, initialAlert));

    const isEditing = Boolean(initialAlert);
    const ctaLabel = buttonLabel ?? (isEditing ? "Edit Alert" : "Create Alert");

    const selectedStock = useMemo(() => {
        return watchlist.find((item) => item.symbol === form.symbol);
    }, [form.symbol, watchlist]);

    const resetForm = () => {
        setForm(buildInitialState(defaultSymbol, initialAlert));
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) {
            resetForm();
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!userEmail) {
            toast.error("User session is missing.");
            return;
        }

        if (!form.symbol) {
            toast.error("Select a stock from your watchlist.");
            return;
        }

        const threshold = Number(form.threshold);
        if (!Number.isFinite(threshold) || threshold <= 0) {
            toast.error("Threshold must be greater than 0.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                email: userEmail,
                alertName: form.alertName.trim(),
                symbol: form.symbol,
                metric: form.metric,
                condition: form.condition,
                threshold,
                frequency: form.frequency,
            };

            const result = isEditing && initialAlert
                ? await updateWatchlistAlert({ ...payload, alertId: initialAlert.id })
                : await createWatchlistAlert(payload);

            if (!result.success) {
                toast.error(result.message || `Failed to ${isEditing ? "update" : "create"} alert.`);
                return;
            }

            toast.success(result.message || `Alert ${isEditing ? "updated" : "created"}.`);
            setOpen(false);
            resetForm();
            router.refresh();
        } catch (error) {
            toast.error(`Failed to ${isEditing ? "update" : "create"} alert.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button
                size={size}
                variant={variant}
                disabled={!watchlist.length}
                onClick={() => handleOpenChange(true)}
                className={className ?? (variant === "outline"
                    ? "border-yellow-700/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300"
                    : variant === "ghost"
                        ? "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        : "bg-yellow-500 text-black hover:bg-yellow-400 font-medium")}
            >
                {isEditing && size === "icon-sm" ? <PencilLine className="size-4" /> : ctaLabel}
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="mx-auto max-w-md border border-neutral-800 bg-[#111111] p-0 text-white shadow-xl shadow-black/30">
                    <div className="rounded-2xl border border-white/5 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.12),transparent_42%),#111111] p-5">
                        <DialogHeader className="mb-6 gap-1">
                            <DialogTitle className="text-2xl font-bold text-white">{isEditing ? "Update Alert" : "Create Alert"}</DialogTitle>
                            <DialogDescription className="text-sm text-neutral-400">
                                {isEditing ? "Adjust the alert rule and save the updated trigger." : "Create a stock alert for anything already in your watchlist."}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="alert-name" className="text-xs font-medium uppercase tracking-wide text-neutral-400">Alert Name</Label>
                                    <Input
                                        id="alert-name"
                                        value={form.alertName}
                                        onChange={(event) => setForm((current) => ({ ...current, alertName: event.target.value }))}
                                        placeholder={selectedStock ? `${selectedStock.company} alert` : "Apple at discount"}
                                        className="h-10 border-neutral-700 bg-neutral-900/80 text-white placeholder:text-neutral-500"
                                        maxLength={120}
                                        required
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="stock-symbol" className="text-xs font-medium uppercase tracking-wide text-neutral-400">Stock</Label>
                                    <Select value={form.symbol} onValueChange={(value) => setForm((current) => ({ ...current, symbol: value }))}>
                                        <SelectTrigger id="stock-symbol" className="h-10 w-full border-neutral-700 bg-neutral-900/80 text-white">
                                            <SelectValue placeholder="Select a stock" />
                                        </SelectTrigger>
                                        <SelectContent className="border-neutral-800 bg-[#171717] text-white">
                                            {watchlist.map((stock) => (
                                                <SelectItem key={stock.symbol} value={stock.symbol} className="focus:bg-neutral-800 focus:text-white">
                                                    {stock.company} ({stock.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alert-type" className="text-xs font-medium uppercase tracking-wide text-neutral-400">Alert Type</Label>
                                    <Select value={form.metric} onValueChange={(value: "price" | "volume") => setForm((current) => ({ ...current, metric: value }))}>
                                        <SelectTrigger id="alert-type" className="h-10 w-full border-neutral-700 bg-neutral-900/80 text-white">
                                            <SelectValue placeholder="Select alert type" />
                                        </SelectTrigger>
                                        <SelectContent className="border-neutral-800 bg-[#171717] text-white">
                                            {ALERT_METRIC_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="focus:bg-neutral-800 focus:text-white">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="condition" className="text-xs font-medium uppercase tracking-wide text-neutral-400">Condition</Label>
                                    <Select value={form.condition} onValueChange={(value: "greater" | "less") => setForm((current) => ({ ...current, condition: value }))}>
                                        <SelectTrigger id="condition" className="h-10 w-full border-neutral-700 bg-neutral-900/80 text-white">
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent className="border-neutral-800 bg-[#171717] text-white">
                                            {CONDITION_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="focus:bg-neutral-800 focus:text-white">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="threshold" className="text-xs font-medium uppercase tracking-wide text-neutral-400">Threshold</Label>
                                    <InputGroup className="h-10 border-neutral-700 bg-neutral-900/80">
                                        <InputGroupAddon>
                                            <InputGroupText className="text-neutral-400">
                                                {form.metric === "price" ? "$" : "M"}
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            id="threshold"
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            step="0.01"
                                            value={form.threshold}
                                            onChange={(event) => setForm((current) => ({ ...current, threshold: event.target.value }))}
                                            placeholder={form.metric === "price" ? "eg. 140" : "eg. 5.50"}
                                            className="h-10 text-white placeholder:text-neutral-500"
                                            required
                                        />
                                    </InputGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="frequency" className="text-xs font-medium uppercase tracking-wide text-neutral-400">Frequency</Label>
                                    <Select value={form.frequency} onValueChange={(value: "daily" | "hourly" | "once") => setForm((current) => ({ ...current, frequency: value }))}>
                                        <SelectTrigger id="frequency" className="h-10 w-full border-neutral-700 bg-neutral-900/80 text-white">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent className="border-neutral-800 bg-[#171717] text-white">
                                            {ALERT_FREQUENCY_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="focus:bg-neutral-800 focus:text-white">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-black/20 px-3 py-3 text-xs text-neutral-400">
                                {form.metric === "price" ? "Price alerts use USD values." : "Volume alerts use millions of shares."}
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || !watchlist.length}
                                className="mt-2 h-11 w-full bg-yellow-500 font-semibold text-black hover:bg-yellow-400"
                            >
                                {submitting ? <Loader2 className="size-4 animate-spin" /> : isEditing ? "Save Changes" : "Create Alert"}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
