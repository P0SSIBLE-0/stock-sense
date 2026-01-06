import Link from "next/link";
import Image from "next/image";
import NavItems from "./NavItems";
import UserDropdown from "./user-dropdown";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { searchStocks } from "@/lib/actions/finnhub.actions";

const Header = async ({ user }: { user: User }) => {
    const initialStock = await searchStocks();
    const watchlistSymbols = user ? await getWatchlistSymbolsByEmail(user.email) : [];

    return (
        <header className="flex items-center justify-between sticky top-0 z-50 py-5 max-w-screen-2xl mx-auto h-[70px] bg-gray-800">
            <div className="w-full flex items-center justify-between px-5 xl:px-10 lg:px-8 md:px-6 ">
                <Link href="/">
                    <Image
                        className="h-8 w-auto cursor-pointer"
                        src="/assets/icons/logo.svg"
                        alt="Stock Sense"
                        width={140}
                        height={100}
                    />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems
                        initialStock={initialStock}
                        userEmail={user?.email}
                        watchlistSymbols={watchlistSymbols}
                    />
                </nav>
                <UserDropdown user={user} initialStock={initialStock} watchlistSymbols={watchlistSymbols} />
            </div>

        </header>
    );
};

export default Header;