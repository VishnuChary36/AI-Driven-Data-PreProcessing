
import React from "react";
import { Loader } from "lucide-react";
import { Progress } from "../components/ui/progress";

interface ProcessingOverlayProps {
  steps: string[];
  currentStep: number;
  percent: number;
  onCancel?: () => void;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ steps, currentStep, percent }) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-xl border shadow-lg max-w-sm w-full animate-fade-in">
        <Loader className="animate-spin text-purple-500 mb-2" size={48} />
        <div className="w-full text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1">
            Processing Data...
          </div>
          <div className="text-base text-gray-500 mb-3 min-h-[24px]">{steps[currentStep] || ""}</div>
          <Progress value={percent} className="w-full h-2 bg-purple-100" />
          <div className="mt-3 text-sm text-gray-700">
            {percent}% Complete
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;

