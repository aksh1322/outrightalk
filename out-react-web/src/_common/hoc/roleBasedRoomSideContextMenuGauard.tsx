import React from 'react'
import { useAppRoomDetailsSelector } from '../hooks/selectors/groupCategorySelector'

interface incommingProps {
  role: number[];
  children: any
}

const RoleBasedContextMenuHOC = ({ role, children }: incommingProps) => {
  const roomDetailsSelector = useAppRoomDetailsSelector()
  // console.log(roomDetailsSelector);

  const checkRole = () => {
    if (!roomDetailsSelector) {
      return false
    }
    else {
      if (roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.join_status) {
        return role.includes(roomDetailsSelector.room.join_status.is_admin) && roomDetailsSelector.room.room_type_id != 2
      }
    } 
  }

  // console.log(checkRole());
  
  return (
    <React.Fragment>
      {checkRole() ? children : null}
    </React.Fragment>
  )
}
export default RoleBasedContextMenuHOC