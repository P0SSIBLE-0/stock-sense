'use client';

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import InputField from "@/components/forms/input-field";
import SelectField from "@/components/forms/select-field";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constant";
import { CountrySelectField } from "@/components/forms/country-select-field";
import FooterLink from "@/components/forms/footer-link";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignUp = () => {
    const router = useRouter();

    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            country: 'US',
            investmentGoals: 'Growth',
            riskTolerance: 'Medium',
            preferredIndustry: 'Technology'
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) {
                router.push('/');
                toast.success('Sign up successful');
            } else {
                toast.error('Sign up failed', {
                    description: result.error || 'Something went wrong'
                });
            }
        } catch (error) {
            console.log(error);
            toast.error('Sign up failed', {
                description: error instanceof Error ? error.message : 'Something went wrong'
            });
        }
    }
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-400 mb-10">Sign Up & Personalize</h1>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <InputField name="fullName" label="Full Name" placeholder="John doe" register={register} error={errors.fullName} validation={{ required: 'Full name is required', minLength: 4 }} />
                <InputField name="email" label="Email" type="email" placeholder="johndoe@gmail.com" register={register} error={errors.email} validation={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } }} />

                <InputField name="password" label="Password" type="password" placeholder="Enter your password" register={register} error={errors.password} validation={{ required: 'Password is required', pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, message: 'Password must be at least 8 characters long and contain at least one letter and one number' } }} />

                <CountrySelectField
                    name="country"
                    label="Country"
                    control={control}
                    error={errors.country}
                    required
                />

                <SelectField
                    name="investmentGoals"
                    label="Investment Goal"
                    placeholder="Select Investment Goal"
                    control={control}
                    error={errors.investmentGoals}
                    options={INVESTMENT_GOALS}
                    required
                />
                <SelectField
                    name="riskTolerance"
                    label="Risk Tolerance"
                    placeholder="Select Your Risk Level"
                    control={control}
                    error={errors.riskTolerance}
                    options={RISK_TOLERANCE_OPTIONS}
                    required
                />
                <SelectField
                    name="preferredIndustry"
                    label="Preferred Industry"
                    placeholder="Select Your Preferred Industry"
                    control={control}
                    error={errors.preferredIndustry}
                    options={PREFERRED_INDUSTRIES}
                    required
                />

                <Button className="bg-yellow-500 text-neutral-900 w-full mt-5 h-11 hover:bg-yellow-500/80 cursor-pointer" type="submit" disabled={isSubmitting}> {isSubmitting ? 'Create Account' : 'Start Your Investment Journey'}</Button>
                <FooterLink text="Already have an account?" linkText="Sign In" href="/sign-in" />
            </form>
        </>
    );
};

export default SignUp;