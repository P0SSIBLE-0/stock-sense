import Header from "@/components/header";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    // Public layout: never crash when DB/DNS is down — fall back to guest.
    let user: User | undefined = undefined;
    try {
        const auth = await getAuth();
        const session = await auth.api.getSession({ headers: await headers() });

        if (session?.user) {
            user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
            };
        }
    } catch (error) {
        // Never swallow Next.js control-flow errors (redirect / notFound /
        // static-prerender bailout) — only DB/network failures fall back to guest.
        const digest = (error as { digest?: string })?.digest;
        if (digest === "DYNAMIC_SERVER_USAGE" || digest?.startsWith("NEXT_")) throw error;
        console.error("Root layout: failed to get session, rendering as guest:", error);
    }
    return <main className="min-h-screen text-gray-400 ">
        <Header user={user} />
        <div className="mx-auto max-w-screen-2xl px-2 py-4 md:px-6 lg:px-8 md:py-8 xl:py-10">
            {children}
        </div>
    </main>;
};

export default Layout;
