"use client";
import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price?: string;
  priceDescription?: string;
  description: string;
  features?: string[];
  buttonText: string;
  isPopular?: boolean;
  className?: string;
}

const cardVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -5,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  ({ className, title, price, priceDescription, description, features, buttonText, isPopular = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        className={cn(
          "relative flex flex-col justify-between rounded-2xl border p-6 glass-card",
          isPopular && "border-blue-500 border-2 shadow-lg shadow-blue-500/10",
          className
        )}
        {...props}
      >
        {isPopular && (
          <div className="absolute -top-3 right-4">
            <span className="gradient-animated text-white text-xs px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 font-medium">הכי פופולרי</span>
          </div>
        )}
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {price && (
              <div className="mt-2">
                <span className={`text-4xl font-extrabold ${isPopular ? 'gradient-text' : ''}`}>{price}</span>
                {priceDescription && <p className="text-sm text-gray-500">{priceDescription}</p>}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm">{description}</p>
          {features && (
            <ul className="space-y-2.5 pt-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6">
          <Button className={cn("w-full", isPopular && "btn-premium text-white")}
            variant={isPopular ? "default" : "outline"}>
            {buttonText}
          </Button>
        </div>
      </motion.div>
    );
  }
);
PricingCard.displayName = "PricingCard";

export { PricingCard };
