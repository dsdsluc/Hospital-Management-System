import React from "react";
import TestimonialCard from "../ui/TestimonialCard";
import SectionWrapper from "../ui/SectionWrapper";

const testimonialsData = [
  {
    quote:
      "MediFlow has completely transformed how we handle patient admissions. The efficiency gains are remarkable.",
    author: "Dr. Sarah Jenkins",
    role: "Chief of Surgery, Metro General",
    bg: "bg-white",
  },
  {
    quote:
      "The most intuitive hospital management software I've used in my 20-year career. Simply outstanding.",
    author: "James Wilson",
    role: "Hospital Administrator, St. Mary's",
    bg: "bg-white",
  },
  {
    quote:
      "Patient satisfaction scores increased by 40% after implementing the patient portal features.",
    author: "Elena Rodriguez",
    role: "Head of Nursing, City Health",
    bg: "bg-white",
  },
];

const Testimonials = () => {
  return (
    <SectionWrapper id="testimonials" className="bg-slate-50">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
        Trusted by leading healthcare providers
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonialsData.map((item, idx) => (
          <TestimonialCard
            key={idx}
            {...item}
            avatarIndex={idx}
          />
        ))}
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
