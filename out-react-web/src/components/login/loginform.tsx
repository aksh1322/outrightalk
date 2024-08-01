import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import {
  CUSTOM_MESSAGE,
  DEVICE_TOKEN,
  DEVICE_TYPE,
  LOGIN_STORAGE,
  STORAGE,
  URLS,
} from "src/_config";
import * as yup from "yup";

interface LoginFormValues {
  nickname: string;
  password: string;
  rememberNickName: boolean;
  loginAutomatically: boolean;
  loginInvisible: boolean;
}

const loginSchema = yup.object().shape({
  nickname: yup.string().required("nickname is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password should have minimum 8 characters")
    .max(20, "Max 20 characters are allowed"),
});

function LoginForm() {
  const userAction = useAppUserAction();
  /**
   * const
   */
  const { control, setValue, getValues, handleSubmit, errors } =
    useForm<LoginFormValues>({
      resolver: yupResolver(loginSchema),
      defaultValues: {
        nickname: "",
        password: "",
        rememberNickName: false,
        loginAutomatically: false,
        loginInvisible: false,
      },
    });
  const [nickNameOptions, setNickNameOptions] = useState<any>([]);
  const userApi = useUserApi();
  const toast = useToaster();
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const [passwordTextToggle, setPasswordTextToggle] = useState("password");
  const [alert, setAlert] = useState<any>(null);
  const [alertTimes, setAlertTimes] = useState<number>(0);

  /**
   * effects
   */
  /**
   * functions
   */

  const showAlert = () => {
    setAlert(
      <SweetAlert
        warning
        confirmBtnText="Ok"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={true}
        title="Alert"
        onConfirm={hideAlert}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Be advised not to Remember your nicknames in a public device or a device
        that is shared with others, that may permit them to login using your
        nicknames.
      </SweetAlert>
    );
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const onSubmit = (values: LoginFormValues) => {
    var params = {
      nickname: values.nickname ? values.nickname : "",
      password: values.password,
      device_type: DEVICE_TYPE.WEB,
      device_token: DEVICE_TOKEN.WEB,
      login_invisible: values.loginInvisible ? 1 : 0,
    };

    userApi.callLogin(
      params,
      (message: string, resp: any) => {
        if (resp) {
          localStorage.setItem(STORAGE, resp.token);
          //Reset to adult checked value
          localStorage.setItem("isAdult", "0");
          if (resp?.user) {
            localStorage.setItem(
              LOGIN_STORAGE.SIGNED_IN_AS,
              JSON.stringify(resp.user)
            );
            localStorage.setItem(
              LOGIN_STORAGE.SIGNED_IN_TOKEN,
              JSON.stringify(resp.token)
            );
          }
          //If nickname is checked then values set to local storage
          localStorage.setItem(
            LOGIN_STORAGE.REMEMBER_NICKNAME,
            String(values.rememberNickName)
          );
          var retrievedData = localStorage.getItem(
            LOGIN_STORAGE.LIST_OF_NICKNAME
          );
          var nickNameList = retrievedData ? JSON.parse(retrievedData) : [];

          if (values.rememberNickName) {
            // let findIndex = nickNameList.indexOf(values.nickname);
            let findIndex = nickNameList.findIndex(
              (x: any) => x.nickname === values.nickname
            );
            if (findIndex === -1) {
              nickNameList.push({
                nickname: values.nickname,
                password: values.password,
                isDeleted: false,
              });
              localStorage.setItem(
                LOGIN_STORAGE.LIST_OF_NICKNAME,
                JSON.stringify(nickNameList)
              );
            }
          } else {
            if (nickNameList && nickNameList.length) {
              // let findIndex = nickNameList.indexOf(values.nickname);
              let findIndex = nickNameList.findIndex(
                (x: any) => x.nickname === values.nickname
              );
              if (findIndex !== -1) {
                nickNameList.splice(findIndex, 1);
                localStorage.setItem(
                  LOGIN_STORAGE.LIST_OF_NICKNAME,
                  JSON.stringify(nickNameList)
                );
              }
            }
          }
          userAction.loggedIn(resp.user, resp.token);
        } else {
          toast.error(message);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    setTimeout(() => {
      let isGetFromChangeAccount = localStorage.getItem("fromChangeAccount");
      if (isGetFromChangeAccount) {
        setValue("nickname", isGetFromChangeAccount);
        localStorage.removeItem("fromChangeAccount");
      }
    }, 550);
  }, []);

  //set value on mount

  useEffect(() => {
    let isSetRemeberNick = localStorage.getItem(
      LOGIN_STORAGE.REMEMBER_NICKNAME
    );
    if (isSetRemeberNick === "true") {
      setValue("rememberNickName", true);
    } else {
      setValue("rememberNickName", false);
    }
  }, []);

  const filterNickNames = () => {
    var retrievedData = localStorage.getItem(LOGIN_STORAGE.LIST_OF_NICKNAME);
    var nickNameList = retrievedData ? JSON.parse(retrievedData) : [];
    var nickNameObjArray = [];
    for (var i = 0; i < nickNameList.length; i++) {
      if (nickNameList[i].isDeleted) {
        //nothing to do
      } else {
        var obj = {
          label: nickNameList[i].nickname,
          value: nickNameList[i].nickname,
          password: nickNameList[i].password,
        };
        nickNameObjArray.push(obj);
      }
    }
    setNickNameOptions(nickNameObjArray);
  };

  // const promiseOptions = (inputValue: any) =>
  //   new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve(filterColors(inputValue));
  //     }, 1000);
  //   });

  const dropDownToggle = () => {
    filterNickNames();
    setTimeout(() => {
      setShowDropDown(!showDropDown);
    }, 200);
  };

  const extractNickName = (nickName: any) => {
    getLoginModeUser(nickName.value);
    setValue("nickname", nickName.value);
    setValue("password", nickName.password);
    setShowDropDown(!showDropDown);
  };

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle === "password") {
      setPasswordTextToggle("text");
    } else {
      setPasswordTextToggle("password");
    }
  };

  const getLoginModeUser = (nickname: string) => {
    let params = {
      nickname: nickname,
    };
    userApi.callGetLoginModeUser(
      params,
      (message: string, resp: any) => {
        if (resp) {
          if (parseInt(resp) === 4) {
            setValue("loginInvisible", true);
          }
        } else {
          toast.error(message);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleOnBlur = () => {
    const nickNameValue = getValues("nickname");
    if (nickNameValue && nickNameValue.trim() !== "") {
      getLoginModeUser(nickNameValue);
    }
  };

  const handleRememberMeChange = (e: any) => {
    if (e && !alertTimes) {
      showAlert();
      setAlertTimes(1);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {alert}
      <div className="pb-3 login_head">
        <h2 className="white-text">
          <span>Welcome to</span> <b>O</b>utrigh<b>T</b>alk!
        </h2>
        {/* <h3 className="white-text">Login</h3> */}
      </div>
      <div className="form-group">
        {/* <Controller
          control={control}
          name="nickname"
          render={({ onChange, onBlur, value, name, ref }) => (
            <AsyncCreatbleSelectInput
              // name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              isClearable={true}
              inputRef={ref}
              options={promiseOptions}
              error={errors.nickname}
              noOptionsMessage='No Nickname Added'
              placeholder="Enter or select a Nickname"
              dark={true}
            />
          )}
        /> */}

        <div className="text-select-wrap">
          {/* <input type="text" className="form-control" /> */}
          <Controller
            control={control}
            name="nickname"
            render={({ onChange, onBlur, value, name, ref }) => (
              <FormTextInput
                // name={name}
                onChange={onChange}
                onBlur={() => {
                  onBlur();
                  handleOnBlur();
                }}
                value={value}
                inputRef={ref}
                type="text"
                error={errors.nickname}
                placeholder="Nickname"
              />
            )}
          />
          {/* <span class="toggle"></span> */}
          {showDropDown ? (
            <button type="button" onClick={dropDownToggle} className="Hide">
              <i className="fa fa-times" />
            </button>
          ) : (
            <button type="button" onClick={dropDownToggle} className="Show">
              <i className="fa fa-angle-down" />
            </button>
          )}
        </div>
        {showDropDown ? (
          <div id="target">
            <ul className="nick-list">
              {nickNameOptions && nickNameOptions.length ? (
                nickNameOptions.map((x: any, index: number) => (
                  <li key={index} onClick={() => extractNickName(x)}>
                    {x.value}
                  </li>
                ))
              ) : (
                <li>No NickName Found</li>
              )}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="form-group">
        <Controller
          control={control}
          name="password"
          render={({ onChange, onBlur, value, name, ref }) => (
            <FormTextInput
              // name={name}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref}
              type={passwordTextToggle}
              error={errors.password}
              placeholder="Password"
            />
          )}
        />
        <span className="eye-password-text" onClick={handlePasswordTextToggle}>
          {passwordTextToggle === "password" ? (
            <i className="fa fa-eye" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-eye-slash" aria-hidden="true"></i>
          )}
        </span>
      </div>
      <div className="form-group">
        {(errors && errors["password"]) || (errors && errors["nickname"]) ? (
          <>
            <Form.Control.Feedback type="invalid">
              {CUSTOM_MESSAGE.LOGIN_FORM.WITHOUT_NICKNAME_PASSWORD}
            </Form.Control.Feedback>
          </>
        ) : null}
      </div>
      <div className="custom-control custom-checkbox">
        <Controller
          control={control}
          name="rememberNickName"
          render={({ onChange, onBlur, value, name, ref }) => (
            <CheckboxInput
              name={name}
              onChange={(e) => {
                handleRememberMeChange(e);
                onChange(e);
              }}
              classname="custom-control-input"
              onBlur={onBlur}
              value={value}
              id="remembernickname"
              inputRef={ref}
              label="Remember Nickname"
              error={errors.rememberNickName}
            />
          )}
        />
      </div>
      <div className="custom-control custom-checkbox">
        <Controller
          control={control}
          name="loginInvisible"
          render={({ onChange, onBlur, value, name, ref }) => (
            <CheckboxInput
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              classname="custom-control-input"
              id="logininvisible"
              value={value}
              inputRef={ref}
              label="Login Invisible"
              error={errors.loginInvisible}
            />
          )}
        />
      </div>
      <div className="custom-control custom-checkbox">
        <Controller
          control={control}
          name="loginAutomatically"
          render={({ onChange, onBlur, value, name, ref }) => (
            <CheckboxInput
              name={name}
              id="loginautomatically"
              classname="custom-control-input"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              inputRef={ref}
              label="Login Automatically"
              error={errors.loginAutomatically}
            />
          )}
        />
      </div>

      <div className="mt-3 d-flex align-items-center login-btn">
        <button
          className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2"
          type="submit"
        >
          Log In
        </button>
        <p className="mb-0">
          Forgot Password?
          {/* <a href="reset-password.html">Reset</a> */}
          <Link className="font-weight-medium" to={URLS.FORGOT_PASSWORD}>
            Reset
          </Link>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;
