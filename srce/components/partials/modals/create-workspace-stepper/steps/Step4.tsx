/* eslint-disable jsx-a11y/anchor-is-valid */
import {StepProps} from '../IAppModels'

const Step4 = ({data, updateData}: StepProps) => {
  return (
    <>
      {/*begin::Step 4 */}
      <div className='pb-5' data-xgn-stepper-element='content'>
        <div className='w-100'>
          {/*begin::Form Group */}
          <div className='fv-row'>
            <label className='fs-6 fw-bolder text-dark mb-7d-flex align-items-center fs-5 fw-semibold mb-4'>
              <span className='required'>Select Configuration</span>
            </label>

            {/*begin:Option */}
            <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
              <span className='d-flex align-items-center me-2'>
                <span className='avatar avatar-50px me-6'>
                  <span className='avatar-label bg-light-primary'>
                    <i className='bi bi-gear text-primary fs-2x'></i>
                  </span>
                </span>

                <span className='d-flex flex-column'>
                  <span className='fw-bolder fs-6'>Default Configuration</span>
                  <span className='fs-7 text-muted'>All tools availables</span>
                </span>
              </span>

              <span className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='radio'
                  name='appStorage'
                  value='Basic Server'
                  checked={data.appStorage === 'Basic Server'}
                  onChange={() => updateData({appStorage: 'Basic Server'})}
                />
              </span>
            </label>
            {/*end::Option */}


          </div>
          {/*end::Form Group */}
        </div>
      </div>
      {/*end::Step 4 */}
    </>
  )
}

export {Step4}
