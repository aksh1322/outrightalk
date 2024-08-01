import React, { PropsWithChildren } from 'react'
import './Layout.css'

export default function AuthLayout(props: PropsWithChildren<any>) {
  return (
    <React.Fragment>
      <div className="main-content-wrapper">
      {props.children}
      </div>
    </React.Fragment>
  )
}
