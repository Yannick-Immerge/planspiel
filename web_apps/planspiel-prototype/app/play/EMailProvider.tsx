import React from 'react'
import EMailComponent from './EMailComponent'

const EMailProvider = ({nachname, themen}: {nachname: string, themen: string[]}) => {
  return (
    <div className='mx-5 pt-5'>
      <EMailComponent nachname={nachname} themen={themen}/>
    </div>
  )
}

export default EMailProvider
