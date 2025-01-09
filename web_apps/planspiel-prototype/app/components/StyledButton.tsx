import {ReactNode} from "react";

export default function StyledButton({children, onClickAction} : {children: ReactNode, onClickAction: () => void}) {
    return <button className="m-auto px-6 py-3 bg-sky-500 text-white font-semibold rounded-full shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition ease-in-out duration-300"
                   onClick={onClickAction}>{children}</button>
}