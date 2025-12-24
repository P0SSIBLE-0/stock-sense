import Link from "next/link";
import Image from "next/image";
import NavItems from "./NavItems";
import UserDropdown from "./user-dropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";
const Header = async ({ user }: { user: User }) => {
    const initialStock = await searchStocks();
    return (
        <header className="flex items-center justify-between sticky top-0 z-50 py-5 w-full h-[70px] bg-gray-800">
            <div className="container flex items-center justify-between px-4 ">
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
                    <NavItems initialStock={initialStock} />
                </nav>
                <UserDropdown user={user} initialStock={initialStock} />
            </div>

        </header>
    );
};

export default Header;