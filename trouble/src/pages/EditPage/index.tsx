import { Layout } from "antd"
import LeftSider from "./LeftSider"
import Center from "./Center";
import styles from "./index.module.less";
import RightSider from "./RightSider";
export default function EditPage(){
    return (
        <Layout className={styles.main}>
        <div className={styles.content}>
          <LeftSider />
          <Center />
          <RightSider />
        </div>
      </Layout>
      )
}