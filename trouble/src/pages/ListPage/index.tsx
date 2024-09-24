import { Modal,message,Button, Card, Divider, Space, Table ,Image} from "antd";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import Axios from "../../request/axios";
import {deleteCanvasByIdEnd, getCanvasListEnd,publishEnd} from "../../request/end";
import useUserStore from "../../store/userStore";

interface ListItem {
    id:number;
    type:string; //页面
    title:string;
    content:string;
    thumbnail: {full: string};
    publish: boolean;
}
export default function ListPage(){
    const [list,setList] = useState([])
    const isLogin = useUserStore((state)=>state.isLogin)
    const fresh = async () => {
      if (!isLogin) {
        return;
      }
      const res: any = await Axios.get(getCanvasListEnd);
      let data = res?.content || [];
      setList(data);
    };
    const delConfirm = async (id: number) => {
      Modal.confirm({
        title: "删除",
        content: "您确定要删除吗？",
        onOk: async () => {
          await Axios.post(deleteCanvasByIdEnd, {id});
          message.success("删除成功");
          fresh();
        },
      });
    };
    const publish = async (id: number) => {
      const res = await Axios.post(publishEnd, {
        id,
      });
      if (res) {
        message.success("发布成功");
        fresh();
      }
    };
    useEffect(()=>{
        fresh();
        console.log("fresh")
    },[isLogin])

    
    const editUrl =(item:ListItem) => `/?id=${item.id}&type=${item.type}`;
    const columns = [
        {
          title: "id",
          key: "id",
          render: (item: ListItem) => {
            return <Link to={editUrl(item)}>{item.id}</Link>;
          },
        },
        {
          title: "标题",
          key: "title",
          render: (item: ListItem) => {
            const title = item.title || "未命名";
            return <Link to={editUrl(item)}>{title}</Link>;
          },
        },
    
        {
          title: "类型",
          key: "type",
          render: (item: ListItem) => {
            const typeDesc = item.type === "content" ? "页面" : "模板页";
            return <div className="red">{typeDesc}</div>;
          },
        },

    {
      title: "显示",
      key: "thumbnail",
      render: (item: ListItem) => {
        return (
          <Image src={item.thumbnail.full} alt={item.title} height={150} />
        );
      },
    },
    
        {
          title: "动作",
          key: "action",
          render: (item: ListItem) => {
            const {id} = item;
            return (
              <Space size="middle">
              {
                item.publish === false ? (
                  <Button onClick={() => publish(id)}>发布</Button>
                ): (
                                  <a
                  target="_blank"
                  href={"http://localhost:3000/?id=" + id}>
                  线上查看（切移动端）
                </a> 
                )
              }
   
                {/* <Link to={editUrl(item)}>编辑</Link> */}
                <Button onClick={() => delConfirm(id)}>删除</Button>
              </Space>
            );
          },
        },
      ];
    
    return (
        <Card>
            <Link to = '/'>新增</Link>
            <Divider></Divider>
            <Table columns={columns}
                dataSource={list}
                rowKey={(record:ListItem )=>record.id}></Table>
        </Card>
    )
}