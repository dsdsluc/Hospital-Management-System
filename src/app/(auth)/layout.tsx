import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">MediFlow</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">
              Manage your hospital with confidence.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Join thousands of healthcare providers who trust MediFlow to streamline operations, enhance patient care, and improve efficiency.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400">
              MK
            </div>
            <div>
              <p className="font-medium text-white">Dr. Michael Kim</p>
              <p className="text-sm text-slate-400">Chief of Medicine, City Hospital</p>
            </div>
          </div>
          <p className="text-slate-300 italic">
            &quot;The most intuitive healthcare platform we&apos;ve ever used. It transformed our daily workflow completely.&quot;
          </p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
            {children}
        </div>
      </div>
    </div>
  );
}
