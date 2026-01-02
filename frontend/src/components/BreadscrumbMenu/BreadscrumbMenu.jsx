import {HomeOutlined} from "@ant-design/icons";
import {Link} from "react-router";
import {Breadcrumb, Card} from "antd";

const BreadscrumbMenu = ({items = []}) => {
    const homeItem = {
        title: <Link to="/" style={{display: "flex", alignItems: "center", gap: "8px"}}><HomeOutlined />  Home</Link>,
    }

    const mappedItems = items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.href) {
            return {
                title: item.title,
            };
        }

        return {
            title: <Link to={item.href}>{item.title}</Link>,
        };
    });

    const allItems = [homeItem, ...mappedItems];

    return (
        <>
            <Card style={{ padding: 0,background: '#fff', borderRadius: '8px', boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <Breadcrumb items={allItems} />
            </Card>
        </>
    )
}

export default BreadscrumbMenu;