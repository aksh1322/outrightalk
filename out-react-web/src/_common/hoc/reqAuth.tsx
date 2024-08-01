import React, { useEffect, useRef, useState } from 'react'
import { Redirect } from 'react-router'
import { URLS } from '../../_config'
import Layout from '../layout/Layout'
import { useAuthStatus } from '../hooks/auth/authHook'
import { useAppUserDetailsSelector } from '../hooks/selectors/userSelector'
import { useIdleTimer } from 'react-idle-timer'
import { UpdateVisibilityStatus } from '../../_common/interfaces/ApiReqRes';
import { useUserApi } from '../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';
import { useAppUserPreferencesSelector } from '../hooks/selectors/userPreferenceSelector'


const requireAuth = (Component: React.ComponentType, role: number = 0) => {


  function AuthHoc(props: any) {
    const isAuth = useAuthStatus()
    const user = useAppUserDetailsSelector()
    const [isIdle, setIsIdle] = useState(false)
    const handleOnActive = () => setIsIdle(false)
    const handleOnIdle = () => setIsIdle(true)

    const userApi = useUserApi()
    const toast = useToaster();
    const preferenceSelector = useAppUserPreferencesSelector();
    const [idleTime, setIdleTime] = useState(1);
    const [value, setValue] = useState("");
    const prevValue = useRef<any>()
    const handleStatusChange = (status: number) => {
      const params: UpdateVisibilityStatus = {
        visible_status: status
      }
      userApi.callUpdateUserVisibilityStatus(params, (message: string, resp: any) => {
        if (resp) {
        } else {
          toast.error(message)
        }
      }, (message: string, resp: any) => {
        toast.error(message)
      })
    }


    useEffect(() => {
      if (
        preferenceSelector &&
        preferenceSelector.list &&
        preferenceSelector.list.length
      ) {
        let setModeIdleAfterMinutesOfInactivityTime = preferenceSelector.list.filter(
          (x: any) => x.key == "minutes_inactivity"
        );

        if (setModeIdleAfterMinutesOfInactivityTime && setModeIdleAfterMinutesOfInactivityTime.length) {
          setIdleTime(parseInt(setModeIdleAfterMinutesOfInactivityTime[0].val))
        }
      }
    }, [preferenceSelector]);

    const timeout = idleTime * 60 * 1000;
    useIdleTimer({
      timeout,
      onActive: handleOnActive,
      onIdle: handleOnIdle
    })

    useEffect(() => {
      const data: any = user?.visible_status;
      setValue(data)
      prevValue.current = value;
    }, [user]);
    useEffect(() => {
      handleStatusChange(isIdle ? 2 : prevValue.current ? prevValue.current :user?.visible_status)
    }, [isIdle])
    /**
     * TODO: add role bases checking here
     */
    return (
      // isAuth && user && user.user_type === role ? <Layout>
      isAuth && user ? <Layout>
        <Component {...props} />
      </Layout> : <Redirect to={URLS.LOGIN} />
    )
  }

  return AuthHoc
}
export default requireAuth
