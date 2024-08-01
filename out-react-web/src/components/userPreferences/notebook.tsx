import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { useToaster } from "src/_common/hooks/actions/common/appToasterHook";
import CheckboxInput from "src/_common/components/form-elements/checkboxinput/checkboxInput";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";

// const FileSavingSettingSchema = yup.object().shape({

// })

function NoteBookSetting() {
  const {
    watch,
    register,
    control,
    setValue,
    getValues,
    reset,
    handleSubmit,
    errors,
  } = useForm<any>({
    // resolver: yupResolver(FileSavingSettingSchema),
    defaultValues: {
      keep_notebook_on_top_window: false,
      permit_other_view_notes: false,
      permit_other_edit_notes: false,
    },
  });
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector();
  const toast = useToaster();

  const onSubmit = (values: any) => {
    let params = {
      keep_notebook_on_top_window: values.keep_notebook_on_top_window ? 1 : 0,
      permit_other_view_notes: values.permit_other_view_notes ? 1 : 0,
      permit_other_edit_notes: values.permit_other_edit_notes ? 1 : 0,
    };

    preference.callSaveUserPreference(
      params,
      (message: string, resp: any) => {
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      for (let i = 0; i < preferenceSelector.list.length; i++) {
        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val);
        }
      }
    }
  }, [preferenceSelector]);

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner all_note">
        <h3>NoteBook</h3>
        <form
          className="form-horizontal"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* <div className="form-group">
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
              <Controller
                control={control}
                name="keep_notebook_on_top_window"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <CheckboxInput
                    name={name}
                    onChange={onChange}
                    classname="custom-control-input"
                    onBlur={onBlur}
                    value={value}
                    id="keep-notebook-on-top-window"
                    inputRef={ref}
                    label="Keep my NoteBooks on top off all windows."
                    error={errors.keep_notebook_on_top_window}
                  />
                )}
              />
            </div>
          </div> */}
          <div className="permits-other">
            <span>Permit others to:</span>
            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="permit_other_view_notes"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="permit_other_view_notes"
                      inputRef={ref}
                      label="View my notes"
                      error={errors.permit_other_view_notes}
                      disabled={true}
                    />
                  )}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
                <Controller
                  control={control}
                  name="permit_other_edit_notes"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <CheckboxInput
                      name={name}
                      onChange={onChange}
                      classname="custom-control-input"
                      onBlur={onBlur}
                      value={value}
                      id="permit-other-edit-notes"
                      inputRef={ref}
                      label="Edit my notes"
                      error={errors.permit_other_edit_notes}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="d-flex mt-3">
              <button
                type="submit"
                className="btn theme-btn btn-primary mr-2 waves-effect"
              >
                Apply
              </button>
              {/* <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button> */}
            </div>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

export default NoteBookSetting;
