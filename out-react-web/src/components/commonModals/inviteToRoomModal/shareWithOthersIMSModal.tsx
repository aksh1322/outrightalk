import React, { useState } from "react";
import { Modal } from "react-bootstrap";

interface ShareWithOthersIMSModalProps {
  onClose: () => void;
  shouldShow: boolean;
  getParams: (selections: string[]) => void;
}

export default function ShareWithOthersIMSModal({
  onClose,
  shouldShow,
  getParams,
}: ShareWithOthersIMSModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleCheckboxChange = (option: string) => {
    const updatedSelections = selectedOptions.includes(option) ? [] : [option];
    setSelectedOptions(updatedSelections);
  };
  const handleSend = () => {
    getParams(selectedOptions);
  };
  
  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        keyboard={false}
        className="sendvoicemail send-video-message theme-custom-modal"
        size="lg"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <div className="modal-logo d-flex justify-content-center w-100">
            <h2>Share with other IMs</h2>
            <button type="button" className="close" onClick={onClose}>
              <i className="modal-close"></i>
            </button>
          </div>
        </Modal.Header>
        <Modal.Body bsPrefix={"sendvoice-mail"}>
          <div className="modal-body pl-0 pr-0">
            <div className="manage-video-message-panel">
              <form>
                <div className="row">
                  <div className="col-sm-12">
                    <div className="d-flex flex-column">
                      <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="checkboxEmail"
                          checked={selectedOptions.includes("email")}
                          onChange={() => handleCheckboxChange("email")}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="checkboxEmail"
                        >
                          Email
                        </label>
                      </div>
                      <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="checkboxGoogle"
                          checked={selectedOptions.includes("google_talk")}
                          onChange={() => handleCheckboxChange("google_talk")}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="checkboxGoogle"
                        >
                          Google Talk
                        </label>
                      </div>
                      <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="checkboxTwitter"
                          checked={selectedOptions.includes("twitter")}
                          onChange={() => handleCheckboxChange("twitter")}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="checkboxTwitter"
                        >
                          Twitter
                        </label>
                      </div>
                      <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="checkboxFacebook"
                          checked={selectedOptions.includes("facebook")}
                          onChange={() => handleCheckboxChange("facebook")}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="checkboxFacebook"
                        >
                          Facebook
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="d-flex">
                      <button
                        type="button"
                        className="btn theme-btn btn-primary mr-2 waves-effect"
                        onClick={handleSend}
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        className="btn theme-btn btn-primary mr-2 waves-effect"
                        onClick={onClose}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
