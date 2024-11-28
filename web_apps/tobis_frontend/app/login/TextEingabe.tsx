import React from 'react'

const TextEingabe = (props: {onChange: any, type:string, text: string, icon: any, input: string}) => {
  return (
    <div className="text-left">
      <div className="pt-10 pl-14"></div>
      <div className='absolute translate-y-full' style={{color: "#ffffff",right: "3.6rem"}}>{props.icon}</div>
      <input onChange={props.onChange} value={props.input} type={props.type} placeholder={props.text} className="placeholder:text-[#ffffff66] bg-[#10000020] input w-full rounded-full text-sky-100" required/>
    </div>
  )
}

export default TextEingabe
