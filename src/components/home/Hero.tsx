import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import Button from "../ui/Button";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: Telemedicine Integration 2.0
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Healthcare management,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              reimagined.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Streamline hospital operations, enhance patient care, and manage
            appointments effortlessly with the world&apos;s most intuitive HMS
            platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button
              href="/register"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto hover:shadow-blue-500/25 group gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto gap-2 text-slate-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-900"
              >
                <path
                  d="M5 3L19 12L5 21V3Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p>Trusted by 500+ clinics worldwide</p>
          </div>
        </div>

        {/* Hero Image / Dashboard Mockup */}
        <div className="relative mt-12 lg:mt-0">
          <div className="relative rounded-2xl bg-white shadow-2xl border border-slate-200/60 p-2 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-slate-50 to-white z-0"></div>
            {/* Abstract UI Mockup */}
            <div className="relative z-10 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-6 grid grid-cols-12 gap-6 h-[400px]">
                {/* Sidebar */}
                <div className="col-span-2 hidden sm:block space-y-4">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg mb-8"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                  <div className="h-2 w-12 bg-slate-200 rounded"></div>
                  <div className="h-2 w-20 bg-slate-200 rounded"></div>
                  <div className="h-2 w-14 bg-slate-200 rounded"></div>
                </div>
                {/* Main Content */}
                <div className="col-span-12 sm:col-span-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-slate-800 rounded"></div>
                      <div className="h-3 w-48 bg-slate-300 rounded"></div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <div className="h-8 w-8 bg-blue-200 rounded-full mb-3"></div>
                      <div className="h-4 w-16 bg-blue-300 rounded mb-1"></div>
                      <div className="h-3 w-10 bg-blue-200 rounded"></div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <div className="h-8 w-8 bg-purple-200 rounded-full mb-3"></div>
                      <div className="h-4 w-16 bg-purple-300 rounded mb-1"></div>
                      <div className="h-3 w-10 bg-purple-200 rounded"></div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <div className="h-8 w-8 bg-emerald-200 rounded-full mb-3"></div>
                      <div className="h-4 w-16 bg-emerald-300 rounded mb-1"></div>
                      <div className="h-3 w-10 bg-emerald-200 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl h-40 w-full border border-slate-100"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Card */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Appointment Status
                </p>
                <p className="text-sm font-bold text-slate-900">Confirmed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
