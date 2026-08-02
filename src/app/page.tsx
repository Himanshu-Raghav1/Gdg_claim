import { Suspense } from "react";
import ClaimPage from "@/components/ClaimPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <ClaimPage />
    </Suspense>
  );
}
