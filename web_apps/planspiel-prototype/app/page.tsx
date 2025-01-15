"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.push("/login");
  }, []);
    
  return (
    <main>
        <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            
        </div>
    </main>
  )
}
