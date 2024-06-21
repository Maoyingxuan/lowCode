
import styles from "./index.module.less";
import Canvas from "./Canvas";
import { setAllCmpsSelected,setCmpSelected } from "../../../store/editStore";
export default function Center() {
  return (
    <div
      id="center"
      className={styles.main}
      tabIndex={0}
      onClick={(e) => {
        if(e.target.id === 'center')
        setCmpSelected(-1);
      }}>
      <Canvas />
    </div>
  );
  
}
