import { CreateAlertButton } from "@/components/CreateAlertButton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";

const WATCHLIST_TABLE_HEADER = [
    "Company",
    "Symbol",
    "Price",
    "Change",
    "Market Cap",
    "P/E Ratio",
    "Alert",
];

export interface WatchlistItem {
    company: string;
    symbol: string;
    price: string;
    change: string;
    marketCap: string;
    peRatio: string;
}

interface WatchlistTableProps {
    data: WatchlistItem[];
    userEmail: string;
}

const WatchlistTable = ({ data, userEmail }: WatchlistTableProps) => {
    const watchlistOptions = data.map((item) => ({
        symbol: item.symbol,
        company: item.company,
    }));

    return (
        <div className="rounded-md border border-neutral-800 bg-[#111111] text-white">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-neutral-800 hover:bg-transparent">
                        {WATCHLIST_TABLE_HEADER.map((header) => (
                            <TableHead key={header} className="text-left text-neutral-400">
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow className="border-b-neutral-800 hover:bg-transparent">
                            <TableCell colSpan={7} className="py-10 text-center text-neutral-500">
                                No stocks in watchlist. Add one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={row.symbol} className="border-b-neutral-800 hover:bg-neutral-900/50">
                                <TableCell className="flex items-center gap-3 font-medium text-white">
                                    <Link href={`/stocks/${row.symbol}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                        {row.symbol.charAt(0)}
                                    </Link>
                                    <Link href={`/stocks/${row.symbol}`}>{row.company}</Link>
                                </TableCell>
                                <TableCell className="text-neutral-300">{row.symbol}</TableCell>
                                <TableCell className="text-neutral-300">{row.price}</TableCell>
                                <TableCell className={row.change.startsWith("+") ? "text-green-500" : row.change.startsWith("-") ? "text-red-500" : "text-neutral-300"}>
                                    {row.change}
                                </TableCell>
                                <TableCell className="text-neutral-300">{row.marketCap}</TableCell>
                                <TableCell className="text-neutral-300">{row.peRatio}</TableCell>
                                <TableCell>
                                    <CreateAlertButton
                                        userEmail={userEmail}
                                        watchlist={watchlistOptions}
                                        defaultSymbol={row.symbol}
                                        buttonLabel="Add Alert"
                                        variant="outline"
                                        size="sm"
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default WatchlistTable;

