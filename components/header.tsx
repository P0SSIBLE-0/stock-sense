import Link from "next/link";
import NavItems from "./NavItems";
import UserDropdown from "./user-dropdown";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { SearchCommand } from "./SearchCommand";

const Header = async ({ user }: { user?: User }) => {
    const initialStock = await searchStocks();
    const watchlistSymbols = user?.email ? await getWatchlistSymbolsByEmail(user.email) : [];

    return (
        <header className="flex items-center justify-between sticky top-0 z-50 py-5 max-w-screen-2xl mx-auto h-[70px] bg-gray-800">
            <div className="w-full flex items-center justify-between px-3.5 sm:px-6 md:px-8 xl:px-10">
                <Link href="/" className="shrink-0">
                    <Logo />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems
                        initialStock={initialStock}
                        userEmail={user?.email}
                        watchlistSymbols={watchlistSymbols}
                    />
                </nav>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="sm:hidden">
                        <SearchCommand
                            renderAs="icon"
                            label="Search"
                            initialStock={initialStock}
                            userEmail={user?.email}
                            watchlistSymbols={watchlistSymbols}
                        />
                    </div>
                    {user ? (
                        <UserDropdown user={user} initialStock={initialStock} watchlistSymbols={watchlistSymbols} />
                    ) : (
                        <>
                            <Link href="/sign-in">
                                <Button
                                    className="bg-yellow-500 text-black hover:bg-yellow-400 font-medium text-xs sm:text-sm h-8 px-2.5 sm:px-3.5 rounded-md cursor-pointer whitespace-nowrap"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button
                                    variant="outline"
                                    className="border-gray-600 bg-transparent hover:bg-gray-700 text-gray-200 hover:text-white font-medium text-xs sm:text-sm h-8 px-2.5 sm:px-3.5 rounded-md cursor-pointer whitespace-nowrap"
                                >
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

        </header>
    );
};

export default Header;