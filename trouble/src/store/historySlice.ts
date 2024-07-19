import type { EditStoreState } from "./editStoreType";
import useEditStore from "./editStore";
const maxCanvasChangeHistory = 30
//记录历史
export const recordCanvasChangeHistory = (draft:EditStoreState) => {
  // 在撤销回退过程中，此时历史下标为currentIndex，如果此时用户又去修改画布或者组件属性，
  // 重新插入了新的历史进来，那么把currentIndex之后的记录全部删除，再把新的画布数据插入进来。
  const canvasChangeHistory = draft.canvasChangeHistory;

  draft.canvasChangeHistory = canvasChangeHistory.slice(
    0,
    draft.canvasChangeHistoryIndex + 1
  );

  // 记录canvas和选中元素的下标
  draft.canvasChangeHistory.push({
    canvas: draft.canvas,
    assembly: draft.assembly,
  });
  draft.canvasChangeHistoryIndex++;

  if (draft.canvasChangeHistory.length > maxCanvasChangeHistory) {
    // 溢出最大宽度，那么删除第0个元素
    draft.canvasChangeHistory.shift();
    draft.canvasChangeHistoryIndex--;
  }
}
//上一步
export const goPrevCanvasHistory = () =>{
    console.log("back")
    useEditStore.setState((draft) => {
        let newIndex = draft.canvasChangeHistoryIndex - 1;
    
        if (newIndex < 0) {
          newIndex = 0;
        }
    
        if (draft.canvasChangeHistoryIndex === newIndex) {
          return;
        }
        const item = draft.canvasChangeHistory[newIndex];
        draft.canvas = item.canvas;
        draft.assembly = item.assembly;
        draft.canvasChangeHistoryIndex = newIndex;
      });
}
//下一步
export const goNextCanvasHistory = () =>{
    console.log("next")
    useEditStore.setState((draft) => {
        let newIndex = draft.canvasChangeHistoryIndex + 1;
    
        if (newIndex >= draft.canvasChangeHistory.length) {
          newIndex = draft.canvasChangeHistory.length - 1;
        }
    
        if (draft.canvasChangeHistoryIndex === newIndex) {
          return;
        }
        const item = draft.canvasChangeHistory[newIndex];
        draft.canvas = item.canvas;
        draft.assembly = item.assembly;
        draft.canvasChangeHistoryIndex = newIndex;
      });
}