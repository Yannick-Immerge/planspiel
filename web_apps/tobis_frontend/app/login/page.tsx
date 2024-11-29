import React from 'react'
import TextEingabe from './TextEingabe'
import CredentialsInput from './CredentialsInput'
import Image from 'next/image'
import Background from '../components/BackgroundWrapper'

const LoginPage = async () => {
  return (
    <>
        <Background />
        <CredentialsInput />
    </>
  )
}

export default LoginPage
