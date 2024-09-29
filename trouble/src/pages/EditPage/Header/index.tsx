import classNames from "classnames";
import {Link, useNavigate,unstable_usePrompt} from "react-router-dom";
import styles from "./index.module.less";
import {useCanvasId, useCanvasType} from "../../../store/hooks";
import useEditStore,{clearCanvas, saveCanvas} from "../../..//store/editStore";
import {message} from "antd";
import { goNextCanvasHistory,goPrevCanvasHistory } from "../../../store/historySlice";
export default function Header() {
  const hasSavedCanvas = useEditStore(({hasSavedCanvas}) => hasSavedCanvas);

  unstable_usePrompt({
    when: !hasSavedCanvas,
    message: "离开后数据将不会被保存，确认要离开吗?",
  });

  const navigate = useNavigate();

  //页面的新增与编辑更新
  const save = () => {
    saveCanvas((_id, isNew) => {
      message.success("保存成功");
      if (isNew) {
        // 新增
        navigate(`?id=${_id}`);
      }
    });
  };

  const saveAndPreview = () => {
    saveCanvas((_id, isNew) => {
      message.success("保存成功");

      if (isNew) {
        // 新增
        navigate(`?id=${_id}`);
      }

      // 跳转生成器项目页
      window.open("http://builder.codebus.tech?id=" + _id);
    });
  };
  const saveAndDownload = () => {
    saveCanvas((_id, isNew, res) => {
      message.success("保存成功");

      if (isNew) {
        // 新增
        navigate(`?id=${_id}`);
      }

      //  下载图片
      const img = res.thumbnail.full;
      const ele = document.createElement("a");
      ele.href = img.replace("http://template.codebus.tech/", "");
      ele.download = res.title + ".png";
      ele.style.display = "none";
      document.body.appendChild(ele);
      ele.click();
      document.body.removeChild(ele);
    });
  };
  const emptyCanvas = () => {
    clearCanvas()
  };

  console.log("header render"); //sy-log
  return (
    <div className={styles.main}>
      <div className={classNames(styles.item)}>
        <Link to="/list" className="red">
          查看列表
        </Link>
      </div>

      <div className={classNames(styles.item)} onClick={save}>
        <span
          className={classNames(styles.icon)}></span>
        <span className={styles.txt}>保存</span>
      </div>

      {/* <div className={classNames(styles.item)} onClick={saveAndPreview}>
        <span
          className={classNames(styles.icon)}></span>
        <span className={styles.txt}>保存并预览</span>
      </div> */}

      <div className={classNames(styles.item)} onClick={goPrevCanvasHistory}>
        <span
          className={classNames(
            styles.icon
          )}></span>
        <span className={styles.txt}>上一步</span>
      </div>

      <div className={classNames(styles.item)} onClick={goNextCanvasHistory}>
        <span
          className={classNames(
            styles.icon,
            styles.nextStep
          )}
          style={{transform: `rotateY{180}deg`}}></span>
        <span className={styles.txt}>下一步 </span>
      </div>

      <div className={classNames(styles.item)} onClick={emptyCanvas}>
        <span
          className={classNames(styles.icon)}></span>
        <span className={styles.txt}>清空</span>
      </div>

      <div className={classNames(styles.item)} onClick={saveAndDownload}>
        <span
          className={classNames(
            styles.icon
          )}></span>
        <span className={styles.txt}>保存并下载图片</span>
      </div>
    </div>
  );
}
