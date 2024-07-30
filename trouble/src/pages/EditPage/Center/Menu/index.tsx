import classNames from "classnames";
import {setCmpSelected, delSelectedCmps,addZIndex,subZIndex,topZIndex,bottomZIndex} from "../../../../store/editStore";
import styles from "./index.module.less";
import {Style} from "../../../../store/editStoreType";
import {pick} from "lodash";
import {isGraphComponent, isImgComponent} from "../../../../utils/const";
import {ICmpWithKey} from "../../../../store/editStoreType";
export default function Menu({
  style,
  assemblySize,
}: {
  style: Style;
  assemblySize: number;
}) {
  if (assemblySize === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.main)} style={style}>
      <ul className={classNames(styles.menu)}>
        <li onClick={delSelectedCmps}>删除组件</li>
        {assemblySize === 1 && (
          <>
            <li onClick={addZIndex}>上移一层</li>
            <li onClick={subZIndex}>下移一层</li>
            <li onClick={topZIndex}>置顶</li>
            <li onClick={bottomZIndex}>置底</li>
          </>
        )}
      </ul>
    </div>
  );
}

interface ItemProps {
  cmp: ICmpWithKey;
  index: number;
}

function Item(props: ItemProps) {
  const {cmp, index} = props;
  const {type, value} = cmp;

  let left, right;

  switch (type) {
    case isImgComponent:
      left = <img className={styles.left} src={value} alt="" />;
      right = "图片";
      break;

    case isGraphComponent:
      left = (
        <span
          className={styles.left}
          style={pick(cmp.style, [
            "backgroundColor",
            "borderWidth",
            "borderStyle",
            "borderColor",
            "borderRadius",
          ])}></span>
      );
      right = "图形";
      break;

    // case isTextComponent:
    default:
      left = (
        <span
          className={classNames(styles.left, "iconfont icon-wenben")}></span>
      );
      right = value;
      break;
  }

  return (
    <li onClick={() => setCmpSelected(index)}>
      {left}
      <span className={styles.txt}>{right}</span>
    </li>
  );
}
