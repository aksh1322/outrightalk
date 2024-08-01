import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";

interface TranslationModalProps {
  shouldShow: boolean;
  onClose: () => void;
  pmId: number;
  getParams: any;
}

export default function TranslationModal({
  shouldShow,
  onClose,
  pmId,
  getParams,
}: TranslationModalProps) {
  const commonApi = useCommonApi();
  const [searchTerm, setSearchTerm] = useState<any>("");
  const [allLanguages, setAllLanguages] = useState<any>("");

  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleCheckboxChange = (code: any) => {
    setSelectedLanguage(code);
  };

  useEffect(() => {
    getAllTranslationLanguages();
  }, []);

  const getAllTranslationLanguages = () => {
    var params = {};
    commonApi.callGetAllTranslation(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setAllLanguages(resp.languages);
        }
      },
      (message: string) => {}
    );
  };
  const handleLanguageSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const results = !searchTerm
    ? allLanguages
    : allLanguages &&
      allLanguages.length &&
      allLanguages.filter((el: any) =>
        el.key.toLowerCase().includes(searchTerm.toLocaleLowerCase())
      );

  const handleCloseModal = () => {
    onClose();
  };

  const handleAddLanguage = () => {
    if (selectedLanguage) {
      getParams(selectedLanguage);
      var params = {
        lang_code: selectedLanguage,
      };
      commonApi.callSaveTranslationLanguage(
        params,
        (message: string, resp: any) => {
          handleCloseModal();
        },
        (message: string) => {
          toast.error(message);
        }
      );
    }
  };
  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        keyboard={false}
        className="bs-example-modal-center contact-list-modal theme-custom-modal"
        size="lg"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h5 className="modal-title mt-0">Add Language</h5>
          <button
            type="button"
            className="close"
            onClick={() => handleCloseModal()}
          >
            <i className="modal-close" />
          </button>
        </Modal.Header>
        <Modal.Body bsPrefix={"-contactlist"}>
          <div className="modal-body pl-0 pr-0">
            <div className="contact-list-search">
              <input
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleLanguageSearch}
              />
              <button type="submit" className="search-btn waves-effect" />
            </div>
            <div className="contact-list-table">
              <div
                className="table-responsive mb-0 contact_mod"
                data-pattern="priority-columns"
              >
                <table className="table">
                  <tbody>
                    {results && results.length ? (
                      results.map((x: any, index: number) => {
                        return (
                          <tr key={x.val}>
                            <td>
                              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success d-inline-flex">
                                <input
                                  type="checkbox"
                                  id="customCheck-outlinecolor17"
                                  className="custom-control-input"
                                  value={x.val}
                                  checked={selectedLanguage === x.val}
                                  onChange={() => handleCheckboxChange(x.val)}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="customCheck-outlinecolor17"
                                />
                              </div>
                              <div className="message-table-name d-inline-flex align-items-center ml-4">
                                <div className="message-mail-content">
                                  <h4>{x.key}</h4>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={50}>No record found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="contact-list-bottom-form d-flex justify-content-between">
              <div className="d-flex">
                <button
                  className={clsx({
                    "next-btn waves-effect": selectedLanguage,
                    "next-btn waves-effect disable-link": !selectedLanguage,
                  })}
                  onClick={handleAddLanguage}
                  data-toggle="modal"
                  data-target=".sendvoicemail"
                  data-dismiss="modal"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
