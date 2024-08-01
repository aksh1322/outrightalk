import React from "react";
import { useAppLoaderSelector } from "../../../hooks/selectors/loaderSelector";

import "./appLoader.css";

function AppLoader() {
  const show = useAppLoaderSelector();

  if (!show) {
    return null;
  }

  return (
    <div className="loader-container">
      <div className="loader-base">
        <div className="lds-ripple">
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default AppLoader;
