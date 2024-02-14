import { ColorProps } from "@/types/type";
import { Label } from "../ui/label";


const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: ColorProps) => (
  <div className='flex flex-col gap-3 border-b border-primary-grey-200 p-5'>
    <h3 className='text-[10px] uppercase'>{placeholder}</h3>
    <div
      className='flex items-center gap-2 border border-primary-grey-200'
      onClick={() => {inputRef.current.click();
      
      }}
    >
      <input
        type='color'
        value={attribute}
        ref={inputRef}
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
      />
      <Label className='flex-1'>{attribute}</Label>
     
    </div>
  </div>
);

export default Color;
