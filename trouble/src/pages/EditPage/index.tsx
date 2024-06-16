import { Layout } from "antd"
import LeftSider from "./LeftSider"
import Center from "./Center";
import RightSider from "./RightSider";
export default function EditPage(){
    return (
        <div>
        <Layout>
            <LeftSider></LeftSider>
            <Center></Center>
            <RightSider></RightSider>
        </Layout>
        </div>
    )
}