import { useContext } from "react";
import { StompContext } from "../provider/WsProvider";

export const useWebsocket = () => {
  return useContext(StompContext);
};