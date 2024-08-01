import React from 'react'
import { Form } from 'react-bootstrap'
import Dropzone from 'react-dropzone'


interface FormDropZoneInputProps {
    onChange: (...args: any) => void;
    name?: any;
    value?: any;
    inputRef?: any;
    error?: any;
    id?: string;
}

const onHandleChange = (val: any,onChange: (...args: any) => void) => {

    onChange(val[0])

}

function FormDropzone({
    onChange,
    value,
    name,
    inputRef,
    error,
    id,
}: FormDropZoneInputProps) {
    return (
        <React.Fragment>
            <Dropzone onDrop={acceptedFiles => onHandleChange(acceptedFiles,onChange)}>
                {({ getRootProps, getInputProps }) => (                   
                    <section>
                        <div {...getRootProps()}>
                            {/* <input {...getInputProps({ onChange })} /> */}
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                    </section>
                )}
            </Dropzone>

            {
                error && error.message ? <>
                    <Form.Control.Feedback type="invalid" >
                        {error.message}
                    </Form.Control.Feedback>
                </> : null
            }
        </React.Fragment>
    )
}

export default FormDropzone
