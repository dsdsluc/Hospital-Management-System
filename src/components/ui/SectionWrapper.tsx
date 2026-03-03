import React from "react";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className = "",
  containerClassName = "",
}) => {
  return (
    <section id={id} className={`py-24 ${className}`}>
      <div className={`max-w-7xl mx-auto px-6 md:px-12 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
