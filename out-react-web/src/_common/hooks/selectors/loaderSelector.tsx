import { useSelector } from "react-redux";
import { StateExtended } from "../../interfaces/StateExtended";

export function useAppLoaderSelector() {
  const show = useSelector(
    (state: StateExtended) => state.loader.fpLoaderShown
  );

  return show;
}
