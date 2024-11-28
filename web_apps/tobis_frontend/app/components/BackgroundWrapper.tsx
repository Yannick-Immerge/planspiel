import React from 'react'
import Image from 'next/image'

const BackgroundWrapper = () => {
  return (
    <Image className="absolute w-full h-screen" objectFit="cover" src="/images/EarthTint.png" alt="Planet Earth from outer space" layout="fill"/>
  )
}

export default BackgroundWrapper
