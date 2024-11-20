/* eslint-disable jsx-a11y/anchor-is-valid */
import {StepProps} from '../IAppModels'
import { templateScrum } from '../templates/Scrum'
import { templateProjectManagement } from '../templates/ProjectManagement'
import { templateRecruitment } from '../templates/Recruitment'
import { templateMarketing } from '../templates/Marketing'
import { templateLegal } from '../templates/Legal'
import { templateSales } from '../templates/Sales'
import { templatePortfolio } from '../templates/Portfolio'

const Step2 = ({data, updateData}: StepProps) => {
  return (
    <div className='pb-5' data-xgn-stepper-element='content'>
      <div className='w-100'>
        {/*begin::Form Group */}
        <div className='fv-row'>
          {/* begin::Label */}
          <label className='d-flex align-items-center fs-5 fw-semibold mb-4'>
            <span className='required'>Select Template</span>
            <i
              className='fas fa-exclamation-circle ms-2 fs-7'
              data-bs-toggle='tooltip'
              title='Specify your workplace template'
            ></i>
          </label>
          {/* end::Label */}

                    {/*begin:Option */}
                    <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-success'>
                  <i className='bi bi-code-slash text-success fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Software developement</span>
                <span className='fs-7 text-muted'>Structured framework for software lifecycle from conception to deployment</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Soft'
                checked={data.appFramework === 'Soft'}
                onChange={() => updateData({appFramework: 'Soft',appConfig : templateScrum})}
              />
            </span>
          </label>
          {/*end::Option */}
                              {/*begin:Option */}
                              <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-primary'>
                  <i className='bi bi-calendar-check text-primary fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Project management</span>
                <span className='fs-7 text-muted'>A holistic approach to managing projects, covering planning, execution and monitoring.</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Project'
                checked={data.appFramework === 'Project'}
                onChange={() => updateData({appFramework: 'Project',appConfig : templateProjectManagement})}
              />
            </span>
          </label>
          {/*end::Option */}

          {/*begin:Option */}
          <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-info'>
                  <i className='bi bi-person-plus-fill text-info fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Recruitment</span>
                <span className='fs-7 text-muted'>From application to offer</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Recruitment'
                checked={data.appFramework === 'Recruitment'}
                onChange={() => updateData({appFramework: 'Recruitment',appConfig : templateRecruitment})}
              />
            </span>
          </label>
          {/*end::Option */}
            {/*begin:Option */}
            <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-primary'>
                  <i className='bi bi-person-check text-primary fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Marketing</span>
                <span className='fs-7 text-muted'>Plan, prioritize and track progress your content</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Marketing'
                checked={data.appFramework === 'Marketing'}
                onChange={() => updateData({appFramework: 'Marketing',appConfig : templateMarketing})}
              />
            </span>
          </label>
          {/*end::Option */}
                      {/*begin:Option */}
                      <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-warning'>
                  <i className='bi bi-file-earmark-text-fill text-warning fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Legal</span>
                <span className='fs-7 text-muted'>Track critical documents from creation to approval with an audit trail.</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Legal'
                checked={data.appFramework === 'Legal'}
                onChange={() => updateData({appFramework: 'Legal',appConfig : templateLegal})}
              />
            </span>
          </label>
          {/*end::Option */}
           {/*begin:Option */}
           <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-primary'>
                  <i className='bi bi-lightning-fill text-primary fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Sales</span>
                <span className='fs-7 text-muted'>Track lead from opportunity to conversion.</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Sales'
                checked={data.appFramework === 'Sales'}
                onChange={() => updateData({appFramework: 'Sales',appConfig : templateSales})}
              />
            </span>
          </label>
          {/*end::Option */}
                     {/*begin:Option */}
                     <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
            <span className='d-flex align-items-center me-2'>
              <span className='avatar avatar-50px me-6'>
                <span className='avatar-label bg-light-danger'>
                  <i className='bi bi-boxes text-danger fs-2x'></i>
                </span>
              </span>

              <span className='d-flex flex-column'>
                <span className='fw-bolder fs-6'>Portfolio</span>
                <span className='fs-7 text-muted'>Oversee multiple projects, allocate resources, and track overall progress.</span>
              </span>
            </span>

            <span className='form-check form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='radio'
                name='appFramework'
                value='Portfolio'
                checked={data.appFramework === 'Portfolio'}
                onChange={() => updateData({appFramework: 'Portfolio',appConfig : templatePortfolio})}
              />
            </span>
          </label>
          {/*end::Option */}

         
        </div>
        {/*end::Form Group */}
      </div>
    </div>
  )
}

export {Step2}
