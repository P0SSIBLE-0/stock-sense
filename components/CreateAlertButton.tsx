"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CreateAlertButton() {
    const handleClick = () => {
        toast.info("Alerts are not available yet!");
    };

    return (
        <Button
            size="sm"
            onClick={handleClick}
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-medium cursor-pointer rounded-lg!"
        >
            Create Alert
        </Button>
    );
}
