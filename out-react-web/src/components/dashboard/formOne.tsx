import React, { useEffect } from 'react'

export default function FormOne() {

    return (
        <div className="card">
        <div className="card-body">
          <h4 className="card-title">Default form1</h4>
          <p className="card-description"> Basic form layout </p>
          <form className="forms-sample">
            <div className="form-group">
              <label htmlFor="exampleInputUsername1">Username</label>
              <input type="text" className="form-control" id="exampleInputUsername1" placeholder="Username" />
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputEmail1">Email address</label>
              <input type="email" className="form-control" id="exampleInputEmail1" placeholder="Email" />
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputPassword1">Password</label>
              <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" />
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputConfirmPassword1">Confirm Password</label>
              <input type="password" className="form-control" id="exampleInputConfirmPassword1" placeholder="Password" />
            </div>
            <div className="form-check form-check-flat form-check-primary">
              <label className="form-check-label">
                <input type="checkbox" className="form-check-input" /> Remember me </label>
            </div>
            <button type="submit" className="btn btn-primary mr-2">Submit</button>
            <button className="btn btn-dark">Cancel</button>
          </form>
        </div>
      </div>
    )
  }
  