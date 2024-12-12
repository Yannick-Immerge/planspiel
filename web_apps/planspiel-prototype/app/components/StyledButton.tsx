import {ReactNode} from "react";

export default function StyledButton({children, onClickAction} : {children: ReactNode, onClickAction: () => void}) {
    return <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition ease-in-out duration-300"
                   onClick={onClickAction}>{children}</button>
}