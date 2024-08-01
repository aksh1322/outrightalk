import React, { useState, useEffect } from 'react'
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import SweetAlert from 'react-bootstrap-sweetalert';
import clsx from 'clsx';
import { DeleteAccount, RestoreAccount } from 'src/_common/interfaces/ApiReqRes';
import { LOGIN_STORAGE } from 'src/_config';



function MyAccountManage() {

  const userSelector = useAppUserDetailsSelector()
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()
  const [allAccounts, setAllAccounts] = useState<any>([])
  const [isSelected, setIsSelected] = useState<any>()
  const [isDeletedAccount, setIsDeletedAccount] = useState<boolean>(false)
  const [alert, setAlert] = useState<any>(null);

  const hideAlert = () => {
    setAlert(null);
  }

  const getAllAccounts = () => {
    preference.callGetAllAccount((message: string, resp: any) => {
      if (resp && resp.list && resp.list.length) {
        setAllAccounts(resp.list)
      }
    }, (message: string) => {
      toast.error(message)
    })
  }

  const handleSelectUser = (e: React.MouseEvent, accountName: string, isDeleted: boolean) => {
    e.preventDefault()
    setIsSelected(accountName)
    setIsDeletedAccount(isDeleted)
  }

  const handleRemove = (account: string) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title="Delete Account"
        onConfirm={() => handleDeleteAccount(account)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure want to delete account?
      </SweetAlert>
    );
  }

  const handleDeleteAccount = (account: string) => {

    // preference.callDeleteAccount(params, (message: string, resp: any) => {
    //   if (resp) {
    //     setIsSelected(null)
    //     hideAlert()
    //     getAllAccounts()
    //   }
    // }, (message: string) => {
    //   toast.error(message)
    // })
    let findIndex = allAccounts.findIndex((z: any) => z.nickname === account)
    if (findIndex >= 0) {
      allAccounts[findIndex].isDeleted = true;
      localStorage.setItem(LOGIN_STORAGE.LIST_OF_NICKNAME, JSON.stringify(allAccounts))
      hideAlert()
      getLocalStorageAllAccount()
      setIsSelected(null)
      setIsDeletedAccount(false)
    }

  }

  const getLocalStorageAllAccount = () => {
    var retrievedData = localStorage.getItem(LOGIN_STORAGE.LIST_OF_NICKNAME);
    var nickNameList = retrievedData ? JSON.parse(retrievedData) : [];
    setAllAccounts(nickNameList)
  }

  const handleRestoreAccount = (account: string) => {
    let findIndex = allAccounts.findIndex((z: any) => z.nickname === account)
    if (findIndex >= 0) {
      allAccounts[findIndex].isDeleted = false;
      localStorage.setItem(LOGIN_STORAGE.LIST_OF_NICKNAME, JSON.stringify(allAccounts))
      hideAlert()
      getLocalStorageAllAccount()
      setIsSelected(null)
      setIsDeletedAccount(false)
    }
  }

  useEffect(() => {
    // getAllAccounts()
    getLocalStorageAllAccount()
  }, [])

  return (
    <React.Fragment>
      {alert}
      <div className="right-menu-details dark-box-inner all_account_sec">
        <h3>Manage My Accounts</h3>
        <div className="row">
          <div className="col-md-12 my-account-outer">
            <ul className="my-account-list">
              {allAccounts && allAccounts.length ? allAccounts.map((account: any, index: number) =>

                <li
                  key={index}
                  className={isSelected === account.nickname ? 'selected' : ''}
                >
                  {/* <a href="#" onClick={(e) => handleSelectUser(e, account.id, account.deleted_at)} className={
                    clsx({
                      'disable-link': account.id === (userSelector && userSelector.id)
                    })
                  }> */}
                  <a href="#" onClick={(e) => handleSelectUser(e, account.nickname, account.isDeleted)}>
                    {
                      // account.username
                      account.isDeleted ? <span className="text-line-through">{account.nickname}</span> : account.nickname
                    }
                  </a>
                </li>

              ) : <li>No Account Found Yet</li>
              }
            </ul>
          </div>
          <div className="col-md-12">
            <div className="form-group pr_btn">
              <button type="button"
                disabled={(isSelected ? false : true) || isDeletedAccount}
                className="btn theme-btn btn-primary mb-2 waves-effect del"
                onClick={() => handleRemove(isSelected)}>
                Delete
              </button>


              <button type="button"
                disabled={!isDeletedAccount}
                className="btn theme-btn btn-primary mb-2 waves-effect"
                onClick={() => handleRestoreAccount(isSelected)} >
                Undo
              </button>
            </div>
          </div>
        </div>

        <div className="row inner_ac_text">
          <div className="col-md-12">
            <p>Select a nickname from the list and press Delete button</p>
            <span>Note:</span>
            <p> Deleting any account from this list will delete its saved password also from this computer.</p>
            <p> please be sure to keep this information in a safe place in case you need to use it in the future.</p>
          </div>
        </div>



      </div>
    </React.Fragment >
  )
}

export default MyAccountManage
