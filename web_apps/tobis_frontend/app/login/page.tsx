import React from 'react'
import TextEingabe from './TextEingabe'
import CredentialsChecker from './CredentialsChecker'
import Image from 'next/image'
import BackgroundWrapper from '../components/BackgroundWrapper'

const LoginPage = async () => {
  return (
    <>
        <BackgroundWrapper />
        <CredentialsChecker />
    </>
  )
}

export default LoginPage
