import { useMyPresence, useOthers } from "@/liveblocks.config"
import LiveCursors from "./cursor/LiveCursors"
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState } from "@/types/type";
import { Comments } from "./comments/Comments";
type Props={
  canvasRef:React.MutableRefObject<HTMLCanvasElement |null>
  undo: ()=>void,
  redo:()=>void;
}
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { shortcuts } from "@/constants";

const Live = ({canvasRef,undo,redo}:Props) => {
    const others=useOthers()
    const [{cursor}, updateMyPresence]=useMyPresence();
    const [cursorState, setCursorState] = useState<CursorState>({
        mode:CursorMode.Hidden,
    })
    const handlePointerMove=useCallback((event:React.PointerEvent)=>{
        event.preventDefault();
        const x=event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y=event.clientY-event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({cursor:{x,y}})
    },
    []
    )
    const handlePointerDown=useCallback((event:React.PointerEvent)=>{
        const x=event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y=event.clientY-event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({cursor:{x,y}})
    },
    []
    )
    const handlePointerLeave=useCallback((event:React.PointerEvent)=>{
        setCursorState({mode:CursorMode.Hidden})
        updateMyPresence({cursor:null,message:null})
    },
    []
    )
    useEffect(() => {
      const onKeyUp=(e:KeyboardEvent)=>{
        if(e.key==="/"){
            setCursorState({
                mode:CursorMode.Chat,
                previousMessage:null,
                message:""
            })
        }else if (e.key==="Escape"){
            updateMyPresence({message:""})
            setCursorState({mode:CursorMode.Hidden})
        }
      }
    
      const onKeyDown=(e:KeyboardEvent)=>{
        if(e.key==="/"){
            e.preventDefault();
        }
      }
      window.addEventListener('keyup',onKeyUp)
      window.addEventListener('keydown',onKeyDown)
      return()=>{
        window.removeEventListener('keyup',onKeyUp)
        window.removeEventListener('keydown',onKeyDown)
      }
    }, [updateMyPresence])
    const handleContextMenuClick=useCallback((key:string)=>{
      switch(key){
          case'Undo':
          undo();
          break;

          case'redo':
          redo();
          break;
      }
    },[])
    
  return (

    <ContextMenu>
    <ContextMenuTrigger
    id="canvas"
    onPointerMove={handlePointerMove}
    onPointerLeave={handlePointerLeave}
    onPointerDown={handlePointerDown}
    className="h-[100vh] w-full flex justify-center items-center text-center"
    >
        <canvas ref={canvasRef}></canvas>

         {cursor &&(
          <CursorChat cursor={cursor} cursorState={cursorState} setCursorState={setCursorState} updateMyPresence={updateMyPresence}/>  
         )}
        <LiveCursors></LiveCursors>
        <Comments></Comments>
    </ContextMenuTrigger>

  <ContextMenuContent className="right-menu-content">
  {shortcuts.map((item)=>
    <ContextMenuItem key={item.key} onClick={()=>handleContextMenuClick(item.name)} className="right-menu-item">
      <p>{item.name}</p>
      <p className="text-xs text-primary-grey-300 ">{item.shortcut}</p>
      
    </ContextMenuItem>
  )}
  </ContextMenuContent>

    </ContextMenu>
  )
}

export default Live
