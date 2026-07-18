"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser, loginUser, loginWithGoogle } from "@/lib/auth";

// Zod Schemas for Validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize Forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  // Handle Redirection based on Role
  const handleRedirect = (role: string | undefined) => {
    if (role === "admin") {
      router.push("/admin-dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  // Submit Handlers
  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const res = await loginUser(values.email, values.password);
    setLoading(false);
    
    if (res.success) {
      toast.success("Login successful!");
      handleRedirect(res.role);
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  const onRegister = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    const res = await registerUser(values.email, values.password, values.name);
    setLoading(false);
    
    if (res.success) {
      toast.success("Account created successfully!");
      handleRedirect(res.role);
    } else {
      toast.error(res.error || "Registration failed");
    }
  };

  const onGoogleLogin = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    
    if (res.success) {
      toast.success("Logged in with Google!");
      handleRedirect(res.role);
    } else {
      toast.error(res.error || "Google login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      
      {/* Fixed Background Image using Frame 080 */}
      <div 
        className="absolute inset-0 z-[-1] bg-cover bg-center"
        style={{ backgroundImage: "url('/hero_frames/frame_080.jpg')" }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[-1]" />

      <div className="w-full max-w-md bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 mt-16 mb-16 mx-4">
        
        {/* Toggle Login/Register */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"}`}
          >
            Register
          </button>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-white text-center mb-8 tracking-tight">
          {isLogin ? "Welcome to Evora" : "Join Evora"}
        </h2>

        {/* Forms */}
        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Email</label>
              <input {...loginForm.register("email")} type="email" className="w-full border border-white/20 bg-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition" placeholder="you@example.com" />
              {loginForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Password</label>
              <input {...loginForm.register("password")} type="password" className="w-full border border-white/20 bg-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition" placeholder="••••••••" />
              {loginForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-cyan-400 text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-50 mt-4">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Full Name</label>
              <input {...registerForm.register("name")} type="text" className="w-full border border-white/20 bg-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition" placeholder="John Doe" />
              {registerForm.formState.errors.name && <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Email</label>
              <input {...registerForm.register("email")} type="email" className="w-full border border-white/20 bg-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition" placeholder="you@example.com" />
              {registerForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Password</label>
              <input {...registerForm.register("password")} type="password" className="w-full border border-white/20 bg-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition" placeholder="••••••••" />
              {registerForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <input {...registerForm.register("confirmPassword")} type="password" className="w-full border border-white/20 bg-white/5 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition" placeholder="••••••••" />
              {registerForm.formState.errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-cyan-400 text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-50 mt-4">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0c1421] text-white/50 uppercase tracking-widest rounded-full">Or continue with</span>
            </div>
          </div>
          <button
            onClick={onGoogleLogin}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white/5 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition shadow-sm disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.74 17.56V20.3H19.3C21.38 18.38 22.56 15.58 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.3 20.3L15.74 17.56C14.75 18.23 13.48 18.64 12 18.64C9.13 18.64 6.7 16.7 5.81 14.12H2.13V16.96C3.96 20.59 7.68 23 12 23Z" fill="#34A853"/>
              <path d="M5.81 14.12C5.58 13.44 5.45 12.73 5.45 12C5.45 11.27 5.58 10.56 5.81 9.88V7.04H2.13C1.38 8.54 0.95 10.23 0.95 12C0.95 13.77 1.38 15.46 2.13 16.96L5.81 14.12Z" fill="#FBBC05"/>
              <path d="M12 5.36C13.62 5.36 15.06 5.92 16.2 7.01L19.37 3.84C17.45 2.05 14.97 1 12 1C7.68 1 3.96 3.41 2.13 7.04L5.81 9.88C6.7 7.3 9.13 5.36 12 5.36Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

      </div>
    </div>
  );
}
