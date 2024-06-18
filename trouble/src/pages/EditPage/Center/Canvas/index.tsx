// import {_Style} from "src/store/editStoreTypes";
import {addCmp} from "../../../../store/editStore";
import useEditStore from "../../../../store/editStore";
import styles from "./index.module.less";
import Cmp from "../Cmp";

export default function Canvas() {
    console.log("canvas render")
    const {canvas} = useEditStore((state)=>state)
    const {cmps,style} = canvas;
    const onDrop=(e:any)=>{
      // 读取被拖拽组件信息
      const dragCmp = JSON.parse(e.dataTransfer.getData("drag-cmp"))
      // 读取用户松手位置
      const endX = e.pageX
      const endY = e.pageY
      const canvasDomPos={
        top:114,
        left: (document.body.clientWidth - Number(style.width)) / 2,
      }
      let disX = endX-canvasDomPos.left
      let disY = endY-canvasDomPos.top
      dragCmp.style.left = disX - dragCmp.style.width / 2;
      dragCmp.style.top = disY - dragCmp.style.height / 2;
      // 添加组件存入state store
      // console.log("1")
      addCmp(dragCmp)
    }
    const allowDraop = (e:any) => {
      e.preventDefault();
    };
  return (
    <div
      id="canvas"
      className={styles.main}
      style={{width: 320, height: 568}}
      onDrop={onDrop}
      onDragOver={allowDraop}>
              {cmps.map((item, index) => (
        <Cmp key={item.key} cmp={item} index={index}></Cmp>
      ))}
      </div>
  );
}
