import React, { ChangeEventHandler, FormEventHandler } from 'react'

const TextEingabe = (props: {
  onKeyDown: React.KeyboardEventHandler,
  describedby: string,
  validInput: boolean , 
  onChange: ChangeEventHandler, 
  type:string, 
  text: string, 
  input: string,
  userFocus: boolean | null,
  icon: React.ReactElement | null, 
  onFocus: React.Dispatch<React.SetStateAction<boolean>> | null, 
  onBlur: React.Dispatch<React.SetStateAction<boolean>> | null,
  correction: string}) => {

  return (
    <div className="text-left">
      <div className="pt-10 pl-14"></div>
      <div className='absolute translate-y-full' style={{color: "#ffffff",right: "4rem"}}>{props.icon}</div>
      <input
            onKeyDown={props.onKeyDown}
            id={props.describedby}
            type={props.type}
            //ref={props.ref}
            autoComplete="off"
            onChange={props.onChange} 
            required
            aria-invalid={props.validInput ? "false" : "true"}
            aria-describedby={props.describedby}
            onFocus={() => props.onFocus}
            onBlur={() => props.onBlur}
            value={props.input} 
            placeholder={props.text} 
            className="placeholder:text-[#ffffff66] bg-[#10000020] input w-full rounded-full text-sky-100" />
      <div id={props.describedby} className="text-xs pl-5 pr-5 pt-2">
        {(!props.validInput && props.input != "")? props.correction : ""}
      </ div>
    </div>
  )
}

export default TextEingabe
