"use client";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-full flex">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <Logo size="default" className="mb-10" />
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account</p>

          {/* SSO Buttons */}
          <div className="space-y-2.5 mb-6">
            <button className="flex items-center justify-center gap-3 w-full h-11 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button className="flex items-center justify-center gap-3 w-full h-11 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00A4EF">
                <rect x="1" y="1" width="10" height="10" />
                <rect x="13" y="1" width="10" height="10" />
                <rect x="1" y="13" width="10" height="10" />
                <rect x="13" y="13" width="10" height="10" />
              </svg>
              Continue with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email Form */}
          <div className="space-y-4 mb-6">
            <Input label="Email" type="email" placeholder="jane@company.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
          </div>

          <Button className="w-full" size="lg">
            Sign In
          </Button>

          <div className="flex items-center justify-between mt-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-navy">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-xs text-navy font-medium hover:text-navy-light">
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex w-[480px] bg-navy flex-col items-center justify-center px-16 text-white">
        <div className="max-w-xs">
          <h2 className="text-3xl font-medium tracking-tight mb-4">Intelligent content for newsletters</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Marabel helps you create better newsletter content by understanding your audience, monitoring your sources, and producing content that matches your brand voice.
          </p>
          <div className="mt-10 space-y-4">
            {["AI-powered content suggestions", "Brand voice consistency", "Multi-source monitoring"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
