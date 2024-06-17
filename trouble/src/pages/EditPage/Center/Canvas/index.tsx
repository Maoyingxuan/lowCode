// import {_Style} from "src/store/editStoreTypes";
import useEditStore from "../../../../store/editStore";
import styles from "./index.module.less";

export default function Canvas() {
    const {canvas} = useEditStore()
    const {cmps} = canvas
  return (
    <div
      id="canvas"
      className={styles.main}
      style={{width: 320, height: 568}}>
        {cmps.map((item)=>
            (<div key={item.key}>{item.value}</div>)
        )}
      </div>
  );
}
