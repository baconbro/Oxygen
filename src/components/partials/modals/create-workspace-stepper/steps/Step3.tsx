/* eslint-disable jsx-a11y/anchor-is-valid */
import {StepProps} from '../IAppModels'

const Step3 = ({data, updateData, hasError}: StepProps) => {
  return (
    <>
      {/*begin::Step 3 */}
      <div className='pb-5' data-xgn-stepper-element='content'>
        <div className='w-100'>
          {/*begin::Form Group */}
{/* 
          <div className='fv-row mb-10'>
            <label className='required fs-5 fw-semibold mb-2'>Database Name</label>

            <input
              type='text'
              className='form-control form-control-lg form-control-solid'
              name='dbname'
              value={data.appDatabase.databaseName}
              onChange={(e) =>
                updateData({
                  appDatabase: {
                    databaseName: e.target.value,
                    databaseSolution: data.appDatabase.databaseSolution,
                  },
                })
              }
            />
            {!data.appDatabase.databaseName && hasError && (
              <div className='fv-plugins-message-container'>
                <div data-field='appname' data-validator='notEmpty' className='fv-help-block'>
                  Database name is required
                </div>
              </div>
            )}
          </div> */}
          {/*end::Form Group */}

          {/*begin::Form Group */}
          <div className='fv-row'>
            <label className='d-flex align-items-center fs-5 fw-semibold mb-4'>
              <span className='required'>Select Team Members</span>

              <i
                className='fas fa-exclamation-circle ms-2 fs-7'
                data-bs-toggle='tooltip'
                title='Select your app database engine'
              ></i>
            </label>

            {/*begin:Option */}
            <label className='d-flex align-items-center justify-content-between cursor-pointer mb-6'>
              <span className='d-flex align-items-center me-2'>
                <span className='avatar avatar-50px me-6'>
                  <span className='avatar-label bg-light-success'>
                    <i className='bi bi-clock text-success fs-2x'></i>
                  </span>
                </span>

                <span className='d-flex flex-column'>
                  <span className='fw-bolder fs-6'>Add members later</span>
                  <span className='fs-7 text-muted'>Add members once the workspace is created</span>
                </span>
              </span>

              <span className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='radio'
                  name='databaseSolution'
                  value='MySQL'
                  checked={data.appDatabase.databaseSolution === 'MySQL'}
                  onChange={() =>
                    updateData({
                      appDatabase: {
                        databaseName: data.appDatabase.databaseName,
                        databaseSolution: 'MySQL',
                      },
                    })
                  }
                />
              </span>
            </label>
            {/*end::Option */}


          </div>
          {/*end::Form Group */}
        </div>
      </div>
      {/*end::Step 3 */}
    </>
  )
}

export {Step3}
