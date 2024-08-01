// @ts-nocheck
import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import MathType from '@wiris/mathtype-ckeditor5';
// import ClassicEditor from 'ckeditor5-classic-with-mathtype';
import ClassicEditor from "ckeditor5-custom-build";
import { STORAGE, API_URL } from "src/_config";
interface ckeditorProps {
  value: any;
  error: any;
  inputRef: any;
  name: string;
  isDisabled?: boolean;
  onChange: (...args: any) => void;
  onBlur: (...args: any) => void;
  toolbarItems: string[];
}

const EditorInputImage = ({
  value,
  error,
  inputRef,
  onChange,
  onBlur,
  name,
  isDisabled,
  toolbarItems,
}: ckeditorProps) => {
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
          extraPlugins: [MyCustomUploadAdapterPlugin],
          toolbar: {
            items: toolbarItems?.map((x) => x),
            // // [
            // //     'heading',
            // //     // 'MathType', 'ChemType',
            // //     '|',
            // //     'bold',
            // //     'italic',
            // //     // 'link',
            // //     // 'bulletedList',
            // //     // 'numberedList',
            // //     // 'imageUpload',
            // //     // 'mediaEmbed',
            // //     // 'insertTable',
            // //     'blockQuote',
            // //     'undo',
            // //     'redo'
            // // ]
            // items: [
            //     'heading',
            //     '|',
            //     'bold',
            //     'italic',
            //     'link',
            //     'bulletedList',
            //     'numberedList',
            //     '|',
            //     'blockQuote',
            //     'insertTable',
            //     '|',
            //     'imageUpload',
            //     'undo',
            //     'redo'
            //   ]
          },
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        onBlur={(event: any, editor: any) => {
          const data = editor.getData();
          onBlur(data);
        }}
      />
      {error?.message ? (
        <div className="text-danger">
          <small>{error?.message}</small>
        </div>
      ) : null}
    </>
  );
};

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

class MyUploadAdapter {
  constructor(props) {
    // CKEditor 5's FileLoader instance.
    this.loader = props;
    // URL where to send files.
    this.url = API_URL.NOTEBOOK.NOTEBOOK_IMAGE_UPLOAD;
  }

  // Starts the upload process.
  upload() {
    return new Promise((resolve, reject) => {
      this._initRequest();
      this._initListeners(resolve, reject);
      this._sendRequest();
    });
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  // Example implementation using XMLHttpRequest.
  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());
    const token = localStorage.getItem(STORAGE);
    xhr.open("POST", this.url, true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(resolve, reject) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = "Couldn't upload file:" + ` ${loader.file.name}.`;

    xhr.addEventListener("error", () => reject(genericErrorText));
    xhr.addEventListener("abort", () => reject());
    xhr.addEventListener("load", () => {
      const response = xhr.response;
      if (!response || response.error) {
        return reject(
          response && response.error ? response.error.message : genericErrorText
        );
      }

      // If the upload is successful, resolve the upload promise with an object containing
      // at least the "default" URL, pointing to the image on the server.
      resolve({
        default: response.data.url,
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener("progress", (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  // Prepares the data and sends the request.
  _sendRequest() {
    const data = new FormData();

    this.loader.file.then((result) => {
      data.append("notebook_image", result);
      this.xhr.send(data);
    });
  }
}

export default EditorInputImage;
