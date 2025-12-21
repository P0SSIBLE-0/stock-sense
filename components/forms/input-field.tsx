import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const InputField = ({ name, label, placeholder, register, error, validation, disabled, value, type }: FormInputProps) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-medium text-gray-400">{label}</Label>
            <Input id={name} type={type} placeholder={placeholder} {...register(name, validation)} disabled={disabled} value={value} className={cn('h-12 p-3 text-white text-base placeholder:text-gray-500 border-gray-600 rounded-lg bg-gray-800 focus:border-yellow-500 focus:ring-0', { 'opacity-50 cursor-not-allowed': disabled })} />
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
    );
};

export default InputField;