import React, { ReactElement, FormEventHandler } from 'react'

interface InputParameters {
  onKeyDown: React.KeyboardEventHandler,
  describedby: string,
  onChange: React.ChangeEventHandler<HTMLInputElement>, 
  type:string, 
  placeholdertext: string, 
  value: string,
  validInput?: boolean | undefined, 
  userFocus?: boolean | undefined,
  icon?: React.ReactElement | undefined, 
  onFocus?: React.Dispatch<React.SetStateAction<boolean>> | undefined, 
  onBlur?: React.Dispatch<React.SetStateAction<boolean>> | undefined,
  correction?: string | undefined
}

export function TextEingabe (props: InputParameters) : React.ReactElement {

  return (
    <div>
    <div className="text-left flex">
      <div className='translate-y-[25%] ml-3 mr-3'>{props.icon}</div>
      <input
            className="p-2 placeholder:text-[#ffffff66] bg-[#10000020] pl-4 input w-full rounded-full text-sky-100" 
            onKeyDown={props.onKeyDown}
            id={props.describedby}
            type={props.type}
            autoComplete="off"
            onChange={props.onChange} 
            required
            aria-invalid={props.validInput ? "false" : "true"}
            aria-describedby={props.describedby}
            onFocus={() => props.onFocus}
            onBlur={() => props.onBlur}
            value={props.value} 
            placeholder={props.placeholdertext} 
            />
      
    </div>
    <div id={props.describedby} className="text-xs pl-5 pr-5 pt-2 ml-8 text-amber-300">
        {(!props.validInput && props.value != "")? props.correction : ""}
      </ div>
    </div>
  )
}
