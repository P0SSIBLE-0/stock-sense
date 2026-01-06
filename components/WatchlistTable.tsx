import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const WATCHLIST_TABLE_HEADER = [
    "Company",
    "Symbol",
    "Price",
    "Change",
    "Market Cap",
    "P/E Ratio",
    "Alert",
];

const SAMPLE_DATA = [
    {
        company: "Apple Inc",
        symbol: "AAPL",
        price: "$233.16",
        change: "+1.54%",
        marketCap: "$3.56T",
        peRatio: "35.5",
    },
    {
        company: "Microsoft Corp",
        symbol: "MSFT",
        price: "$520.42",
        change: "-0.24%",
        marketCap: "$3.75T",
        peRatio: "32.6",
    },
    {
        company: "Alphabet Inc",
        symbol: "GOOGL",
        price: "$201.56",
        change: "+2.65%",
        marketCap: "$2.52T",
        peRatio: "21.5",
    },
    {
        company: "Amazon.com Inc",
        symbol: "AMZN",
        price: "$244.16",
        change: "-1.53%",
        marketCap: "$1.45T",
        peRatio: "33.5",
    },
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
}

const WatchlistTable = ({ data }: WatchlistTableProps) => {
    return (
        <div className="rounded-md border border-neutral-800 bg-[#111] text-white">
            <div className="w-full text-sm text-yellow-500 bg-yellow-900/10 border border-yellow-900 rounded-t-md text-center py-2">
                Alerts are not available yet!
            </div>
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
                            <TableCell colSpan={7} className="text-center text-neutral-500 py-10">
                                No stocks in watchlist. Add one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={row.symbol} className="border-b-neutral-800 hover:bg-neutral-900/50">
                                <TableCell className="font-medium text-white flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                        ★
                                    </div>
                                    {row.company}
                                </TableCell>
                                <TableCell className="text-neutral-300">{row.symbol}</TableCell>
                                <TableCell className="text-neutral-300">{row.price}</TableCell>
                                <TableCell className={row.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                                    {row.change}
                                </TableCell>
                                <TableCell className="text-neutral-300">{row.marketCap}</TableCell>
                                <TableCell className="text-neutral-300">{row.peRatio}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="bg-orange-900/20 text-orange-500 border-orange-900/50 hover:bg-orange-900/40 hover:text-orange-400">
                                        Add Alert
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )))}
                </TableBody>
            </Table>
        </div>
    );
};

export default WatchlistTable;
