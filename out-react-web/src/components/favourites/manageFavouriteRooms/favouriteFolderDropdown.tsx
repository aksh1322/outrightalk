import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import { OptionValue } from 'src/_common/interfaces/common';
import { useFavouritesApi } from 'src/_common/hooks/actions/favourites/appFavouritesApiHook';
import { toast } from 'react-toastify';

interface FavouriteFolderDropdownProps { 
    favouriteFolders: any;
    getFavouriteRooms: (id:number) => void;
    handleSelectedFolderId: (id:number) => void;
    roomId?: number;
    onClose: (val:boolean) => void;
    selectedFolderId?: number;
}

interface favouriteFolderDropdownValues {
    folder: OptionValue;
}

const favouriteFolderDropdownSchema = yup.object().shape({
    folder: yup
    .object()
    .nullable()
    .required("Folder field is required"),
})

export default function FavouriteFolderDropdown({favouriteFolders, getFavouriteRooms, handleSelectedFolderId, roomId, onClose, selectedFolderId}:FavouriteFolderDropdownProps) {

    const { register, control, setValue, handleSubmit, reset, errors } = useForm<favouriteFolderDropdownValues>({
        resolver: yupResolver(favouriteFolderDropdownSchema),
        defaultValues: {
            folder: {
                value: "1",
                label: "Default"
            }
        },
    })
    const favouritesApi = useFavouritesApi()
    
    const assignRoomToFolder = (folder_id:number) => {
        var params = {
            folder_id:folder_id,
            room_id:roomId
        }
        favouritesApi.callAssignRoomToFolder(params,
            (message:string,resp:any)=>{
                getFavouriteRooms(selectedFolderId?selectedFolderId:1)
                toast.success(message)
            },(message:string)=>{
                toast.error(message)
            }
        )
    }

    const onSubmit = (values: favouriteFolderDropdownValues) => {
        if(roomId){
            assignRoomToFolder(parseInt(values.folder.value))
            onClose(false)
        }
        else{
            getFavouriteRooms(parseInt(values.folder.value))
            handleSelectedFolderId(parseInt(values.folder.value))
        }
    }

    useEffect(() => {
        if(selectedFolderId)
            setValue('folder',{ value: selectedFolderId, label: favouriteFolders && favouriteFolders.find((c: any) => c.id==selectedFolderId)?.folder_name})
    }, [selectedFolderId])

    return (
        <React.Fragment>
            <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row">
                    <div className={roomId?"col-sm-12":"col-sm-6"}>
                        <div className="form-group">
                            <label>{roomId?'Folder':'Search by folder'}</label>
                            <Controller
                                control={control}
                                name="folder"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <SelectInput
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        inputRef={ref}
                                        dark={true}
                                        options={favouriteFolders ? favouriteFolders.map((c: any) => ({
                                            value: String(c.id),
                                            label: c.folder_name,
                                        })) : []}
                                        error={errors.folder}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    {!roomId &&
                    <div className="col-sm-3">
                        <button className="btn btn-primary btn-block waves-effect waves-light w-100">Submit</button>
                    </div>}
                </div>
                {roomId &&
                    <div className="row">
                        <div className="col-sm-12">
                            <button className="btn btn-primary">Submit</button>
                        </div>
                    </div>
                }
            </form>
        </React.Fragment>
    )
}