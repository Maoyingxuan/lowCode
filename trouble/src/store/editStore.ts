import {create} from "zustand"
import {immer} from 'zustand/middleware/immer'
import {getOnlyKey} from '../utils'
import { EditStoreState ,EditStoreAction,IContent,ICmp,Style,IEditStore,ICmpWithKey} from "./editStoreType"
import Axios from "../request/axios"
import {getCanvasByIdEnd, saveCanvasEnd} from "../request/end";
import {enableMapSet} from "immer"
import {resetZoom} from "./zoomStore"
enableMapSet()
import { recordCanvasChangeHistory } from "./historySlice"
const showDiff = 12;
const adjustDiff = 3;
const useEditStore = create(
    immer<EditStoreState & EditStoreAction>(() => ({
      canvas: {
        id: null,
        title: "未命名",
        type: "content",
        content: getDefaultCanvasContent(),
      },
      hasSavedCanvas:true,
      assembly: new Set(), //选中组件下标
      canvasChangeHistory: [
        {
          canvas: {
            id: null,
            title: "未命名",
            type: "content",
            content: getDefaultCanvasContent(),
          },
          assembly: new Set(),
        },
      ],
      canvasChangeHistoryIndex: 0,
    }))
  );

  // 初始化
export const initCanvas = () => {
  useEditStore.setState((draft) => {
    (draft.canvas = {
      id: null,
      title: "未命名",
      type: "content",
      content: getDefaultCanvasContent(),
    }),
      (draft.hasSavedCanvas = true); // 画布编辑后是否被保存
    // 记录选中组件的下标
    draft.assembly = new Set();

    // 历史
    (draft.canvasChangeHistory = [
      {
        canvas: {
          id: null,
          title: "未命名",
          type: "content",
          content: getDefaultCanvasContent(),
        },
        assembly: new Set(),
      },
    ]),
      (draft.canvasChangeHistoryIndex = 0);
  });

  resetZoom();
};

  export const addCmp=(_cmp: ICmp)=>{
    useEditStore.setState((draft) => {
      draft.canvas.content.cmps.push({..._cmp, key: getOnlyKey()});
      draft.hasSavedCanvas = false;
      draft.assembly = new Set([draft.canvas.content.cmps.length - 1])
      recordCanvasChangeHistory(draft)
    });
  }
  export const delSelectedCmps = () => {
    useEditStore.setState((draft) => {
      const assembly = draft.assembly;
      draft.canvas.content.cmps = draft.canvas.content.cmps.filter(
        (_, index) => !assembly.has(index)
      );
      draft.hasSavedCanvas = false;
      draft.assembly.clear();
      recordCanvasChangeHistory(draft);
    });
  }
  export const saveCanvas = async (
    successCallback: (id: number, isNew: boolean, res: any) => void
  ) => {
    const canvas = useEditStore.getState().canvas;
    let isNew = canvas.id == null;
    const res: any = await Axios.post(saveCanvasEnd, {
      id: canvas.id,
      type: canvas.type,
      title: canvas.title,
      content: JSON.stringify(canvas.content),
    });
  
    successCallback(res?.id, isNew, res);
  
    useEditStore.setState((draft) => {
      if (isNew) {
        draft.canvas.id = res.id;
      }
      draft.hasSavedCanvas = true;
    });
  };
  
  export const fetchCanvas = async (id: number) => {
    const res: any = await Axios.get(getCanvasByIdEnd + id);
  
    if (res) {
      useEditStore.setState((draft) => {
        draft.canvas.content = JSON.parse(res.content);
        draft.canvas.id = res.id;
        draft.canvas.title = res.title;
        draft.canvas.type = res.type;
        draft.assembly.clear()
        // 初始化历史数据
        draft.canvasChangeHistory = [
        {canvas: draft.canvas, assembly: draft.assembly},
        ];
        draft.canvasChangeHistoryIndex = 0;
        });
      resetZoom()
    }
  };
  export default useEditStore;
  // 清空画布
  export const clearCanvas = () => {
    useEditStore.setState((draft) => {
      draft.canvas.content = getDefaultCanvasContent();
      draft.hasSavedCanvas = false;
      draft.assembly.clear()
      recordCanvasChangeHistory(draft)
    });
    resetZoom()
  };
  // 选中组件
  // 全部选中
