import React from "react";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  bg?: string;
  avatarIndex?: number;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  bg = "bg-white",
  avatarIndex = 0,
  className = "",
}) => {
  return (
    <div
      className={`${bg} p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col ${className}`}
    >
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="w-4 h-4 text-amber-400 fill-current" />
        ))}
      </div>
      <p className="text-slate-600 mb-6 flex-grow leading-relaxed">
        &quot;{quote}&quot;
      </p>
      <div className="flex items-center gap-4 mt-auto">
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
          <img
            src={`https://i.pravatar.cc/100?img=${avatarIndex + 25}`}
            alt={author}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{author}</p>
          <p className="text-slate-500 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
