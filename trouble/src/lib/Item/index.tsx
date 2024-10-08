//该组件为编辑界面条形框
import styles from "./index.module.less";

export default function Item({
  label,
  children,
  tips,
}: {
  label: string;
  children: JSX.Element;
  tips?: string;
}) {
  return (
    <div className={styles.main}>
      <label>{label}</label>
      {children}
      <p className={styles.tips}>{tips}</p>
    </div>
  );
}
