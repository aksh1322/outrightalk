import React, { useEffect} from 'react'
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';

function SideBarBanner() {
    const toast = useToaster()
    useEffect(() => {

    }, [])
    return (
        <div className="btm-ad">
            <img src="/img/MainWindow.png" />
        </div>
    )
}

export default SideBarBanner
