import React, { useEffect} from 'react'
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';

function RoomBanner() {
    const toast = useToaster()
    useEffect(() => {

    }, [])
    return (
        <div className="btm-ad">
            <img src="/img/Room Banner .png" />
        </div>
    )
}

export default RoomBanner
