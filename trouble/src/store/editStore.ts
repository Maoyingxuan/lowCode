import {create} from "zustand"
import {immer} from 'zustand/middleware/immer'
import {getOnlyKey} from '../utils'
import { EditStoreState ,EditStoreAction,ICanvas,ICmp} from "./editStoreType"
import Axios from "../request/axios"
import {getCanvasByIdEnd, saveCanvasEnd} from "../request/end";
import {enableMapSet} from "immer"
enableMapSet()
const useEditStore = create(
    immer<EditStoreState & EditStoreAction>(() => ({
      canvas: getDefaultCanvas(),
      assembly: new Set() //选中组件下标
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
  // 清空画布
  export const clearCanvas = () => {
    useEditStore.setState((draft) => {
      draft.canvas = getDefaultCanvas();
      draft.assembly.clear()
    });
  };
  // 选中组件
  // 全部选中
export const setAllCmpsSelected = () => {
  useEditStore.setState((draft) => {
    let len = draft.canvas.cmps.length;
    draft.assembly = new Set(Array.from({length: len}, (a, b) => b));
  });
};

// 选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState((draft) => {
    if (indexes)
      indexes.forEach((index) => {
        if (draft.assembly.has(index)) {
          // 取消这个组件的选中
          draft.assembly.delete(index);
        } else {
          // 选中
          draft.assembly.add(index);
        }
      });
  });
};

// 选中单个
// 如果index为-1，则取消选中
export const setCmpSelected = (index: number) => {
  if (index === -1) {
    useEditStore.setState((draft) => {
      if (draft.assembly.size > 0) {
        draft.assembly.clear();
      }
    });
  } else if (index > -1) {
    useEditStore.setState((draft) => {
      draft.assembly = new Set([index]);
    });
  }
};
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
  