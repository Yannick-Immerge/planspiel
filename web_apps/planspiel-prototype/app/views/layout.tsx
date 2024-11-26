'use client'
import { useState } from 'react';
import clsx from 'clsx';

export default function Layout({ children }: { children: React.ReactNode }) {

    const [state, setState] = useState(0)

    function handleContract() {
        setState((state + 1) % 2)
        console.log(state)
    }

    return (
        <div>
            <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                <div className={clsx(
                    "bg-red-500", {
                        "hidden": state === 1,
                        "w-full flex-none md:w-64": state === 0
                    }
                )}>
                </div>
                <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                    <button onClick={handleContract}>TOGGLE SIDE</button>
                    {children}
                </div>
            </div>
        </div>
    );
}