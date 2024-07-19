import { ICmpWithKey } from "../../../../store/editStoreType";
import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../../LeftSider";
import {Text,Img} from "./CmpDetail";
import classNames from "classnames";
import {pick,omit} from "lodash"
import { setCmpSelected,setCmpsSelected } from "../../../../store/editStore";
import { memo } from "react";
interface ICmpProps {
  cmp:ICmpWithKey,
  index:number
  isSelected:boolean
}
const Cmp = memo((props: ICmpProps) => {
  const {cmp, index, isSelected} = props;
  const {style} = cmp;

  const setSelected = (e:React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.metaKey) {
      setCmpsSelected([index]);
    } else {
      setCmpSelected(index);
    }
  };

  const outerStyle = pick(style, [
    "position",
    "top",
    "left",
    "width",
    "height",
  ]);

  const innerStyle = omit(style, "position", "top", "left");
  const transform = `rotate(${style.transform}deg)`;

  console.log("cmp render"); //sy-log

  return (
    <div
      className={classNames(styles.main, isSelected && "selectedBorder")}
      style={{
        ...outerStyle,
        transform,
        zIndex: isSelected ? 9999 : index,
      }}
      onClick={setSelected}>
      <div className={styles.inner} style={{...innerStyle}}>
        {cmp.type === isTextComponent && <Text {...cmp} />}
        {cmp.type === isImgComponent && <Img {...cmp} />}
      </div>
    </div>
  );
});

export default Cmp;
