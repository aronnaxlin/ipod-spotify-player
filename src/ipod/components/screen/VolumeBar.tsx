import { cn } from "@/lib/utils";

interface VolumeBarProps {
  volume: number;
  isActive: boolean;
}

export function VolumeBar({ volume, isActive }: VolumeBarProps) {
  // Volume is 0.0-1.0
  const widthPercentage = Math.round(volume * 100);

  return (
    <div
      className={cn(
        "absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-white border border-black z-50 flex items-center px-1 transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.2)" }}
    >
      {/* Speaker Icon (Left) */}
      <div className="w-4 h-4 mr-1 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-black">
          <path d="M7 9v6h4l5 5V4l-5 5H7z" />
        </svg>
      </div>

      {/* Progress Bar Container */}
      <div className="flex-1 h-3 border border-black bg-white relative">
        {/* Progress Bar Fill */}
        <div
          className="h-full bg-black transition-[width] duration-100 ease-out"
          style={{ width: `${widthPercentage}%` }}
        />
      </div>

      {/* Speaker Icon (Right - Louder) */}
      <div className="w-4 h-4 ml-1 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-black">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      </div>
    </div>
  );
}
