import { Zap } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group">
  <div className="animate-[flash_2s_ease_infinite] group-hover:animate-[zap_0.8s_ease]">
    <Zap className="w-10 h-10 text-primary" />
  </div>
</div>
</div>
        </div>

     
        <h2 className="text-2xl font-bold">Welcome to ConnectUs!</h2>
        <p className="text-base-content/60">
            Search the person you want to chat to!
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
