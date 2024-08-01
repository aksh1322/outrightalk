import React from 'react'
import { Redirect } from 'react-router'
import Layout from '../layout/Layout'

const reqLayout = (Component: React.ComponentType) => {
  function LayoutHoc(props: any) {
    return (
      <Layout>
        <Component {...props} />
      </Layout>
    )
  }

  return LayoutHoc
}
export default reqLayout
