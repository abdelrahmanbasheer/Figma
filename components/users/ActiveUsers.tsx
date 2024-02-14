import React, { useMemo } from 'react'
import { Avatar } from './Avatars';
import { useOthers, useSelf } from '@/liveblocks.config';
import styles from "./index.module.css"
import { generateRandomName } from '@/lib/utils';

const ActiveUsers = () => {

        const others = useOthers();
        const currentUser = useSelf();
        const hasMoreUsers = others.length > 3;
      const memoizedUsers=useMemo(()=>{
        return(
          <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex pl-3">
          {currentUser && (
                <Avatar  name="You" otherStyles="border-[3px] border-primary-green" />
            )}
               {others.slice(0, 2).map(({ connectionId }) => (
        <Avatar
          key={connectionId}
          name={generateRandomName()}
          otherStyles='-ml-3'
        />
      ))}
    
            {hasMoreUsers && <div className={styles.more}>+{others.length - 3}</div>}
    
            
          </div>
        </div>
        )
      },[others.length])

      return memoizedUsers;
}

export default ActiveUsers