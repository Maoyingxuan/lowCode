import {addCmp} from "../../../store/editStore";
import {defaultComponentStyle} from "../../../utils/const";
import leftSideStyles from "./leftSide.module.less";
import { isTextComponent } from "../../../utils/const";
import { memo } from "react";
const defaultStyle = {
  ...defaultComponentStyle,
  width: 170,
  height: 30,
  lineHeight: "30px",
  fontSize: 12,
  fontWeight: "normal",
  textDecoration: "none",
  color: "#000",
  backgroundColor: "#ffffff00",
  textAlign: "center",
  wordSpacing: "10px",
};

const settings = [
  {
    value: "标题",
    style: {
      ...defaultStyle,
      fontSize: 28,
      height: 50,
      lineHeight: "50px",
    },
  },
  {
    value: "正文",
    style: defaultStyle,
  },
];

const TextSider=memo( ()=> {
  console.log("TextSider")
  // 优化，添加组件时不更新textside
  // const {addCmp} = useEditStore(
  //   (state) => state,
  //   () => {
  //     return true;
  //   }
  // )
  return (
    <div className={leftSideStyles.main}>
      <ul className={leftSideStyles.box}>
        {settings.map((item) => (
          <li draggable={true}
           key={item.value} 
           className={leftSideStyles.item}
          onClick={()=>addCmp({...item, type: isTextComponent})}
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "drag-cmp",
              JSON.stringify({...item, type: isTextComponent})
            );
          }}>
            {item.value.indexOf("双击编辑") > -1
              ? item.value.slice(4)
              : item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
)
export default TextSider