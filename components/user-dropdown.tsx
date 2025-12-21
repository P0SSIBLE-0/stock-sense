'use client';
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import NavItems from "./NavItems";

const UserDropdown = () => {
    const router = useRouter();
    const signOut = async () => {
        router.push('/sign-in');
    }

    const user = { name: 'John Doe', email: 'john.doe@example.com' }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="flex items-center gap-3 text-gray-400 hover:text-yellow-500">
                    <Avatar>
                        <AvatarImage src="https://avatars.githubusercontent.com/u/106265510?v=4" />
                        <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-base font-medium text-gray-400">{user.name}</span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-800 border-gray-700 text-gray-400 p-2" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-3 text-gray-400 hover:text-yellow-500">
                            <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/106265510?v=4" />
                                <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-medium text-gray-400">{user.name}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-700 my-2" />
                <div className="sm:hidden">
                    <NavItems />
                    <DropdownMenuSeparator className="bg-gray-700 my-2" />
                </div>

                <DropdownMenuItem className="text-red-500 hover:text-red-400 hover:bg-gray-700/50 focus:bg-gray-700/50 focus:text-red-400 cursor-pointer transition-colors p-2 font-semibold " onClick={signOut}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;