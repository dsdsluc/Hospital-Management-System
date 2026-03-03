import React from "react";
import Button from "../ui/Button";

const CTA = () => {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to modernize your hospital?
          </h2>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust MediFlow for
            their daily operations. Start your free 14-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/register"
              variant="secondary"
              size="lg"
              className="border-none shadow-lg hover:-translate-y-1 hover:bg-blue-50 font-bold"
            >
              Get Started Now
            </Button>
            <Button
              href="/contact"
              variant="outline"
              size="lg"
              className="border-slate-700 text-white hover:bg-slate-800 hover:text-white hover:border-slate-700 font-bold"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
