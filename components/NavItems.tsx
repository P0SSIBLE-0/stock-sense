'use client';
import { NAV_ITEMS } from "@/lib/constant";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SearchCommand } from "./SearchCommand";
const NavItems = ({ initialStock }: { initialStock: StockWithWatchlistStatus[] }) => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    return (
        <ul className="flex flex-col sm:flex-row gap-3 p-2 sm:gap-10 font-medium">
            {NAV_ITEMS.map((item) => {
                if (item.label === 'Search') {
                    return (
                        <li key={item.href}>
                            <SearchCommand
                                renderAs='text'
                                label='Search'
                                initialStock={initialStock} />
                        </li>
                    );
                }
                return (
                    <li key={item.href}>
                        <Link
                            className={cn("hover:text-yellow-500 transition-colors", isActive(item.href) ? "text-yellow-500" : "text-gray-400")}
                            href={item.href}>{item.label}</Link>
                    </li>
                )
            })}
        </ul>
    );
};

export default NavItems;
