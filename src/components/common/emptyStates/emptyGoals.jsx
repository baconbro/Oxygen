import { InlineSVG } from "../../../utils"

const EmptyGoals = () => {
    return (
        <div className="d-flex justify-content-center">
            <div className="card bg-transparent h-md-100" style={{ maxWidth: 500 }}>
                <div className="card-body d-flex flex-column flex-center">
                    <div className="mb-2">
                        <h1 className="fw-semibold text-gray-800 text-center lh-lg">
                            Let's Set and Achieve <span className="fw-bolder">Goals</span>
                        </h1>
                        <div className="py-10 text-center">
                            <InlineSVG
                                path='/media/icons/duotune/general/gen020.svg'
                                className='svg-icon-5x svg-icon-warning'
                            />
                        </div>
                    </div>
                    <div className="text-center mb-1">
                        <p className="text-gray-600">Track your goals and achieve success with the OKR view.</p>
                        <p className="text-gray-600">Start setting objectives to drive progress and reach your targets!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyGoals
