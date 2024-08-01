import React from 'react'

function Footer() {
  return (
    <footer className="footer">
      <div className="d-sm-flex justify-content-center justify-content-sm-between">
        <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">Copyright © {(new Date().getFullYear())}. All rights reserved.</span>
        <span className="text-muted float-none float-sm-right d-block mt-1 mt-sm-0 text-center">Change Management</span>
      </div>
    </footer>
  )
}

export default Footer
