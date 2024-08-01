import React, { useEffect} from 'react'
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';

function UserPreferencesBannerShow() {
    const toast = useToaster()
    useEffect(() => {

    }, [])
    return (
        <div className="btm-ad">
            <img src="/img/PM Banner and preferences .png" />
        </div>
    )
}

export default UserPreferencesBannerShow
