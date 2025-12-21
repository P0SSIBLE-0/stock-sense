import { Controller } from "react-hook-form";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SelectField = ({ name, label, placeholder, control, error, options, required = false }: SelectFieldProps) => {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400" htmlFor={name}>{label}</Label>
            <Controller
                name={name}
                control={control}
                rules={{ required: required ? `This field is ${label}` : false }}
                render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full h-12! px-3 py-3 text-base placeholder:text-gray-500 border-gray-600 rounded-lg bg-gray-800 focus:border-yellow-500 focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 text-white">
                            <SelectGroup>
                                <SelectLabel>{label}</SelectLabel>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className=" focus:bg-gray-600 focus:text-white h-10 p-2 text-base">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </Select>
                )}

            />

        </div>
    );
};

export default SelectField;