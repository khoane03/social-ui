import { CircleCheckBig, Info, ShieldCheck, UserRoundPen } from "lucide-react";

const steps = [
  { icon: UserRoundPen, label: "Tài khoản" },
  { icon: Info, label: "Thông tin" },
];

export const Stepper = ({ currentStep = 0 }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-2xl">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const Icon = step.icon;

        return (
          <div key={index} className="flex items-center relative">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ease-out transform
                        ${
                        isCompleted
                            ? "bg-green-500 border-green-500 text-white scale-110 opacity-100"
                            : isActive
                            ? "bg-[#7F9FEF] border-[#7F9FEF] text-white opacity-100"
                            : "bg-gray-200 border-gray-300 text-gray-500 opacity-70"
                        }`}>
              {isCompleted ? (
                <CircleCheckBig
                  size={20}
                  className="transition-transform duration-300 ease-in-out scale-100 animate-fade-in"
                />
              ) : (
                <Icon size={20} />
              )}
            </div>

            {index < steps.length - 1 && (
              <div className="w-15 mx-2">
                <div
                  className={`${
                    isCompleted ? "bg-green-500 animate-process" : "bg-gray-200"
                  } flex-1 rounded-4xl h-1 `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
