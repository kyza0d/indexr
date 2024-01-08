"use client"

import React from 'react'
import { Button } from '@/components/Common/Button'
import Window from '@/components/Creation/Window'

export default function Header() {

  const [createWindow, setCreateWindow] = React.useState(false)
  return (
    <header className='w-full py-4'>
      <nav>
        <ul className='ml-auto flex list-none'>
          <Button className='ml-auto'>Explore</Button>
          <Button>Sign up</Button>
          <Button>Login</Button>
          <Button className='border border-1' onClick={() => setCreateWindow(!createWindow)}>Create</Button>
          {createWindow && <Window />}
          <Button>Light/Dark</Button>
        </ul>
      </nav>
    </header>
  )
}
