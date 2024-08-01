import React from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import MathType from '@wiris/mathtype-ckeditor5';
// import ClassicEditor from 'ckeditor5-classic-with-mathtype';
import ClassicEditor from 'ckeditor5-custom-build';
interface ckeditorProps {
    value: any;
    error: any;
    inputRef: any;
    name: string;
    isDisabled?: boolean;
    onChange: (...args: any) => void;
    onBlur: (...args: any) => void;
}

const EditorInput = ({ value, error, inputRef, onChange, onBlur, name, isDisabled }: ckeditorProps) => {
    return (
        <>
            <CKEditor
                name={name}
                ref={inputRef}
                disabled={isDisabled}
                editor={ClassicEditor}
                data={value}
                // config={{
                //     // plugins: [ MathType],
                //     toolbar: ['redo','undo','MathType', 'ChemType'],
                //     removePlugins: ['EasyImage', 'MediaEmbed']
                // }}
                config={{
                   
                    toolbar: {
                        items: [
                            'heading', 'MathType', 'ChemType',
                            '|',
                            'bold',
                            'italic',
                            'link',
                            'bulletedList',
                            'numberedList',
                            'imageUpload',
                            'mediaEmbed',
                            'insertTable',
                            'blockQuote',
                            'undo',
                            'redo'
                        ]
                    },
                }}
                onChange={(event: any, editor: any) => {
                    const data = editor.getData();
                    onChange(data)
                }}
                onBlur={(event: any, editor: any) => {
                    const data = editor.getData();
                    onBlur(data)
                }}
            />
            {error?.message ?
                <div className="text-danger">
                    <small>{error?.message}</small>
                </div>
                : null}
        </>
    )
}

export default EditorInput