import Image from "next/image";

export default function Logo() {
    return (
        <div className="inline-flex justify-center items-center gap-2">
            <Image src="/assets/icons/logo.svg" alt="Stock Sense" width={45} height={40} />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[#02ED12] to-green-100">Stock Sense</h1>
        </div>
    )
}