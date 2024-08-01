import React, { useState, useEffect } from 'react'
import InnerContactListsSetting from './innerContactList';
import InnerBlockListsSetting from './innerBlockList';

function ManageContactListsSetting() {

  const [activeTab, setActiveTab] = useState('contact-list')


  const handleTabChange = (e: any, tab: string) => {
    e.preventDefault()
    setActiveTab(tab)
  }



  const csvData = [
    ["firstname", "lastname", "email"],
    ["Ahmed", "Tomi", "ah@smthing.co.com"],
    ["Raed", "Labes", "rl@smthing.co.com"],
    ["Yezzi", "Min l3b", "ymin@cocococo.com"]
  ];

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner my_pref">
        <ul className="nav nav-tabs custom-tab" role="tablist">
          <li className="nav-item">
            <a className={activeTab == 'contact-list' ? "nav-link active nav-link" : "nav-link"} onClick={(e) => handleTabChange(e, 'contact-list')} data-bs-toggle="tab" href="#" role="tab" aria-selected={activeTab == 'contact-list' ? true : false}>
              <span >Contact Lists</span>
            </a>
          </li>
          <li className="nav-item">
            <a className={activeTab == 'block-list' ? "nav-link active nav-link" : "nav-link"} onClick={(e) => handleTabChange(e, 'block-list')} data-bs-toggle="tab" href="#" role="tab" aria-selected={activeTab == 'block-list' ? true : false}>
              <span>Block Lists</span>
            </a>
          </li>
        </ul>


        {activeTab == 'contact-list' ?
          <InnerContactListsSetting />
          :
          <InnerBlockListsSetting />
        }

      </div>
    </React.Fragment >
  )
}

export default ManageContactListsSetting
