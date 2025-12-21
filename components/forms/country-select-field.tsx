/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import countryList from 'react-select-country-list';
import Image from 'next/image';

type CountrySelectProps = {
    name: string;
    label: string;
    control: Control<any>;
    error?: FieldError;
    required?: boolean;
};

const CountrySelect = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) => {
    const [open, setOpen] = useState(false);

    // Get country options with flags
    const countries = countryList().getData();

    // Helper function to get flag image URL
    const getFlagUrl = (countryCode: string) => {
        return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full h-12 px-3 py-3 text-base justify-between font-normal border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-400 focus:border-yellow-500 rounded-lg focus:ring-0"
                )}
                role='combobox'
                aria-expanded={open}
            >
                {value ? (
                    <span className='flex items-center gap-3'>
                        <div className="relative w-6 h-4 overflow-hidden rounded-sm shrink-0">
                            <Image
                                src={getFlagUrl(value)}
                                alt={value}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span>{countries.find((c) => c.value === value)?.label}</span>
                    </span>
                ) : (
                    'Select your country...'
                )}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </PopoverTrigger>
            <PopoverContent
                className='w-full p-0 bg-gray-800 border-gray-600'
                align='start'
            >
                <Command className='bg-gray-800 border-gray-600 py-2'>
                    <CommandInput
                        placeholder='Search countries...'
                        className='bg-gray-800! text-gray-400 border-0 border-b border-gray-600 rounded-none focus:ring-0 placeholder:text-gray-500'
                    />
                    <CommandEmpty className='text-gray-500 py-6 text-center bg-gray-800!'>
                        No country found.
                    </CommandEmpty>
                    <CommandList className='max-h-60 bg-gray-800 scrollbar-hide-default'>
                        <CommandGroup className='bg-zinc-800 space-y-1'>
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.value}
                                    value={`${country.label} ${country.value}`}
                                    onSelect={() => {
                                        onChange(country.value);
                                        setOpen(false);
                                    }}
                                    className='text-white cursor-pointer px-3 py-2 rounded-sm bg-zinc-800 hover:bg-zinc-600! h-10 my-1 '
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4 text-yellow-500',
                                            value === country.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    <span className='flex items-center gap-3'>
                                        <div className="relative w-6 h-4 overflow-hidden rounded-sm shrink-0">
                                            <Image
                                                src={getFlagUrl(country.value)}
                                                alt={country.label}
                                                fill
                                                className="object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                        <span>{country.label}</span>
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export const CountrySelectField = ({
    name,
    label,
    control,
    error,
    required = false,
}: CountrySelectProps) => {
    return (
        <div className='space-y-2'>
            <Label htmlFor={name} className='form-label'>
                {label}
            </Label>
            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render={({ field }) => (
                    <CountrySelect value={field.value} onChange={field.onChange} />
                )}
            />
            {error && <p className='text-sm text-red-500'>{error.message}</p>}
            <p className='text-xs text-gray-500'>
                Helps us show market data and news relevant to you.
            </p>
        </div>
    );
};