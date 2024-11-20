/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useRef,useState} from 'react'
import {InlineSVG} from '../../utils'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import { useAuth } from '../auth'
import { toAbsoluteUrl } from '../../utils'
import { Avatar } from '../../components/common'
import ImageInput from './components/ImageInput'
import * as FirestoreService from '../../services/firestore'

const AccountHeader: React.FC = () => {
  const location = useLocation()
  const {currentUser, logout} = useAuth()
  const [selectedImage, setSelectedImage] = useState(currentUser?.photoURL);

  const handleImageSelected = (base64Data: string) => {
    setSelectedImage(base64Data);
    const who = {email:currentUser?.email }
        FirestoreService.editUser(who,{photoURL: base64Data ?? ""})
  };

  

  return (
    <div className='card mb-5 mb-xl-10'>
      <div className='card-body pt-9 pb-0'>
        <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
          <div className='me-7 mb-4'>
            <div className='avatar avatar-100px avatar-lg-160px avatar-fixed position-relative'>

            


<div className="image-input image-input-empty" //data-xgn-image-input="true"
>
  
    <div className="image-input-wrapper w-100px h-100px">
    <Avatar name={currentUser?.all?.fName} avatarUrl={selectedImage} size={100} className={''}/>
    </div>

    <label className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
    data-xgn-image-input-action="change"
    data-bs-toggle="tooltip"
    data-bs-dismiss="click"
    title="Change avatar">
        
        <ImageInput onImageSelected={handleImageSelected} />
        
       
    
    </label>
  
    <span className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
    data-xgn-image-input-action="cancel"
    data-bs-toggle="tooltip"
    data-bs-dismiss="click"
    title="Cancel avatar">
        <i className="bi bi-x fs-3"></i>
    </span>

    <span className="btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
    data-xgn-image-input-action="remove"
    data-bs-toggle="tooltip"
    data-bs-dismiss="click"
    title="Remove avatar">
        <i className="bi bi-x fs-3"></i>
    </span>
  
</div>

            
              <div className='position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px'></div>
            </div>
          </div>

          <div className='flex-grow-1'>
            <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
              <div className='d-flex flex-column'>
                <div className='d-flex align-items-center mb-2'>
                  <a href='#' className='text-gray-800 text-hover-primary fs-2 fw-bolder me-1'>
                  {currentUser?.all.fName}  {currentUser?.all.lName} 
                  </a>
                 {/*  If account validated
                  <a href='#'>
                    <InlineSVG
                      path='/media/icons/duotune/general/gen026.svg'
                      className='svg-icon-1 svg-icon-primary'
                    />
                  </a> */}
                 {/*  <a
                    href='#'
                    className='btn btn-sm btn-light-success fw-bolder ms-2 fs-8 py-1 px-3'
                    data-bs-toggle='modal'
                    data-bs-target='#xgn_modal_upgrade_plan'
                  >
                    Upgrade to Pro
                  </a> */}
                </div>

                <div className='d-flex flex-wrap fw-bold fs-6 mb-4 pe-2'>
                  <a
                    href='#'
                    className='d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2'
                  >
                    <InlineSVG
                      path='/media/icons/duotune/communication/com006.svg'
                      className='svg-icon-4 me-1'
                    />
                    {currentUser?.all.role} 
                  </a>
                  <a
                    href='#'
                    className='d-flex align-items-center text-gray-400 text-hover-primary me-5 mb-2'
                  >
                    <InlineSVG
                      path='/media/icons/duotune/general/gen018.svg'
                      className='svg-icon-4 me-1'
                    />
                    {currentUser?.all.workLocation} 
                  </a>
                  <a
                    href='#'
                    className='d-flex align-items-center text-gray-400 text-hover-primary mb-2'
                  >
                    <InlineSVG
                      path='/media/icons/duotune/communication/com011.svg'
                      className='svg-icon-4 me-1'
                    />
                    {currentUser?.email} 
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='d-flex overflow-auto h-55px'>
          <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap'>
            <li className='nav-item'>
              <Link
                className={
                  `nav-link text-active-primary me-6 ` +
                  (location.pathname === '/people/myaccount/overview' && 'active')
                }
                to='/people/myaccount/overview'
              >
                Overview
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                className={
                  `nav-link text-active-primary me-6 ` +
                  (location.pathname === '/people/myaccount/settings' && 'active')
                }
                to='/people/myaccount/settings'
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export {AccountHeader}
