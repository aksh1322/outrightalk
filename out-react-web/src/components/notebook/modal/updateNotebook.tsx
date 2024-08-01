import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// import EditorInputBasic from 'src/_common/components/form-elements/ckTextEditor/ckEditorInputBasic';
import EditorInputImage from "src/_common/components/form-elements/ckTextEditor/ckEditorInputImage";
import FormTextInput from "src/_common/components/form-elements/textinput/formTextInput";
import FormTextAreaInput from "src/_common/components/form-elements/textarea/textareaInput";
import { useNotebookApi } from "src/_common/hooks/actions/notebook/appNotebookApiHook";
import { toast } from "react-toastify";
import { NotebookDetails } from "src/_common/interfaces/ApiReqRes";

interface UpdateNoteProps {
  onClose: () => void;
  onSuccess: () => void;
  noteBookId: number;
  shouldShow: boolean;
}

interface UpdateNoteFormValues {
  title: string;
  description: string;
}

const UpdateNoteSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

export default function UpdateNoteModal({
  onClose,
  shouldShow,
  onSuccess,
  noteBookId,
}: UpdateNoteProps) {
  const notebookApi = useNotebookApi();

  const { register, control, setValue, handleSubmit, errors } =
    useForm<UpdateNoteFormValues>({
      resolver: yupResolver(UpdateNoteSchema),
      defaultValues: {
        title: "",
        description: "",
      },
    });

  const getNotebookDetails = () => {
    const params: NotebookDetails = {
      notebook_id: noteBookId,
    };
    notebookApi.callNotebookDetails(
      params,
      (message: string, resp: any) => {
        if (resp) {
          console.log("callNotebookDetails", resp);
          setValue("title", resp.notebook_title);
          setValue("description", resp.description);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const onSubmit = (values: UpdateNoteFormValues) => {
    var parms = {
      notebook_id: noteBookId,
      notebook_title: values.title,
      description: values.description,
    };
    notebookApi.callUpdateNotebook(
      parms,
      (message: string, resp: any) => {
        if (resp) {
          onSuccess();
          onClose();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    getNotebookDetails();
  }, []);

  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        keyboard={false}
        className="theme-custom-modal"
        size="lg"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h5 className="modal-title mt-0">Update Note</h5>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => onClose()}
          >
            <i className="modal-close" />
          </button>
        </Modal.Header>
        <Modal.Body bsPrefix={"add-new-notebook"}>
          <div className="modal-body pl-0 pr-0">
            <div className="manage-video-message-panel">
              <form
                className="reset-password"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="form-group">
                  <Controller
                    control={control}
                    name="title"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextInput
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        type="text"
                        error={errors.title}
                        placeholder="Enter Notebook Title"
                      />
                    )}
                  />
                </div>
                <div className="form-group">
                  <Controller
                    control={control}
                    name="description"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      // <FormTextAreaInput
                      //     name={name}
                      //     onChange={onChange}
                      //     onBlur={onBlur}
                      //     value={value}
                      //     rows={10}
                      //     inputRef={ref}
                      //     type="textarea"
                      //     error={errors.description}
                      //     placeholder="Description.."
                      // />
                      <EditorInputImage
                        value={value}
                        inputRef={ref}
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        toolbarItems={[
                          "heading",
                          "|",
                          "bold",
                          "italc",
                          "blockQuote",
                          "undo",
                          "redo",
                          "imageUpload",
                        ]}
                        error={errors.description}
                      />
                    )}
                  />
                </div>
                <div className="d-flex">
                  <a
                    href="#"
                    className="btn theme-btn btn-danger waves-effect mr-2"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => onClose()}
                  >
                    Cancel
                  </a>
                  <button
                    type="submit"
                    className="btn theme-btn btn-primary waves-effect"
                  >
                    Update
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
