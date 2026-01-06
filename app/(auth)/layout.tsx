import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import Image from "next/image";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) redirect("/");

    return (
        <main className="flex h-screen overflow-hidden bg-gray-900 relative inset-0">
            <section className="w-full h-full lg:w-[45%] xl:w-[40%] flex flex-col px-6 lg:px-16 py-10 overflow-y-auto inset-0">
                <Link href="/" className="mb-12 block">
                    <Logo />
                </Link>
                <div className="flex-1">
                    {children}
                </div>
            </section>

            <section className="hidden lg:flex w-full lg:w-[55%] xl:w-[60%] flex-col justify-center xl:py-8 px-12 xl:px-24 bg-gray-800 relative">
                <div className="max-w-3xl mx-auto w-full flex flex-col justify-center h-full">
                    <div className="mb-12 mt-auto">
                        <blockquote className="text-2xl xl:text-3xl font-medium text-white leading-tight mb-8">
                            Signalist turned my watchlist into a <span className="font-bold">winning list</span>. The alerts are spot-on, and I feel more confident making moves in the market
                        </blockquote>

                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-[2px] bg-white rounded-full"></div>
                                    <span className="text-white font-bold text-lg">Ethan R.</span>
                                </div>
                                <p className="text-gray-500 pl-6">Retail Investor</p>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Image className="text-amber-300" key={i} src="/assets/icons/star.svg" alt="Star" width={20} height={20} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-[#111] border border-gray-800 rounded-t-xl overflow-hidden shadow-2xl mt-8">


                        {/* Dashboard Image */}
                        <div className="relative w-full aspect-16/10 bg-[#1a1a1a]">
                            <Image
                                src="/assets/images/dashboard.png"
                                alt="Dashboard Preview"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Layout;
