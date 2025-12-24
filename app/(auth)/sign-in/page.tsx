'use client';

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import InputField from "@/components/forms/input-field";
import FooterLink from "@/components/forms/footer-link";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SignIn = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const response = await signInWithEmail(data);
            if (response.success) {
                toast.success('Sign in successful');
                router.push('/');
            }
        } catch (error) {
            console.log(error);
            toast.error('Sign in failed');
        }
    }
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-400 mb-10">Welcome back!</h1>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <InputField name="email" label="Email" type="email" placeholder="johndoe@gmail.com" register={register} error={errors.email} validation={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } }} />

                <InputField name="password" label="Password" type="password" placeholder="Enter your password" register={register} error={errors.password} validation={{ required: 'Password is required' }} />

                <Button className="bg-yellow-500 text-neutral-900 w-full mt-5 h-11 hover:bg-yellow-500/80 cursor-pointer" type="submit" disabled={isSubmitting}> {isSubmitting ? 'Signing In...' : 'Sign In'}</Button>
                <FooterLink text="Don't have an account?" linkText="Sign Up" href="/sign-up" />
            </form>
        </>
    );
};

export default SignIn;