import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { OptionValue } from "src/_common/interfaces/common";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import {
  URLS,
  LOGIN_STORAGE,
  STORAGE,
  CRYPTO_SECRET_KEY,
  IS_ADULT,
} from "src/_config";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface LockWordModalProps {
  onClose: () => void;
  shouldShow: boolean;
}

interface LockWordFormValues {
  options: OptionValue | undefined | any;
}

const lockSchema = yup.object().shape({
  options: yup
    .object()
    .nullable()
    .shape({
      value: yup.string().required("Nickname is required"),
    })
    .required("Nickname is required"),
});

export default function ChangeAccount({
  onClose,
  shouldShow,
}: LockWordModalProps) {
  const userApi = useUserApi();
  const history = useHistory();
  const toast = useToaster();
  const userAction = useAppUserAction();
  const groupCategoryAction = useAppGroupCategoryAction();
  const userSelector = useAppUserDetailsSelector();

  const { roomId } = useParams<any>();
  const groupCategoryApi = useGroupCategoryApi();
  const [passwordTextToggle, setPasswordTextToggle] = useState("password");
  const [alert, setAlert] = useState<any>(null);
  const [allAccounts, setAllAccounts] = useState<any>([]);
  const { register, control, setValue, handleSubmit, errors } =
    useForm<LockWordFormValues>({
      resolver: yupResolver(lockSchema),
      defaultValues: {
        options: undefined,
      },
    });

  const hideAlert = () => {
    setAlert(null);
  };

  const showAlert = (values: any) => {
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
        title={"Change Account"}
        onConfirm={() => logoutAndExtraOperation(values)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`You are about to exit OutrighTalk and login as ${values.options.value}
Do you want to proceed?
`}
      </SweetAlert>
    );
  };

  const logoutAndExtraOperation = (values: any) => {
    userApi.callLogout(
      (message: string, resp: any) => {
        if (resp) {
          // localStorage.removeItem(STORAGE);
          // localStorage.setItem("isAdult", "0");
          // localStorage.setItem("fromChangeAccount", values.options.value);
          // groupCategoryAction.emptyRoomListCategoryWise();
          // userAction.logout();
          // history.push(URLS.LOGIN);

          localStorage.removeItem(STORAGE);
          localStorage.removeItem(LOGIN_STORAGE.SIGNED_IN_AS);
          localStorage.removeItem(LOGIN_STORAGE.SIGNED_IN_TOKEN);
          localStorage.removeItem('timeStamp');
          localStorage.setItem(IS_ADULT, "0");
          localStorage.setItem("fromChangeAccount", values.options.value);
          groupCategoryAction.emptyRoomListCategoryWise();
          userAction.logout();
          toast.success("Logged out successfully");
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const onSubmit = (values: LockWordFormValues) => {
    showAlert(values);
  };

  const getLocalStorageAllAccount = () => {
    var retrievedData = localStorage.getItem(LOGIN_STORAGE.LIST_OF_NICKNAME);
    var nickNameList = retrievedData ? JSON.parse(retrievedData) : [];
    setAllAccounts(nickNameList);
  };
  useEffect(() => {
    getLocalStorageAllAccount();
  }, []);
  return (
    <React.Fragment>
      {alert}
      <Modal
        show={shouldShow}
        backdrop="static"
        // onHide={() => onClose()}
        keyboard={false}
        className="sendvoicemail send-video-message theme-custom-modal"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <div className="modal-logo d-flex justify-content-center w-100">
            <img src="/img/logo.png" />
          </div>
        </Modal.Header>
        <Modal.Body bsPrefix={"sendvoice-mail"}>
          <div className="modal-body pl-0 pr-0">
            <div className="manage-video-message-panel">
              <h2>Change Account</h2>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-group">
                  <Controller
                    control={control}
                    name="options"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <SelectInput
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        dark={true}
                        options={allAccounts
                          .filter((x: any) => {
                            return (
                              x.isDeleted == false &&
                              x.nickname !== userSelector?.username
                            );
                          })
                          .map((account: any) => ({
                            value: account.nickname,
                            label: account.nickname,
                          }))}
                        error={errors.options}
                        placeholder="Select"
                      />
                    )}
                  />
                </div>
                <div className="d-flex">
                  <button
                    type="submit"
                    className="btn theme-btn btn-primary mr-2 waves-effect"
                  >
                    Change Account
                  </button>
                  <button
                    type="button"
                    className="btn theme-btn btn-default waves-effect"
                    onClick={() => onClose()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
