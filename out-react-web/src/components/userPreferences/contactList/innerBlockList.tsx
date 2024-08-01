import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppFindAndAddUserModalOpen } from 'src/_common/hooks/selectors/userSelector';
import SweetAlert from 'react-bootstrap-sweetalert';
import { FIND_AND_ADD_USER_TYPE } from 'src/_config';
import { GetContactBlockListUser } from 'src/_common/interfaces/ApiReqRes';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import { CSVLink, CSVDownload } from "react-csv";
import { useCSVReader } from 'react-papaparse';
import {
  getSubscriptionColor,
} from "src/_config";

const FileSavingSettingSchema = yup.object().shape({
  addedToList: yup
    .object()
    .shape({
      value: yup.string().required('User is required'),
    }).nullable(),
  // .required('User is required'),
  // searchItem: yup
  //   .string()
  //   .required("Nickname Required")
  searchItem: yup
    .object()
    .shape({
      value: yup.string().required('Nickname Required'),
    }).nullable()
    .required('Nickname Required')
})

function InnerBlockListsSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      addedToList: '',
      searchItem: '',
    },
  })

  const { CSVReader } = useCSVReader();
  const userSelector = useAppUserDetailsSelector()
  const userAction = useAppUserAction()
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const findAndAddUserModalOpenSelector = useAppFindAndAddUserModalOpen()
  const toast = useToaster()
  const groupCategoryApi = useGroupCategoryApi()
  const [contactListUsers, setContactListUsers] = useState<any>()
  const [allUsers, setAllUsers] = useState<any>([])
  const [isSelected, setIsSelected] = useState<any>()
  const [isContactSelected, setIsContactSelected] = useState<any>()
  const [alert, setAlert] = useState<any>(null);
  const [allAccounts, setAllAccounts] = useState<any>([])
  const [csvData, setCsvData] = useState<any>([])
  const [selctedAccount, setSelectedAccount] = useState<any>(userSelector?.username)
  const [csvDataUpload, setCsvDataUpload] = useState<any>([])

  const hideAlert = () => {
    setAlert(null);
  }

  const handleSelectUser = (contactId: number) => {
    setIsContactSelected(contactId)
  }

  const handleRemove = (type: string) => {

    let selectedUsers: any[] = [];
    let user = contactListUsers.filter((users: any) => users.block_user_id == isContactSelected)
    if (user && user.length) {
      selectedUsers.push(user.map((contact: any) => contact.customize_nickname && contact.customize_nickname.nickname ? contact.customize_nickname.nickname : (contact && contact.block_user ? contact.block_user.username : '--')))
    }

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
        title="Remove User"
        onConfirm={() => removeFromContactList(type, type === 'single' ? selectedUsers.toString() : null)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {
          type === 'single' ?
            `Are you sure you want to remove (${selectedUsers.toString()}) from your Blocked List?` :
            `Are you sure you want to remove all users from your Blocked List?`
        }
      </SweetAlert>
    );
  }

  const removeFromContactList = (type: string, username: string | null) => {
    hideAlert()
    if (type === 'single') {
      const params = {
        block_user_id: isContactSelected,
        user_id: isSelected
      }

      setIsContactSelected(null)
      groupCategoryApi.callRemoveFromBlockList(params, (message: string, resp: any) => {
        if (resp) {
          toast.success(`${username} has been successfully removed from your Block List`)
          handleChangeAccount({
            label: selctedAccount,
            value: selctedAccount
          })
        }
      }, (message: string) => {
        console.error("Error at remove from contact list");
      })
    }
    else {
      let userArr: number[] = [];
      contactListUsers && contactListUsers.forEach((user: any) => {
        userArr.push(user.id)
      });
      let params = {
        record_id: userArr,
      }
      preference.callRemoveAllBlockUserFromContactList(params, (message: string, resp: any) => {
        toast.success(`All contacts has been successfully removed from your Block List`)
        handleChangeAccount({
          label: selctedAccount,
          value: selctedAccount
        })
      }, (message: string) => {
        toast.error(message)
      })

    }
  }

  const handleOnBlurSearchContactUsers = (value: string) => {
    if (value.trim()) {
      const params: GetContactBlockListUser = {
        nickname: value.trim() ? value.trim() : userSelector?.username
      }
      preference.callGetUserContactBlockList(params, (message: string, respContact: any) => {
        if (respContact && respContact.list && respContact.list.length) {
          setContactListUsers(respContact.list)
          setIsSelected(respContact && respContact.current_user ? respContact.current_user.id : null)

        } else {
          setContactListUsers([])
          setIsSelected(respContact && respContact.current_user ? respContact.current_user.id : null)
          setIsContactSelected(null)
        }
      }, (message: string) => {
        setContactListUsers([])
        setIsSelected(null)
        setIsContactSelected(null)
        toast.error(message)
      })
    }
  }

  const handleAddToContactBlockList = () => {
    if (isSelected) {
      userAction.showFindAndAddUserModal(true, FIND_AND_ADD_USER_TYPE.ADD_BLOCK_USER, isSelected)
    } else {
      userAction.showFindAndAddUserModal(true, FIND_AND_ADD_USER_TYPE.ADD_BLOCK_USER, null)
    }
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

  const handleChangeAccount = (e?: { label: string, value: string }) => {
    if (e && e.value) {
      setSelectedAccount(e.value)
    } else {
      setSelectedAccount(userSelector?.username)
    }

    const params: GetContactBlockListUser = {
      nickname: e && e.value ? e.value : userSelector?.username
    }
    preference.callGetUserContactBlockList(params, (message: string, respContact: any) => {
      if (respContact && respContact.list && respContact.list.length) {
        setContactListUsers(respContact.list)
        setIsSelected(respContact && respContact.current_user ? respContact.current_user.id : null)
        // console.log("List@@@@", respContact.list);
      } else {
        setContactListUsers([])
        setIsSelected(respContact && respContact.current_user ? respContact.current_user.id : null)
        setIsContactSelected(null)
      }
    }, (message: string) => {
      setContactListUsers([])
      setIsSelected(null)
      setIsContactSelected(null)
      toast.error(message)
    })
  }

  useEffect(() => {
    getAllAccounts()
    handleChangeAccount()
  }, [])

  useEffect(() => {
    var foundCurrentAccount = allAccounts && allAccounts.length ? allAccounts.filter((x: any) => x.username == userSelector?.username) : null;
    setValue('searchItem', userSelector?.username && foundCurrentAccount && foundCurrentAccount.length ? { label: foundCurrentAccount[0].username, value: foundCurrentAccount[0].username } : '');
  }, [allAccounts])


  useEffect(() => {
    if(contactListUsers && contactListUsers.length){
      let newList = contactListUsers.map((contact:any) => {
        return {
          Id: contact.id,
          "User Id": contact?.block_user_id,
          "User Name": contact?.block_user?.username,
          // "Email": contact?.block_user?.email
        }
      })
      setCsvData(newList)
    }
  }, [contactListUsers])


  const handleRefreshList = () => {
    handleChangeAccount({
      label: selctedAccount,
      value: selctedAccount
    })
  }

  const addBlocked = (results:any) => {

    var dataToSend:any[] = [];
    results.data.forEach((element:any, index:any) => {
     
      if(index != 0){
        var obj = {
          id : element[0],
          user_id : element[1],
          nickname : element[2],
          // email: element[3]
        }
        dataToSend[index-1] = obj;
      }

    });

    setCsvDataUpload(dataToSend);

    // importContacts
    // handleChangeAccount()

  }

  const callUploadBlocked = () => {
      const params:any = {
        data:csvDataUpload
      }
      preference.callImportBlocked(params, (message: string, resp: any) => {
        handleChangeAccount()

        toast.success('Blocked list imported successfully');

        var a = document.getElementById('remove-file')
        a?.click();

      }, (message: string) => {
      })
  }
  console.log('Blocked List',contactListUsers);

  return (
    <React.Fragment>
      {alert}
      <h3>Manage Block Lists</h3>
      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            {/* <Controller
              control={control}
              name="searchItem"
              render={({ onChange, onBlur, value, name, ref }) => (
                <FormTextInput
                  onChange={onChange}
                  onBlur={() => {
                    onBlur()
                    handleOnBlurSearchContactUsers(value)
                  }}
                  value={value}
                  inputRef={ref}
                  type="text"
                  error={errors.searchItem}
                  placeholder="Search..."
                />
              )}
            /> */}

            <Controller
              control={control}
              name="searchItem"
              render={({ onChange, onBlur, value, name, ref }) => (
                <SelectInput
                  onChange={
                    (e) => {
                      onChange(e)
                      handleChangeAccount(e)
                    }
                  }
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  dark={true}
                  options={allAccounts.length ? allAccounts.map((all: any) => ({
                    value: all.username,
                    label: all.username,
                  })) : []}
                  isDisabled={true}
                  error={errors.searchItem}
                  placeholder="Select.."
                />
              )}
            />
          </div>
        </div>

      </div>
      <div className="row">
        <div className="col-md-12 my-account-outer">
          <ul className="my-account-list">
            {
              contactListUsers && contactListUsers.length ? contactListUsers.map((contact: any, index: number) =>

                <li key={contact.block_user_id}
                  className={isContactSelected === contact.block_user_id ? 'selected' : ''}
                  onClick={() => handleSelectUser(contact.block_user_id)}
                  style={{
                    color: getSubscriptionColor(
                        contact &&
                        contact.block_user &&
                        contact.block_user.is_subscribed
                        ? {
                            ...contact,
                            subscription_info:
                              contact.block_user.is_subscribed,
                            }
                        : null
                    ),
                    }}
                    >

                  {
                    contact.customize_nickname && contact.customize_nickname.nickname ? contact.customize_nickname.nickname : (contact && contact.block_user ? contact.block_user.username : '--')
                  }
                </li>

              ) : <li>No Block List Found Yet</li>}


          </ul>
        </div>
        <div className="col-md-12">
          <div className="form-group">
            <button type="button"
              disabled={isSelected ? false : true}
              className="btn theme-btn btn-primary mr-2 mt-3 waves-effect bt-gr"
              onClick={handleAddToContactBlockList}
            >
              Add
            </button>

            <button type="button"
              disabled={isContactSelected ? false : true}
              className="btn theme-btn btn-primary mr-2 mt-3 waves-effect bt-red"
              onClick={() => handleRemove('single')}>
              Remove
            </button>

            <button type="button"
              disabled={contactListUsers && contactListUsers.length ? false : true}
              className="btn theme-btn btn-primary mr-2 mt-3 waves-effect bt-red"
              onClick={() => handleRemove('all')} >
              Remove All
            </button>
            <button type="button"
              className="btn theme-btn btn-primary mr-2 mt-3 waves-effect bt-bl">
              <CSVLink className="download_button"  filename={"blocked-list.csv"} data={csvData}>Download Blocked</CSVLink>
            </button>
            {/* <button type="button"
              className="btn theme-btn btn-primary mt-3 waves-effect">
              Import
            </button> */}
              <CSVReader
                onUploadAccepted={(results: any) => {
                  addBlocked(results)
              }}
            >
              {({
                getRootProps,
                acceptedFile,
                ProgressBar,
                getRemoveFileProps,
              }: any) => (
                <>
                  <div>
                    <button className="btn theme-btn btn-primary  mt-3 waves-effect" type='button' {...getRootProps()} >
                      Import file
                    </button>
                    <div >
                      {acceptedFile && acceptedFile.name}
                    </div>
                    {
                      acceptedFile?
                      <div>
                        <button  className="btn theme-btn btn-primary  mt-3 mr-2 waves-effect" disabled={acceptedFile?false:true} onClick={callUploadBlocked}>
                          Upload file
                        </button>
                        <button id="remove-file" className="btn theme-btn btn-primary  mt-3 waves-effect" disabled={acceptedFile?false:true} {...getRemoveFileProps()} >
                          Remove file
                        </button>
                      </div>
                    :null
                    }
                  </div>
                  <ProgressBar className="mt-2"/>
                </>
              )}
            </CSVReader>
          </div>
          <p>
            Select a nickname from the list and press the appropiate button
          </p>
        </div>
      </div>


      <div className="text_acc">
        {/* Sharing list will permit you to transfer the contacts list between your own accounts and also with other users. */}
      </div>

      <div className="form-group">
        <div className="d-flex mt-4">
          <button type="button" className="btn theme-btn btn-default waves-effect mr-2" onClick={handleRefreshList}>Refresh</button>
          {/* <button type="button" className="btn theme-btn btn-default waves-effect mr-2">Cancel</button>
          <button type="button" className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button> */}

        </div>
      </div>


    </React.Fragment >
  )
}

export default InnerBlockListsSetting
