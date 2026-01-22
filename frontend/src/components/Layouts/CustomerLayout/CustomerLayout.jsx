import Header from '../../Header/Header'
import Footer from '../../Footer/Footer'
import React from 'react'
import {Outlet} from "react-router-dom"
import {Layout} from "antd";
const { Header: LayoutHeader, Footer: LayoutFooter, Content: LayoutContent } = Layout;


const CustomerLayout = () => {
  return (
    <>
      <Layout>
          <header>
              <Header/>
          </header>
          <LayoutContent style={{ padding: '24px 120px', minHeight: 'calc(100vh - 128px)' }}>
              <Outlet />
          </LayoutContent>
          <footer>
              {/* <Footer/> */}
          </footer>
      </Layout>
    </>
  )
}

export default CustomerLayout