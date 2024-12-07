import Link from "next/link";
import ProductCard from "./components/ProductCard";

import ClientClickToRedirect from "./components/ClientClickToRedirect";

export default function Home() {
  
  return (
    <main>
        <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            <div className="absolute left-[10%] w-4/5 pt-[5%] flex">
                <div className="w-[60%]">
                    <div className="blurBox">
                        <div className="text-left text-7xl text-lime-600">
                            Heftiges Planspiel, Bro 
                        </div>
                        <div className="flex">
                            <div className="pl-0 text-left text-6xl text-sky-400">
                                Gemeinsam
                            </div>
                        <div>
                            <div className="text-left text-2xl text-sky-400">
                                für eine bessere Diskussionskultur.
                            </div>
                            <div className="text-left text-2xl text-sky-400">
                                gegen den Klimawandel.
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
                <ClientClickToRedirect text="Los geht's!" url="/login"/>
            </div>
        </div>
    </main>
  )
}
