import { InlineSVG } from "../../../utils"


const EmptyList = () => {
    return (
        <div className="col-xl-4 mb-xl-10">
            <div className="card bg-transparent h-md-100" dir="ltr">
                <div className="card-body d-flex flex-column flex-center">
                    <div className="mb-2">
                        <h1 className="fw-semibold text-gray-800 text-center lh-lg">
                        Let's manage and prioritise <span className="fw-bolder"> Tasks</span>
                        </h1>
                        <div className="py-10 text-center">
                        <InlineSVG
                      path='/media/icons/duotune/general/gen037.svg'
                      className='svg-icon-5x svg-icon-primary'
                    />
                        </div>
                    </div>
                    <div className="text-center mb-1">
                    <p>Start managing your tasks efficiently with the Task view. Create and organize your tasks to stay productive and focused!</p>
                    <p>Create Your First Task to start</p>

                    </div>
                </div>
            </div>
        </div>

    )
}

export default EmptyList