import { createPortal } from 'react-dom';
import { Modal } from 'react-bootstrap';
import { toAbsoluteUrl } from '../../utils';

import { useEffect, useState } from 'react';

const Onboarding = () => {

const [selectValue1, setSelectValue1] = useState('');
const [selectValue2, setSelectValue2] = useState('');
const [selectValue3, setSelectValue3] = useState('');
const [selectValue4, setSelectValue4] = useState('');
const [showButton, setShowButton] = useState(false);

useEffect(() => {
  if (selectValue1 !== '' && selectValue2 !== '' && selectValue3 !== '' && selectValue4 !== '') {
    setShowButton(true);
  } else {
    setShowButton(false);
  }
}, [selectValue1, selectValue2, selectValue3, selectValue4]);

  return createPortal(
    <Modal
      id='xgn_modal_create_app'
      tabIndex={-1}
      aria-hidden='true'
      dialogClassName='modal-dialog modal-fullscreen'
      show={true}
    >
      <div className="d-flex flex-column flex-root" id="kt_app_root">
        <div className="d-flex flex-column flex-center flex-column-fluid">
          <div className="d-flex flex-column flex-center text-center p-10">
            <div className="card card-flush w-md-650px py-5">
              <div className="card-body py-15 py-lg-20">
                <div className="mb-7">

                  <img alt="Logo" src={toAbsoluteUrl('/media/logos/logo_oxy.png')} className="h-60px" />

                </div>
                <h1 className="fw-bolder text-gray-900 mb-5">Welcome to Oxygen</h1>
                <div className="fw-semibold fs-6 text-gray-500 mb-7">
                  <div className="input-group mb-5">
                    <span className="input-group-text ">I am a </span>
                    <select className='form-select form-select-transparent' value={selectValue1} onChange={e => setSelectValue1(e.target.value)}>
                      <option value=""></option>
                      <option value="option1">Business owner</option>
                      <option value="option2">Team leader</option>
                      <option value="option2">Team member</option>
                      <option value="option2">Freelancer / Consultant</option>
                      <option value="option2">Director</option>
                      <option value="option2">C-Level</option>
                      <option value="option2">VP</option>

                    </select>
                  </div>
                  <div className="input-group mb-5">
                    <span className="input-group-text">
                    I have a team of </span>
                    <select className='form-select form-select-transparent' value={selectValue2} onChange={e => setSelectValue2(e.target.value)}>
                      <option value=""></option>
                      <option value="option1">1</option>
                      <option value="option2">2-5</option>
                      <option value="option2">6-10</option>
                      <option value="option2">11-15</option>
                      <option value="option2">16-25</option>
                      <option value="option2">26-50</option>
                      <option value="option2">51-100</option>
                      <option value="option2">101+</option>
                    </select>
                    <span className="input-group-text"> people in a company of </span>
                    <select className='form-select form-select-transparent' value={selectValue3} onChange={e => setSelectValue3(e.target.value)}>
                      <option value=""></option>
                      <option value="option1">1-25</option>
                      <option value="option2">25-50</option>
                      <option value="option2">51-100</option>
                      <option value="option2">100-500</option>
                      <option value="option2">500-1000</option>
                      <option value="option2">1001+</option>
                      {/* Add more options as needed */}
                    </select> 
                    <span className="input-group-text">people </span>
                  </div>
                  <div className="input-group mb-5">
                    <span className="input-group-text ">
                    I am working in  </span>
                    <select className='form-select form-select-transparent' value={selectValue4} onChange={e => setSelectValue4(e.target.value)}>
                      <option value=""></option>
                      <option value="option1">Software developement</option>
                      <option value="option2">Sevice management</option>
                      <option value="option2">Product management</option>
                      <option value="option2">Customer success</option>
                      <option value="option2">Quality assurance</option>
                      <option value="option2">Research & Development</option>
                      <option value="option2">Project / portfolio management</option>
                      <option value="option2">Marketing</option>
                      <option value="option2">Human ressources</option>
                      <option value="option2">Finance</option>
                      <option value="option2">Design</option>
                      <option value="option2">Operations</option>
                      <option value="option2">Sales</option>
                      <option value="option2">Legal</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
                <div className="mb-0">
                  <img src="assets/media/auth/welcome.png" className="mw-100 mh-300px theme-light-show" alt="" />
                  <img src="assets/media/auth/welcome-dark.png" className="mw-100 mh-300px theme-dark-show" alt="" />
                </div>
                <div className="mb-0">
                {showButton && <a href="/create-workspace" className="btn btn-sm btn-primary">Next</a>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>,
    document.getElementById('root')!
  );
}

export default Onboarding;