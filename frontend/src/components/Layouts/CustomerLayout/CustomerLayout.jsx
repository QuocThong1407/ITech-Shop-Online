import Header from '../../Header/Header'
import Footer from '../../Footer/Footer'
import React from 'react'
import {Outlet} from "react-router-dom"
import {Layout, FloatButton} from "antd";
import {MessageOutlined} from "@ant-design/icons";
const { Header: LayoutHeader, Footer: LayoutFooter, Content: LayoutContent } = Layout;


const CustomerLayout = () => {
  return (
    <>
      <Layout>
          <header>
              <Header/>
          </header>
          <LayoutContent className="page-content">
              <Outlet />
          </LayoutContent>
          <footer>
              <Footer/>
          </footer>
      </Layout>
      <FloatButton
          icon={<MessageOutlined />}
          type="primary"
          style={{ right: 24, bottom: 24 }}
          onClick={() => window.open('https://www.messenger.com/', '_blank')}
      />
    </>
  )
}

export default CustomerLayout