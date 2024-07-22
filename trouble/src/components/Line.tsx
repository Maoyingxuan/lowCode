import { Style } from "../store/editStoreType";

// todo id className 必选
interface LineProps {
  id?: string;
  style: Style;
}

// 根据width、height 决定线的方向
export default function Line({style, ...rest}: LineProps) {
  return (
    <div
      className="alignLine"
      {...rest}
      style={{
        zIndex: 9999,
        width: 1,
        height: 1,
        position: "absolute",
        backgroundColor: "rgba(0, 87, 255, 0.8)",
        ...style,
      }}></div>
  );
}
