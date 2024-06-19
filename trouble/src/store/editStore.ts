import {create} from "zustand"
import {immer} from 'zustand/middleware/immer'
import {getOnlyKey} from '../utils'
import { EditStoreState ,EditStoreAction,ICanvas,ICmp} from "./editStoreType"
import Axios from "../request/axios"
import {getCanvasByIdEnd, saveCanvasEnd} from "../request/end";

const useEditStore = create(
    immer<EditStoreState & EditStoreAction>((set) => ({
      canvas: getDefaultCanvas(),
      // addCmp: (_cmp: ICmp) => {
      //   set((draft) => {
      //     draft.canvas.cmps.push({..._cmp, key: getOnlyKey()});
      //   });
      // },
    }))
  );
  export const addCmp=(_cmp: ICmp)=>{
    useEditStore.setState((draft) => {
      draft.canvas.cmps.push({..._cmp, key: getOnlyKey()});
    });
  }
  export const saveCanvas = async (
    id: number | null,
    type: string,
    successCallback: (id: number) => void
  ) => {
    const canvas = useEditStore.getState().canvas;
    const res: any = await Axios.post(saveCanvasEnd, {
      id,
      title: canvas.title,
      content: JSON.stringify(canvas),
      type,
    });
  
    successCallback(res?.id);
  };
  
  export const fetchCanvas = async (id: number) => {
    const res: any = await Axios.get(getCanvasByIdEnd + id);
  
    if (res) {
      useEditStore.setState((draft) => {
        draft.canvas = JSON.parse(res.content);
        draft.canvas.title = res.title;
      });
    }
  };
  export default useEditStore;

  function getDefaultCanvas(): ICanvas {
    return {
      title: "未命名",
      // 页面样式
      style: {
        width: 320,
        height: 568,
        backgroundColor: "#ffffff",
        backgroundImage: "",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      },
      // 组件
      cmps: [],
    };
  }
  