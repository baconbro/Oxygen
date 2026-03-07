import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { defaultCreateAppData, ICreateAppData } from './IAppModels'
import { StepperComponent } from '../../../../components/common'
import { InlineSVG } from '../../../../utils'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'
import { Step4 } from './steps/Step4'
import { Step5 } from './steps/Step5'
import { createSpace } from '../../../../services/firestore'
import toast from '../../../../utils/toast'
import { isAcronymAvailable } from '../../../../services/workspaceServices'
import { useAuth } from '../../../../modules/auth'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

type Props = {
  show: boolean
  handleClose: () => void
}

const modalsRoot = document.getElementById('root-modals') || document.body

const CreateWorkspaceModal = ({ show, handleClose }: Props) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const stepper = useRef<StepperComponent | null>(null)
  const [data, setData] = useState<ICreateAppData>(defaultCreateAppData)
  const [hasError, setHasError] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const loadStepper = () => {
    stepper.current = StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
  }

  const updateData = (fieldsToUpdate: Partial<ICreateAppData>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }

  const checkAppBasic = async (): Promise<boolean> => {
    if (!data.appBasic.appName || !data.appBasic.appType) {
      return false
    }
    const acro = (data.appBasic.acronym || '').toUpperCase().trim()
    const valid = /^[A-Z]{2,5}$/.test(acro)
    if (!valid) return false
    const available = await isAcronymAvailable(acro)
    if (!available) {
      toast.error('Acronym already in use, please choose another')
      return false
    }
    return true
  }

  const checkAppDataBase = (): boolean => {
    if (!data.appDatabase.databaseName || !data.appDatabase.databaseSolution) {
      return false
    }

    return true
  }

  const prevStep = () => {
    if (!stepper.current) {
      return
    }

    stepper.current.goPrev()
  }

  const nextStep = async () => {
    setHasError(false)
    if (!stepper.current) {
      return
    }

    if (stepper.current.getCurrentStepIndex() === 1) {
      const ok = await checkAppBasic()
      if (!ok) {
        setHasError(true)
        return
      }
    }

    if (stepper.current.getCurrentStepIndex() === 3) {
      if (!checkAppDataBase()) {
        setHasError(true)
        return
      }
    }

    stepper.current.goNext()
  }

  const submit = async () => {
    const values = {
      org: currentUser?.all?.currentOrg ?? currentUser?.all?.orgs[0],
      title: data.appBasic.appName,
      config: data.appConfig,
      acronym: (data.appBasic.acronym || '').toUpperCase().trim()
    }
    try {
      // final validation
      const ok = await checkAppBasic()
      if (!ok) { setHasError(true); return }
      const newSpace = await createSpace(values, currentUser);
      if (newSpace) {
        // Invalidate workspaces cache to reflect the new workspace
        queryClient.invalidateQueries({ queryKey: ['Workspaces', values.org] })
        navigate(`/workspace/${newSpace}/board`, { replace: true });
      }
    } catch (error) {
      // Error handled silently
    }
    handleClose()
  }

  return createPortal(
    <Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-[100vw] h-[100vh] m-0 p-0 rounded-none border-none flex flex-col sm:max-w-[100vw]"
        onOpenAutoFocus={loadStepper}
      >
        <DialogTitle className="sr-only">Create Workspace</DialogTitle>
        <DialogDescription className="sr-only">Follow the steps to create a new workspace.</DialogDescription>

        <div className='flex items-center justify-between px-6 py-4 border-b bg-background'>
          <h2 className="text-xl font-semibold m-0">Create Workspace</h2>
          <div className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted cursor-pointer transition-colors' onClick={handleClose}>
            <InlineSVG className='w-4 h-4 text-muted-foreground' path='/media/icons/duotune/arrows/arr061.svg' />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-4 md:p-10'>
          <div
            ref={stepperRef}
            className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid'
            id='xgn_modal_create_app_stepper'
          >
            <div className='d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-300px'>
              <div className='stepper-nav ps-lg-10'>
                <div className='stepper-item current' data-xgn-stepper-element='nav'>
                  <div className='stepper-wrapper'>
                    <div className='stepper-icon w-40px h-40px'>
                      <i className='stepper-check fas fa-check'></i>
                      <span className='stepper-number'>1</span>
                    </div>
                    <div className='stepper-label'>
                      <h3 className='stepper-title'>Details</h3>

                      <div className='stepper-desc'>Name your workspace</div>
                    </div>
                  </div>
                  <div className='stepper-line h-40px'></div>
                </div>
                <div className='stepper-item' data-xgn-stepper-element='nav'>
                  <div className='stepper-wrapper'>
                    <div className='stepper-icon w-40px h-40px'>
                      <i className='stepper-check fas fa-check'></i>
                      <span className='stepper-number'>2</span>
                    </div>
                    <div className='stepper-label'>
                      <h3 className='stepper-title'>Template</h3>

                      <div className='stepper-desc'>Define your workplace template</div>
                    </div>
                  </div>
                  <div className='stepper-line h-40px'></div>
                </div>
                <div className='stepper-item' data-xgn-stepper-element='nav'>
                  <div className='stepper-wrapper'>
                    <div className='stepper-icon w-40px h-40px'>
                      <i className='stepper-check fas fa-check'></i>
                      <span className='stepper-number'>3</span>
                    </div>
                    <div className='stepper-label'>
                      <h3 className='stepper-title'>Collaboration</h3>

                      <div className='stepper-desc'>Select team members</div>
                    </div>
                  </div>
                  <div className='stepper-line h-40px'></div>
                </div>
                <div className='stepper-item' data-xgn-stepper-element='nav'>
                  <div className='stepper-wrapper'>
                    <div className='stepper-icon w-40px h-40px'>
                      <i className='stepper-check fas fa-check'></i>
                      <span className='stepper-number'>4</span>
                    </div>
                    <div className='stepper-label'>
                      <h3 className='stepper-title'>Configuration</h3>

                      <div className='stepper-desc'>Add extra configuration</div>
                    </div>
                  </div>
                  <div className='stepper-line h-40px'></div>
                </div>
                <div className='stepper-item' data-xgn-stepper-element='nav'>
                  <div className='stepper-wrapper'>
                    <div className='stepper-icon w-40px h-40px'>
                      <i className='stepper-check fas fa-check'></i>
                      <span className='stepper-number'>5</span>
                    </div>
                    <div className='stepper-label'>
                      <h3 className='stepper-title'>Completed</h3>

                      <div className='stepper-desc'>Review and Create</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex-row-fluid py-lg-5 px-lg-15'>
              <form noValidate id='xgn_modal_create_app_form'>
                <Step1 data={data} updateData={updateData} hasError={hasError} />
                <Step2 data={data} updateData={updateData} hasError={hasError} />
                <Step3 data={data} updateData={updateData} hasError={hasError} />
                <Step4 data={data} updateData={updateData} hasError={hasError} />
                <Step5 />

                <div className='d-flex flex-stack pt-10'>
                  <div className='me-2'>
                    <button
                      type='button'
                      className='btn btn-lg btn-light-primary me-3'
                      data-xgn-stepper-action='previous'
                      onClick={prevStep}
                    >
                      <InlineSVG
                        path='/media/icons/duotune/arrows/arr063.svg'
                        className='svg-icon-3 me-1'
                      />{' '}
                      Previous
                    </button>
                  </div>
                  <div>
                    <button
                      type='button'
                      className='btn btn-lg btn-primary'
                      data-xgn-stepper-action='submit'
                      onClick={submit}
                    >
                      Create{' '}
                      <InlineSVG
                        path='/media/icons/duotune/arrows/arr064.svg'
                        className='svg-icon-3 ms-2 me-0'
                      />
                    </button>

                    <button
                      type='button'
                      className='btn btn-lg btn-primary'
                      data-xgn-stepper-action='next'
                      onClick={nextStep}
                    >
                      Next Step{' '}
                      <InlineSVG
                        path='/media/icons/duotune/arrows/arr064.svg'
                        className='svg-icon-3 ms-1 me-0'
                      />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>,
    modalsRoot
  )
}

export { CreateWorkspaceModal }
