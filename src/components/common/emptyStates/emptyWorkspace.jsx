import { InlineSVG } from "../../../utils"


const EmptyWorkspace = () => {
    return (
        <div className="col-xl-4 mb-xl-10">
            <div className="card bg-transparent h-md-100" dir="ltr">
                <div className="card-body d-flex flex-column flex-center">
                    <div className="mb-2">
                        <h1 className="fw-semibold text-gray-800 text-center lh-lg">
                        Let's use a <span className="fw-bolder"> Workspace</span> with your team
                        </h1>
                        <div className="py-10 text-center">
                        <InlineSVG
                      path='/media/icons/duotune/general/gen037.svg'
                      className='svg-icon-5x svg-icon-primary'
                    />
                        </div>
                    </div>
                    <div className="text-center mb-1">
                    <p>Empower your team with a dynamic workspace hub to plan, execute, and track activities flawlessly. Boost collaboration, streamline workflows, and accelerate your team success.</p>
                        <p>Supercharge your initiatives. From idea to execution, stay in control of tasks, deadlines, and progress, ensuring your team thrive.</p>

                    </div>
                </div>
            </div>
        </div>

    )
}

export default EmptyWorkspace