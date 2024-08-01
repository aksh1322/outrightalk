import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";

function ChatHistoryList() {
  const groupCategoryApi = useGroupCategoryApi();
  const [pmHistory, setPmHistory] = useState<[]>([]);
  const [roomHistory, setRoomHistory] = useState<[]>([]);

  useEffect(() => {
    getAllChatHistory();
  }, []);

  const getAllChatHistory = () => {
    groupCategoryApi.callGetAllChatHistory(
      null,
      (message: string, resp: any) => {
        if (resp) {
          console.log("resp ======>", resp);
          setPmHistory(resp?.fileUrls.pm);
          setRoomHistory(resp?.fileUrls.room);
        }
      },
      (message: string) => {
        // toast.error(message);
      }
    );
  };
  return (
    <div className="table-responsive mb-0" data-pattern="priority-columns">
      <Tabs defaultActiveKey="Pm" id="uncontrolled-tab-example" className="m-3">
        <Tab eventKey="Pm" title="Pm">
          <table className="table">
            <thead>
              <tr>
                <th>Pm Room Files</th>
              </tr>
            </thead>
            <tbody>
              {pmHistory && pmHistory.length ? (
                pmHistory.map((x: any, index: number) => (
                  <tr>
                    <td>
                      <a href={x?.url} target="_blank">
                        {x?.name}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={50}>No record found</td>
                </tr>
              )}
            </tbody>
          </table>
        </Tab>
        <Tab eventKey="Rooms" title="Rooms">
          <table className="table">
            <thead>
              <tr>
                <th>Pm Room Files</th>
              </tr>
            </thead>
            <tbody>
              {roomHistory && roomHistory.length ? (
                roomHistory.map((x: any, index: number) => (
                  <tr>
                    <td>
                      <a href={x?.url} target="_blank">
                        {x?.name}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={50}>No record found</td>
                </tr>
              )}
            </tbody>
          </table>
        </Tab>
      </Tabs>
    </div>
  );
}

export default ChatHistoryList;
