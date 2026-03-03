import React from "react";
import { Shield, Users, CheckCircle } from "lucide-react";
import SectionWrapper from "../ui/SectionWrapper";

const steps = [
  {
    title: "Create your account",
    desc: "Sign up your hospital and configure departments in under 5 minutes.",
    icon: Shield,
  },
  {
    title: "Import patient data",
    desc: "Easily migrate existing records with our secure bulk import tools.",
    icon: Users,
  },
  {
    title: "Start managing",
    desc: "Assign roles to staff and begin scheduling appointments immediately.",
    icon: CheckCircle,
  },
];

const HowItWorks = () => {
  return (
    <SectionWrapper id="how-it-works" className="bg-white">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Seamless integration into your workflow.
          </h2>
          <p className="text-lg text-slate-500 mb-10">
            Get up and running in minutes, not months. Our platform is designed
            for rapid adoption and minimal training.
          </p>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl transform rotate-3 scale-95 opacity-70"></div>
          <div className="relative bg-slate-900 rounded-2xl p-8 shadow-2xl text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  admin-panel.tsx
                </div>
              </div>
              <div className="font-mono text-sm space-y-2 text-blue-300">
                <p>
                  <span className="text-purple-400">const</span>{" "}
                  <span className="text-yellow-300">hospital</span> ={" "}
                  <span className="text-purple-400">new</span>{" "}
                  <span className="text-blue-300">Hospital</span>({`{`}
                </p>
                <p className="pl-4">
                  <span className="text-sky-300">name</span>:{" "}
                  <span className="text-orange-300">
                    &quot;Central City Clinic&quot;
                  </span>
                  ,
                </p>
                <p className="pl-4">
                  <span className="text-sky-300">efficiency</span>:{" "}
                  <span className="text-orange-300">&quot;100%&quot;</span>,
                </p>
                <p className="pl-4">
                  <span className="text-sky-300">errors</span>:{" "}
                  <span className="text-blue-400">null</span>
                </p>
                <p>{`}`});</p>
                <br />
                <p>
                  <span className="text-slate-400">
                    {"// System ready..."}
                  </span>
                </p>
                <p>
                  <span className="text-green-400">
                    ✓ Optimization complete
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default HowItWorks;
