import { ICmpWithKey } from "../../../../store/editStoreType";
import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../../LeftSider";
import {Text,Img} from "./CmpDetail";
import classNames from "classnames";
import {pick,omit} from "lodash"
import { setCmpSelected,setCmpsSelected,setAllCmpsSelected } from "../../../../store/editStore";
import { memo } from "react";
interface ICmpProps {
  cmp:ICmpWithKey,
  index:number
  isSelected:boolean
}
const Cmp =memo((props:ICmpProps)=>{
    const {cmp, index,isSelected} = props;
    const {style} = cmp;
    const outerStyle = pick(style, [
      "position",
      "top",
      "left",
      "width",
      "height",
    ]);
    const innerStyle = omit(style,[
      "position",
      "top",
      "left",
      "width",
      "height",
    ])
    const setSelected = (e)=>{
      if(e.metaKey){
        setCmpsSelected([index]);
    } else {
      setCmpSelected(index);
      }
    }
    console.log("cmp render")
    return (
        <div 
        className={classNames(styles.main, isSelected&&"selectedBorder")} style={outerStyle}
        onClick={setSelected}>
          <div className={styles.inner} style={{...innerStyle,zIndex:index}}>

          
          {cmp.type === isTextComponent && <Text {...cmp} />}
          {cmp.type === isImgComponent && <Img {...cmp} />}
          </div>
        </div>
      );
})
export default Cmp