/* eslint-disable jsx-a11y/anchor-is-valid */
import {StepProps} from '../IAppModels'
import { useEffect, useState } from 'react'
import { isAcronymAvailable } from '../../../../../services/workspaceServices'

const Step1 = ({data, updateData, hasError}: StepProps) => {
  const [acroStatus, setAcroStatus] = useState<'idle'|'checking'|'available'|'unavailable'|'invalid'>('idle')
  const [acroMsg, setAcroMsg] = useState<string>('')

  useEffect(() => {
    const acro = (data.appBasic.acronym || '').toUpperCase().trim()
    if (!acro) { setAcroStatus('idle'); setAcroMsg(''); return }
    const valid = /^[A-Z]{2,5}$/.test(acro)
    if (!valid) { setAcroStatus('invalid'); setAcroMsg('Use 2–5 uppercase letters (A–Z).'); return }
    setAcroStatus('checking'); setAcroMsg('Checking availability…')
    const t = setTimeout(async () => {
      try {
        const available = await isAcronymAvailable(acro)
        if (available) { setAcroStatus('available'); setAcroMsg('Acronym is available.') }
        else { setAcroStatus('unavailable'); setAcroMsg('Acronym already in use.') }
      } catch (e) {
        setAcroStatus('idle'); setAcroMsg('')
      }
    }, 350)
    return () => clearTimeout(t)
  }, [data.appBasic.acronym])
  return (
    <div className='current' data-xgn-stepper-element='content'>
      <div className='w-100'>
        {/*begin::Form Group */}
        <div className='fv-row mb-10'>
          <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
            <span className='required'>Workspace Name</span>
            <i
              className='fas fa-exclamation-circle ms-2 fs-7'
              data-bs-toggle='tooltip'
              title='Specify your unique app name'
            ></i>
          </label>
          <input
            type='text'
            className='form-control form-control-lg form-control-solid'
            name='appname'
            placeholder=''
            value={data.appBasic.appName}
            onChange={(e) =>
              {
                const name = e.target.value
                const suggested = name
                  .toUpperCase()
                  .replace(/[^A-Z]/g, ' ')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map(w => w.charAt(0))
                  .join('')
                  .slice(0,5)

                const nextAcr = data.appBasic.acronymEdited ? (data.appBasic.acronym || '') : suggested
                updateData({
                  appBasic: {
                    ...data.appBasic,
                    appName: name,
                    appType: 'Quick Online Courses',
                    acronym: nextAcr,
                  },
                })
              }
            }
          />
          {!data.appBasic.appName && hasError && (
            <div className='fv-plugins-message-container'>
              <div data-field='appname' data-validator='notEmpty' className='fv-help-block'>
                Name is required
              </div>
            </div>
          )}
        </div>
        {/*end::Form Group */}

        {/* Acronym */}
        <div className='fv-row mb-10'>
          <label className='d-flex align-items-center fs-5 fw-semibold mb-2'>
            <span className='required'>Acronym (2–5 letters)</span>
          </label>
      <input
            type='text'
            className='form-control form-control-lg form-control-solid'
            name='acronym'
            placeholder='e.g., MOB'
            value={data.appBasic.acronym || ''}
            onChange={(e) => {
              const next = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0,5)
        updateData({ appBasic: { ...data.appBasic, acronym: next, acronymEdited: true }})
            }}
          />
          {(!data.appBasic.acronym || !/^([A-Z]{2,5})$/.test(data.appBasic.acronym)) && hasError && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>A valid acronym is required</div>
            </div>
          )}
          {acroStatus !== 'idle' && (
            <div className='fv-plugins-message-container mt-2'>
              <div className={`fv-help-block ${acroStatus === 'available' ? 'text-success' : acroStatus === 'unavailable' || acroStatus === 'invalid' ? 'text-danger' : 'text-muted'}`}>{acroMsg}</div>
            </div>
          )}
        </div>


       {/*  <div className='fv-row'>

          <label className='d-flex align-items-center fs-5 fw-semibold mb-4'>
            <span className='required'>Category</span>

            <i
              className='fas fa-exclamation-circle ms-2 fs-7'
              data-bs-toggle='tooltip'
              title='Select your app category'
            ></i>
          </label>
 
          <div>

            <label className='d-flex align-items-center justify-content-between mb-6 cursor-pointer'>
              <span className='d-flex align-items-center me-2'>
                <span className='avatar avatar-50px me-6'>
                  <span className='avatar-label bg-light-primary'>
                    <InlineSVG
                      path='/media/icons/duotune/maps/map004.svg'
                      className='svg-icon-1 svg-icon-primary'
                    />
                  </span>
                </span>

                <span className='d-flex flex-column'>
                  <span className='fw-bolder fs-6'>Quick Online Courses</span>
                  <span className='fs-7 text-muted'>
                    Creating a clear text structure is just one SEO
                  </span>
                </span>
              </span>

              <span className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='radio'
                  name='appType'
                  value='Quick Online Courses'
                  checked={data.appBasic.appType === 'Quick Online Courses'}
                  onChange={() =>
                    updateData({
                      appBasic: {
                        appName: data.appBasic.appName,
                        appType: 'Quick Online Courses',
                      },
                    })
                  }
                />
              </span>
            </label>
 
            <label className='d-flex align-items-center justify-content-between mb-6 cursor-pointer'>
              <span className='d-flex align-items-center me-2'>
                <span className='avatar avatar-50px me-6'>
                  <span className='avatar-label bg-light-danger'>
                    <InlineSVG
                      path='/media/icons/duotune/general/gen024.svg'
                      className='svg-icon-1 svg-icon-danger'
                    />
                  </span>
                </span>

                <span className='d-flex flex-column'>
                  <span className='fw-bolder fs-6'>Face to Face Discussions</span>
                  <span className='fs-7 text-muted'>
                    Creating a clear text structure is just one aspect
                  </span>
                </span>
              </span>

              <span className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='radio'
                  name='appType'
                  value='Face to Face Discussions'
                  checked={data.appBasic.appType === 'Face to Face Discussions'}
                  onChange={() =>
                    updateData({
                      appBasic: {
                        appName: data.appBasic.appName,
                        appType: 'Face to Face Discussions',
                      },
                    })
                  }
                />
              </span>
            </label>

            <label className='d-flex align-items-center justify-content-between mb-6 cursor-pointer'>
              <span className='d-flex align-items-center me-2'>
                <span className='avatar avatar-50px me-6'>
                  <span className='avatar-label bg-light-success'>
                    <InlineSVG
                      path='/media/icons/duotune/general/gen013.svg'
                      className='svg-icon-1 svg-icon-success'
                    />
                  </span>
                </span>

                <span className='d-flex flex-column'>
                  <span className='fw-bolder fs-6'>Full Intro Training</span>
                  <span className='fs-7 text-muted'>
                    Creating a clear text structure copywriting
                  </span>
                </span>
              </span>

              <span className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='radio'
                  name='appType'
                  value='Full Intro Training'
                  checked={data.appBasic.appType === 'Full Intro Training'}
                  onChange={() =>
                    updateData({
                      appBasic: {
                        appName: data.appBasic.appName,
                        appType: 'Full Intro Training',
                      },
                    })
                  }
                />
              </span>
            </label>

          </div>
        </div> */}

      </div>
    </div>
  )
}

export {Step1}
