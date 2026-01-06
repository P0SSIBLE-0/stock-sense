import Image from "next/image";

export default function AlertCard({ alert }: any) {
    return (
        <div className="bg-[#111] border border-neutral-800 rounded-lg! p-4 space-y-3 hover:border-neutral-700 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-800 h-10 w-10 rounded-lg flex items-center justify-center">
                        <Image className="bg-cover rounded-lg" src={alert.image} alt={alert.name} width={40} height={40} />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-white">{alert.name}</div>
                        <div className="text-xs text-neutral-400">{alert.price}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-white">{alert.symbol}</div>
                    <div className={`text-xs ${alert.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{alert.change}</div>
                </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-sm">
                <div className="flex flex-col">
                    <span className="text-neutral-400 text-xs mb-1">Alert:</span>
                    <span className="font-bold text-white">{alert.condition}</span>
                </div>
                <div className="flex gap-2">
                    <div className="text-[10px] bg-yellow-900/20 text-yellow-600 px-2 py-1 rounded border border-yellow-900/30">
                        {alert.freq}
                    </div>
                </div>
            </div>
        </div>
    );
}