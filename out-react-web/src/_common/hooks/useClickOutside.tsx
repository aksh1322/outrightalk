import { useEffect, useRef } from "react";

const useOutsideClick = (ref: any, callback: any, buttonRef: any) => {
  const handleClick = (e: any) => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target)
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);
};

export default useOutsideClick;
