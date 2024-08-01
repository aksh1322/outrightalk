import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import moment from "moment";
import { useParams } from "react-router";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import {
  CRYPTO_SECRET_KEY,
  DATE_ALL_FORMAT,
  TIME_CONFIG,
  calculateMinTime,
} from "src/_config";
import {
  useAppRoomAdminControlSelector,
  useAppRoomDetailsSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import TimePicker from "src/_common/components/form-elements/timePicker/timePicker";
import SelectInput from "src/_common/components/form-elements/selectinput/selectInput";
import DateInput from "src/_common/components/form-elements/datepicker/dateInput";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface BanUserWithAdminActivityProps {
  getRoomAdminControl: () => void;
}

const BanUserSchema = yup.object().shape({
  banuser: yup
    .object()
    .shape({
      value: yup.string().required("This field is required"),
    })
    .nullable()
    .required("This field is required"),
  bandate: yup.string().when("unlimited", (unlimited: any) => {
    if (!unlimited) return yup.string().required("Date required");
  }),
  bantime: yup.string().when("unlimited", (unlimited: any) => {
    if (!unlimited) return yup.string().required("Time required");
  }),
});

// const calculateMinTime = (date: any) => {
//     let isToday = moment(date).isSame(moment(), 'day');
//     if (isToday) {
//         let nowAddOneHour = moment(new Date()).add({ minutes: 10 }).toDate();
//         return nowAddOneHour;
//     }
//     return moment().startOf('day').toDate();
// }

export default function BanUserWithAdminActivity({
  getRoomAdminControl,
}: BanUserWithAdminActivityProps) {
  const { register, control, watch, setValue, handleSubmit, errors } = useForm({
    resolver: yupResolver(BanUserSchema),
    defaultValues: {
      banuser: "",
      unlimited: false,
      bandate: "",
      bantime: "",
    },
  });

  const roomDetailsSelector = useAppRoomDetailsSelector();

  const roomAdminControl = useAppRoomAdminControlSelector();
  const groupCategoryApi = useGroupCategoryApi();
  const { roomId } = useParams<any>();
  const [alert, setAlert] = useState<any>(null);
  const room_id: number = parseInt(cryptr.decrypt(roomId));
  // const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [minTime, setMinTime] = useState(calculateMinTime(new Date()));
  const [fieldDisabled, setFieldDisabled] = useState(false);

  const hideAlert = () => {
    setAlert(null);
  };
  const handleDeleteBannedUsers = (e: any) => {
    e.preventDefault();
    //sweetalert confirmation here and call delete function
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
        title="Remove Banned Users"
        onConfirm={() => deleteBannedUsers()}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        Are you sure want to remove banned user lists?
      </SweetAlert>
    );
  };

  const deleteBannedUsers = () => {
    // console.log('delete Banned users called')
  };

  const onSubmit = (values: any) => {
    const params = {
      room_id: room_id,
      user_id: [parseInt(values.banuser.value)],
      is_unlimited_banned: values.unlimited ? 1 : 0,
      ban_date: values.unlimited
        ? null
        : values.bandate
          ? moment(values.bandate).format(DATE_ALL_FORMAT.MOMENT_FORMAT)
          : null, //07 / 20 / 2021
      ban_time: values.unlimited
        ? null
        : values.bantime
          ? moment(values.bantime).format(TIME_CONFIG.TIME_FORMAT)
          : null, //'03: 30 PM
    };

    groupCategoryApi.callApplyBannedToUsers(
      params,
      (message: string, resp: any) => {
        toast.success(message);
        getRoomAdminControl();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleBanDateChange = (e: any) => {
    setValue("bantime", "");
    setMinTime(calculateMinTime(e));
  };
  const watchUnlimited = watch("unlimited");
  useEffect(() => {
    if (watchUnlimited) {
      setValue("bandate", "");
      setValue("bantime", "");
      setFieldDisabled(true);
    } else {
      setFieldDisabled(false);
    }
  }, [watchUnlimited]);

  useEffect(() => {
    if (
      errors &&
      (errors.hasOwnProperty("bandate") || errors.hasOwnProperty("bantime"))
    ) {
      toast.error("Please, enter a valid expiration and try again!");
    }
  }, [errors]);

  return (
    <React.Fragment>
      {alert}

      {/* {[1, 3].includes(roomDetailsSelector.room.join_status.is_admin) && ( */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row">
          <div className="col-sm-12 check-adjust">
            {/* <div className="form-group"> */}

            <div className="row">
              <div className="col-sm-4">
                <div className="form-group">
                  <label>30 Last Users just left the Room</label>
                  <Controller
                    control={control}
                    name="banuser"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <SelectInput
                        // name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        dark={true}
                        isDisabled={![1, 3].includes(roomDetailsSelector.room.join_status.is_admin)}
                        options={
                          roomAdminControl &&
                            roomAdminControl.just_left_users &&
                            roomAdminControl.just_left_users.length
                            ? roomAdminControl.just_left_users.map(
                              (c: any) => ({
                                value: String(c.details.id),
                                label: c.details.username,
                              })
                            )
                            : []
                        }
                        error={errors.banuser}
                        placeholder="Select user"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="col-sm-3">
                <div className="form-group">
                  <label>Ban Date</label>
                  {/* <input type="date" className="form-control" placeholder="Enter Date" /> */}
                  <Controller
                    control={control}
                    name="bandate"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <DateInput
                        // name={name}
                        onChange={(e) => {
                          onChange(e);
                          handleBanDateChange(e);
                        }}
                        onBlur={onBlur}
                        value={value}
                        disabled={fieldDisabled ? true : ![1, 3].includes(roomDetailsSelector.room.join_status.is_admin)}
                        minDate={new Date()}
                        dateFormat={DATE_ALL_FORMAT.DATE_PICKER_FORMAT}
                        inputRef={ref}
                        error={errors.bandate}
                        placeholder="Ban date"

                      />
                    )}
                  />
                </div>
              </div>
              <div className="col-sm-3">
                <div className="form-group">
                  <label>Ban Time</label>
                  {/* <input type="time" className="form-control" placeholder="Enter Date" /> */}
                  <Controller
                    control={control}
                    name="bantime"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <TimePicker
                        // name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        minTime={minTime}
                        disabled={fieldDisabled ? true : ![1, 3].includes(roomDetailsSelector.room.join_status.is_admin)}
                        inputRef={ref}
                        timeIntervals={TIME_CONFIG.TIME_INTERVALS}
                        error={errors.bantime}
                        placeholder="time"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="col-sm-2">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                  {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor30" />
                                                                <label className="custom-control-label" htmlFor="customCheck-outlinecolor30"> Unlimited</label> */}
                  <Controller
                    control={control}
                    name="unlimited"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <CheckboxInput
                        name={name}
                        onChange={onChange}
                        classname="custom-control-input"
                        onBlur={onBlur}
                        value={value}
                        id="unlimited"
                        inputRef={ref}
                        label="Unlimited"
                        error={errors.unlimited}
                        disabled={![1, 3].includes(roomDetailsSelector.room.join_status.is_admin)}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 mb-3">
            {/* <a href="javascript:void(0);" className="next-btn waves-effect w-auto">Ban Selected Users</a> */}
            <button className="next-btn waves-effect w-auto" type="submit" disabled={![1, 3].includes(roomDetailsSelector.room.join_status.is_admin)}>
              Ban Selected Users
            </button>
          </div>

          {/* <div className="col-sm-4">
                                                    <a href="#" className="next-btn waves-effect w-auto" style={{ marginTop: '31px' }}>Admins Activities</a>
                                                </div> */}
        </div>
      </form>
      {/* )} */}

      <div className="col-sm-12">
        <h3 className="sub-title">Admins Activities</h3>
      </div>
      <div className="row">
        <div className="col-sm-12 ">
          <div className="list-users-wrap voicemail-table mt-3 mb-4">
            <div
              className="table-responsive mb-0"
              data-pattern="priority-columns"
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Nickname</th>
                    {/* <th>Messages</th> */}
                    <th>Ban Date</th>
                    <th>Expires</th>
                    <th>Given by Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {roomAdminControl &&
                    roomAdminControl.banned_users &&
                    roomAdminControl.banned_users.length ? (
                    roomAdminControl.banned_users.map(
                      (ban: any, index: number) => (
                        <tr key={index}>
                          <td>{ban.details.username}</td>
                          {/* <td>Sed ut perspiciatis unde omnis iste natus error...</td> */}
                          <td>{ban.ban_date}</td>
                          <td>{ban.expire_date}</td>
                          <td>Yes</td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={90}>No List Found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
