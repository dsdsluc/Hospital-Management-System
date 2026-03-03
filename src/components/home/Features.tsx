import React from "react";
import { Calendar, Users, Activity, FileText } from "lucide-react";
import FeatureCard from "../ui/FeatureCard";
import SectionWrapper from "../ui/SectionWrapper";

const Features = () => {
  return (
    <SectionWrapper id="features" className="bg-slate-50/50">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-3">
          Powerful Features
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          Everything you need to run a modern hospital.
        </h3>
        <p className="text-lg text-slate-500">
          Designed with doctors, administrators, and patients in mind. A
          complete ecosystem for healthcare excellence.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={Calendar}
          title="Smart Scheduling"
          description="Automated appointment booking with conflict detection and real-time doctor availability."
        />
        <FeatureCard
          icon={Users}
          title="Patient Portal"
          description="Secure access for patients to view records, prescriptions, and lab results anytime."
          delay="md:mt-8"
        />
        <FeatureCard
          icon={Activity}
          title="Doctor Dashboard"
          description="Comprehensive view of daily rounds, patient vitals, and pending tasks in one place."
          delay="md:mt-0 lg:mt-8"
        />
        <FeatureCard
          icon={FileText}
          title="Electronic Records"
          description="HIPAA-compliant digital health records accessible securely from any authorized device."
          delay="md:mt-8 lg:mt-16"
        />
      </div>
    </SectionWrapper>
  );
};

export default Features;
