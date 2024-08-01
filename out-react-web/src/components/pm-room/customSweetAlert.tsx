import SweetAlert from "react-bootstrap-sweetalert";
import React from 'react';

const CustomSweetAlert = ({ type, showCancel, confirmBtnText, cancelBtnText, cancelBtnBsStyle, confirmBtnBsStyle, closeOnClickOutside, title, onConfirmFunc, onCancelFunc, innerText }: any) => {
    return (
        < SweetAlert
            type={type}
            showCancel={showCancel}
            confirmBtnText={confirmBtnText}
            cancelBtnText={cancelBtnText}
            cancelBtnBsStyle={cancelBtnBsStyle}
            confirmBtnBsStyle={confirmBtnBsStyle}
            allowEscape={false}
            closeOnClickOutside={closeOnClickOutside}
            title={title}
            onConfirm={onConfirmFunc}
            onCancel={onCancelFunc}
            focusCancelBtn={true}
        >
            {innerText}
        </SweetAlert >
    )
}

export default CustomSweetAlert