export const setAllCmpsSelected = () => {
  useEditStore.setState((draft) => {
    let len = draft.canvas.content.cmps.length;
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

  function getDefaultCanvasContent(): IContent {
    return {
      // title: "未命名",
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
  
  export const updateAssemblyCmpsByDistance = (newStyle: Style
    ,autoAdjustment?:boolean
  ) => {
    useEditStore.setState((draft) => {
      draft.assembly.forEach((index) => {
        const selectedcmp = {...draft.canvas.content.cmps[index]};
        let invalid = false
        for (const key in newStyle) {
          if (
            (key === "width" || key === "height") &&
            selectedcmp.style[key] + newStyle[key] < 2
          ) {
            invalid = true;
            break;
          }
          selectedcmp.style[key] += newStyle[key];
        }
              // 检查自动调整
      if (autoAdjustment) {
        // 对齐画布或者组件
        // 画布
        autoAlignToCanvas(canvasStyleSelector(draft), selectedcmp);
      }
        if(!invalid){
          draft.canvas.content.cmps[index] = selectedcmp
        }
        draft.hasSavedCanvas = false;
      });
    });
  };
  function autoAlignToCanvas(targetStyle: Style, selectedCmp: ICmpWithKey) {
    const selectedCmpStyle = selectedCmp.style;

    // ! 中心 X 轴
    autoAlign(
      selectedCmpStyle.top + selectedCmpStyle.height / 2 - targetStyle.height / 2,
      "centerXLine",
      () => {
        selectedCmp.style.top =
          (targetStyle.height - selectedCmpStyle.height) / 2;
      }
    );
  
    // ! 中心 Y 轴
    autoAlign(
      selectedCmpStyle.left + selectedCmpStyle.width / 2 - targetStyle.width / 2,
      "centerYLine",
      () => {
        selectedCmp.style.left = (targetStyle.width - selectedCmpStyle.width) / 2;
      }
    );
  
    // ! 对齐画布 top
    autoAlign(selectedCmpStyle.top, "canvasLineTop", () => {
      selectedCmp.style.top = 0;
    });
  
    // ! 对齐画布 bottom
    autoAlign(
      selectedCmpStyle.top + selectedCmpStyle.height - targetStyle.height,
      "canvasLineBottom",
      () => {
        selectedCmp.style.top = targetStyle.height - selectedCmpStyle.height;
      }
    );
  
    // ! 对齐画布 left
    autoAlign(selectedCmpStyle.left, "canvasLineLeft", () => {
      selectedCmp.style.left = 0;
    });
  
    // ! 对齐画布 right
    autoAlign(
      selectedCmpStyle.left + selectedCmpStyle.width - targetStyle.width,
      "canvasLineRight",
      () => {
        selectedCmp.style.left = targetStyle.width - selectedCmpStyle.width;
      }
    );
  }
  
  function autoAlign(_distance: number, domLineId: string, align: () => void) {
    const distance = Math.abs(_distance);
    const domLine = document.getElementById(domLineId) as HTMLElement;
    if (distance < showDiff) {
      // 显示参考线
      domLine.style.display = "block";
    }
    if(distance>=showDiff){
      domLine.style.display = "none";
    }
    if (distance < adjustDiff) {
      // 自动吸附
      align();
    }
  }

// 修改画布 title
export const updateCanvasTitle = (title: string) => {
  useEditStore.setState((draft) => {
    draft.canvas.title = title;
    draft.hasSavedCanvas = false;
    recordCanvasChangeHistory(draft);
  });
};

// ! 更新画布属性
export const updateCanvasStyle = (_style: any) => {
  useEditStore.setState((draft) => {
    Object.assign(draft.canvas.content.style, _style);
    draft.hasSavedCanvas = false;
    recordCanvasChangeHistory(draft);
  });
};

// 修改单个组件的style
export const updateSelectedCmpStyle = (
  newStyle: Style,
  recordHistory: boolean | undefined = true
) => {
  useEditStore.setState((draft) => {
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (!(typeof selectedIndex === "number" && selectedIndex > -1)) {
      return;
    }
    Object.assign(draft.canvas.content.cmps[selectedIndex].style, newStyle);
    if (recordHistory) {
      recordCanvasChangeHistory(draft);
    }
    draft.hasSavedCanvas = false;
  });
};

// 修改单个组件的属性
export const updateSelectedCmpAttr = (name: string, value: string) => {
  useEditStore.setState((draft: any) => {
    const selectedIndex = selectedCmpIndexSelector(draft);
    draft.canvas.cmps[selectedIndex][name] = value;
    draft.hasSavedCanvas = false;
    recordCanvasChangeHistory(draft);
  });
};

// 修改选中组件的style
export const editAssemblyStyle = (_style: Style) => {
  useEditStore.setState((draft) => {
    draft.assembly.forEach((index: number) => {
      const _s = {...draft.canvas.content.cmps[index].style};
      const canvasStyle = draft.canvas.content.style;
      if (_style.right === 0) {
        // 计算left
        _s.left = canvasStyle.width - _s.width;
      } else if (_style.bottom === 0) {
        // top
        _s.top = canvasStyle.height - _s.height;
      } else if (_style.left === "center") {
        _s.left = (canvasStyle.width - _s.width) / 2;
      } else if (_style.top === "center") {
        _s.top = (canvasStyle.height - _s.height) / 2;
      } else {
        Object.assign(_s, _style);
      }

      draft.canvas.content.cmps[index].style = _s;
      draft.hasSavedCanvas = false;
      recordCanvasChangeHistory(draft);
    });
  });
};
// 选中的单个组件的index
export const selectedCmpIndexSelector = (store: IEditStore): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0];
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex;
};

export const recordCanvasChangeHistory_2 = () => {
  useEditStore.setState((draft) => {
    recordCanvasChangeHistory(draft);
  });
};

export const topZIndex = () =>{
  useEditStore.setState(draft=>{
    // console.log(draft.canvas.cmps);
    const cmps = draft.canvas.content.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === cmps.length - 1) {
      return;
    }
    draft.canvas.content.cmps = cmps
      .slice(0, selectedIndex)
      .concat(cmps.slice(selectedIndex + 1))
      .concat(cmps[selectedIndex]);
      draft.hasSavedCanvas = false;
      draft.assembly = new Set([cmps.length - 1]);

    recordCanvasChangeHistory(draft);
  })
}

export const bottomZIndex = () =>{
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (selectedIndex === 0) {
      return;
    }
    draft.canvas.content.cmps = [cmps[selectedIndex]]
      .concat(cmps.slice(0, selectedIndex))
      .concat(cmps.slice(selectedIndex + 1));
      draft.hasSavedCanvas = false;
      draft.assembly = new Set([0]);

    recordCanvasChangeHistory(draft);
  });
}

export const addZIndex = () =>{
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === cmps.length - 1) {
      return;
    }
    [draft.canvas.content.cmps[selectedIndex], draft.canvas.content.cmps[selectedIndex + 1]] = [
      draft.canvas.content.cmps[selectedIndex + 1],
      draft.canvas.content.cmps[selectedIndex],
    ];
    draft.hasSavedCanvas = false;
    draft.assembly = new Set([selectedIndex + 1])

    recordCanvasChangeHistory(draft)
  });
}

export const subZIndex = () =>{
  useEditStore.setState((draft) => {
    // const cmps = draft.canvas.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (selectedIndex === 0) {
      return;
    }
    [draft.canvas.content.cmps[selectedIndex], draft.canvas.content.cmps[selectedIndex - 1]] = [
      draft.canvas.content.cmps[selectedIndex - 1],
      draft.canvas.content.cmps[selectedIndex],
    ];
    draft.hasSavedCanvas = false;
    draft.assembly = new Set([selectedIndex - 1]);

    recordCanvasChangeHistory(draft);
  });
}
export const canvasStyleSelector = (store: IEditStore): Style => {
  return store.canvas.content.style;
};