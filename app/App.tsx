'use client';
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import Rightsidebar from "@/components/Rightsidebar";
import { defaultNavElement } from "@/constants";
import { handleCanvasMouseDown, handleCanvaseMouseMove, handleResize, initializeFabric,handleCanvasMouseUp, renderCanvas, handleCanvasObjectModified, handleCanvasSelectionCreated, handleCanvasObjectScaling, handlePathCreated } from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { ActiveElement, Attributes } from "@/types/type";

import { useEffect, useRef, useState } from "react";
export default function Page() {
  const undo=useUndo()
  const redo=useRedo()
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const fabricRef=useRef<fabric.Canvas | null>(null)
  const isDrawing = useRef(false);
  const shapeRef=useRef<fabric.Object | null>(null)
  const activeObjectRef=useRef<fabric.Object |null>(null)
  const selectedShapeRef=useRef<string|null>(null)
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name:"",
    value:"",
    icon:"",
  })
   const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width:'',
    height:'',
    fontSize:'',
    fontFamily:'',
    fontWeight:'',
    fill:'#aabbcc',
    stroke:'#aabbcc',


  })
  const isEditingRef=useRef(false)
  const imageInputRef=useRef<HTMLInputElement>(null);
  const canvasObjects= useStorage((root)=>root.canvasObjects)
  const syncShapeInStorage=useMutation(({storage},object)=>{
    if(!object) return;
    const {objectId}=object;

    const shapeData=object.toJSON();
    shapeData.objectId=objectId;

    const canvasObjects=storage.get('canvasObjects');
    canvasObjects.set(objectId,shapeData)
  },[])
  const deleteAllShapes=useMutation(({storage})=>{
    const canvasObjects= storage.get('canvasObjects')
    if(!canvasObjects || canvasObjects.size===0)
    return true
 // @ts-ignore
    for(const[key,value] of canvasObjects.entries() ){
      canvasObjects.delete(key)
    } 
    return canvasObjects.size
  },[])
  const deleteShapeFromStorage=useMutation(({storage},objectId)=>{
    const canvasObjects= storage.get('canvasObjects');
    canvasObjects.delete(objectId)
  },[])
const handleActiveElement=(elem:ActiveElement)=>{
setActiveElement(elem); 
switch(elem?.value){
  case 'reset':
    deleteAllShapes()
    fabricRef.current?.clear()
    setActiveElement(defaultNavElement);
    break

case 'delete':
  handleDelete(fabricRef.current as any,deleteShapeFromStorage)
  setActiveElement(defaultNavElement)
  break;
  case 'image':
    imageInputRef.current?.click();
    isDrawing.current=false;
    if(fabricRef.current){
      fabricRef.current.isDrawingMode=false;
    }
    break
}
selectedShapeRef.current=elem?.value as string;
}
  useEffect(() => {
    const canvas=initializeFabric({canvasRef,fabricRef})
  canvas.on("mouse:down",(options)=>{
    handleCanvasMouseDown({options,canvas,isDrawing,shapeRef,selectedShapeRef})
  })
  canvas.on("mouse:move",(options)=>{
    handleCanvaseMouseMove({options,canvas,isDrawing,shapeRef,selectedShapeRef,syncShapeInStorage})
  })
  canvas.on("mouse:up",()=>{
    handleCanvasMouseUp({canvas,isDrawing,shapeRef,selectedShapeRef,syncShapeInStorage,setActiveElement,activeObjectRef})
  })
  window.addEventListener("resize",()=>{
     // @ts-ignore
    handleResize({fabricRef})
  })
 canvas.on("object:modified",(options)=>{
handleCanvasObjectModified({
  options,syncShapeInStorage
})
canvas.on("object:scaling",(options)=>{
  handleCanvasObjectScaling({
    options,
    setElementAttributes,
  })
})
canvas.on("path:created",(options)=>{
  handlePathCreated({
    options,
    syncShapeInStorage,
  })
})
canvas.on('selection:created',(options)=>{
 handleCanvasSelectionCreated({options,isEditingRef,setElementAttributes}) 
})
window.addEventListener("keydown",(e:KeyboardEvent)=>{
  handleKeyDown({
    e,
    canvas:fabricRef.current,
    redo,
    undo,
    syncShapeInStorage,
    deleteShapeFromStorage
  })
})
})
window.addEventListener("keydown",(e:KeyboardEvent)=>{
if(e.keyCode===46){
  setActiveElement({
    icon: "/assets/delete.svg",
    value: "delete",
    name: "Delete",
  })
  handleDelete(fabricRef.current as any,deleteShapeFromStorage)
  setTimeout(() => {
    setActiveElement(defaultNavElement)
  }, 500);
}

})
window.addEventListener("keydown",(e:KeyboardEvent)=>{
if(e.ctrlKey && e.keyCode===82){
  e.preventDefault()
  setActiveElement({
    icon: "/assets/rectangle.svg",
    name: "Rectangle",
    value: "rectangle",
  })
  selectedShapeRef.current="rectangle"
}
})

 return ()=>{
  canvas.dispose()
 }  }, [])
  useEffect(() => {
    
  renderCanvas({
    fabricRef,canvasObjects,activeObjectRef
  })
    
  }, [canvasObjects])
  
  return (
    <main className="h-screen overflow-hidden ">
      <Navbar activeElement={activeElement} handleActiveElement={handleActiveElement} imageInputRef={imageInputRef} handleImageUpload={(e:any)=>{
        e.stopPropagation();
        handleImageUpload({
          file:e.target.files[0],
          canvas:fabricRef as any,
          shapeRef,
          syncShapeInStorage
        })
      }}></Navbar>
      <section className="flex h-full flex-row">
        <LeftSidebar activeObjectRef={activeObjectRef} allShapes={Array.from(canvasObjects)}/>
      <Live canvasRef={canvasRef} undo={undo} redo={redo}></Live>
      <Rightsidebar elementAttributes={elementAttributes} setElementAttributes={setElementAttributes} fabricRef={fabricRef} isEditingRef={isEditingRef} activeObjectRef={activeObjectRef} syncShapeInStorage={syncShapeInStorage}/>
      </section>
      </main>
  );
}