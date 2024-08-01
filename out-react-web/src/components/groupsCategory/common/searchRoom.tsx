import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import { OptionValue } from 'src/_common/interfaces/common';
interface SearchRoomFormProps {
    getParams: (room_name?: string, language?: string) => void
    resetSearchParms: boolean;
    fetchLanguageList?: any[];
}
interface SearchFieldFormValues {
    room_name?: string;
    language?: OptionValue | undefined | any;
}

const searchFieldFormSchema = yup.object().shape({
    room_name: yup
        .string(),
    language: yup
        .object()
        .nullable()
})

export default function SearchRoomForm({ getParams, resetSearchParms, fetchLanguageList }: SearchRoomFormProps) {

    const { register, control, setValue, handleSubmit, reset, errors } = useForm<SearchFieldFormValues>({
        resolver: yupResolver(searchFieldFormSchema),
        defaultValues: {
            room_name: '',
            language: undefined
        },
    })

    const onSubmit = (values: SearchFieldFormValues) => {
        getParams(values.room_name, values.language)
    }

    useEffect(() => {
        if (resetSearchParms) {
            reset({
                room_name: '',
                language: ''
            })
        }
    }, [resetSearchParms])

    return (
        <React.Fragment>
            <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row">
                    <div className="col-sm-7">
                        <div className="form-group">
                            <label>Room Name</label>
                            <Controller
                                control={control}
                                name="room_name"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <FormTextInput
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        inputRef={ref}
                                        type="text"
                                        error={errors.room_name}
                                        placeholder="Type Room name..."
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Search by</label>
                            <Controller
                                control={control}
                                name="language"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <SelectInput
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        inputRef={ref}
                                        dark={true}
                                        options={fetchLanguageList ? fetchLanguageList.map((c: any) => ({
                                            value: String(c.id),
                                            label: c.language_title,
                                        })) : []}
                                        error={errors.language}
                                        placeholder="select language"
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="col-sm-2">
                        <button className="btn btn-primary btn-block waves-effect waves-light w-100">Search</button>
                    </div>
                </div>
            </form>
        </React.Fragment>
    )
}