import useEditStore,{updateAssemblyCmpsByDistance,
  updateSelectedCmpAttr,
  updateSelectedCmpStyle,
  recordCanvasChangeHistory_2
} from "../../../../store/editStore";
import styles from "./index.module.less";
import {throttle} from "lodash"
import useZoomStore from "../../../../store/zoomStore";
import StretchDots from "./StretchDots";
import {isTextComponent} from "../../../../utils/const";
import {useEffect,useState} from "react";
import TextareaAutosize from "react-textarea-autosize";
import Menu from "../Menu";
import AlignLines from "./AlignLines";
import Rotate from "./Rotate";
import { flushSync } from "react-dom";
export default function EditBox() {
  const zoom = useZoomStore((state) => state.zoom);
  const [canvas, assembly] = useEditStore((state) => [
    state.canvas,
    state.assembly,
  ]);
    
    const selectedIndex = Array.from(assembly)[0];
    const {cmps, style:canvasStyle} = canvas.content;
    useEffect(() => {
      setShowMenu(false);
    } , [selectedIndex]);

    // 只有单个文本组件的时候才会用到
    const selectedCmp = cmps[selectedIndex];
    // 选中文本组件
    const [textareaFocused, setTextareaFocused] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

  const onMouseDownOfCmp =(e:React.MouseEvent<HTMLDivElement>) =>{
    // if (textareaFocused) {
    //   return;
    // }
    let startX = e.pageX;
    let startY = e.pageY;
  
  const move = throttle((e:any)=>{
    const x = e.pageX;
    const y = e.pageY;

    let disX = x - startX;
    let disY = y - startY;

    disX = disX * (100 / zoom);
    disY = disY * (100 / zoom);

    updateAssemblyCmpsByDistance({top: disY, left: disX},true);
    // updateAssemblyCmpsByDistance({top: disY, left: disX});
    startX = x;
    startY = y;
  },50)
  const up = () => {
          // 隐藏吸附线
    document.querySelectorAll(".alignLine").forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });
    recordCanvasChangeHistory_2()
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
}
  const size = assembly.size;
  if (size === 0) {
    return null;
  }

  let top = 9999,
    left = 9999,
    bottom = -9999,
    right = -9999;

  assembly.forEach((index) => {
    const cmp = cmps[index];
    top = Math.min(top, cmp.style.top);
    left = Math.min(left, cmp.style.left);

    bottom = Math.max(bottom, cmp.style.top + cmp.style.height);
    right = Math.max(right, cmp.style.left + cmp.style.width);
  });

  let width = right - left + 4;
  let height = bottom - top + 4;

  top -= 2;
  left -= 2;

  const transform = `rotate(${
    size === 1 ? selectedCmp.style.transform : 0
  }deg)`;

  return (
    <>
    {size === 1 && <AlignLines canvasStyle={canvasStyle} />}
    <div
      className={styles.main}
      style={{
        zIndex: 99999,
        top,
        left,
        width,
        height,
        transform
      }}
      onMouseDown={onMouseDownOfCmp}
      onClick={(e) =>{
        e.stopPropagation();
        setShowMenu(false)
      }}
      onDoubleClick={() => {
        setTextareaFocused(true);
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        setShowMenu(true);
      }}
      onMouseLeave={() => {
        setTextareaFocused(false);
      }}
      >
      {size === 1 &&
      selectedCmp.type === isTextComponent &&
      textareaFocused && (
        <TextareaAutosize
          value={selectedCmp.value}
          style={{
            ...selectedCmp.style,
            top: 2,
            left: 2,
          }}
          onChange={(e) => {
            console.log('change');
            const newValue = e.target.value;
            updateSelectedCmpAttr("value", newValue);
          }}
          onHeightChange={(height) => {
            updateSelectedCmpStyle({height});
          }}
        />
      )}
        {showMenu && <Menu
          style={{left: width}}
          assemblySize={size}
        />}

        <StretchDots zoom={zoom} style={{width,height}}></StretchDots>
        {size === 1 && <Rotate zoom = {zoom} selectedCmp={selectedCmp} />}
      </div>
      </>
  );
}
