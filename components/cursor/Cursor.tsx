import CursorSVG from '@/public/assets/CursorSVG'
import { CursorCompProps } from '@/types/type'
import React from 'react'


const Cursor = ({color,x,y,message}:CursorCompProps) => {
  return (
    <div className='pointer-events-none absolute top-0 left-0 ' style={{transform:`translateX(${x}px) translateY(${y}px)`}}>
    <CursorSVG color={color}/>
    {
      message&&(
        <div className='absolute left-2 top-5 rounded-3xl px-4 py-2'style={{backgroundColor:color}}>
         <p className='text-white whitespace-nowrap text-sm leading-relaxed'>{message}</p> 
        </div>
      )
    }
    </div>
  )
}

export default Cursor