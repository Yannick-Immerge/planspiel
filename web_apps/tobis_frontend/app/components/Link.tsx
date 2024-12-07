import React from 'react'

const Link = (props: {linktext: string, adresse: string}) => {
  return (
    <a href={props.adresse} className="text-decoration-line: underline">{props.linktext}</a>
  )
}

export default Link
