'use client';
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import NavItems from "./NavItems";
import { signOut } from "@/lib/actions/auth.actions";

const UserDropdown = ({ user, initialStock, watchlistSymbols }: { user: User, initialStock: StockWithWatchlistStatus[], watchlistSymbols?: string[] }) => {
    const router = useRouter();
    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in');
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="flex items-center gap-3 text-gray-400 hover:text-brand cursor-pointer">
                    <Avatar>
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback className="bg-brand text-foreground text-sm font-bold">{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-base font-medium text-brand">{user?.name}</span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-800 border-gray-700 text-gray-400 p-2" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-3 text-gray-400 hover:text-brand cursor-pointer">
                            <Avatar>
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className="bg-brand text-foreground text-sm font-bold">{user.name[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium text-brand">{user.name}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-700 my-2" />
                <div className="sm:hidden">
                    <NavItems
                        initialStock={initialStock}
                        userEmail={user.email}
                        watchlistSymbols={watchlistSymbols}
                    />
                    <DropdownMenuSeparator className="bg-gray-700 my-2" />
                </div>

                <DropdownMenuItem className="text-red-500 hover:text-red-400 hover:bg-gray-700/50 focus:bg-gray-700/50 focus:text-red-400 cursor-pointer transition-colors p-2 font-semibold " onClick={handleSignOut}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;