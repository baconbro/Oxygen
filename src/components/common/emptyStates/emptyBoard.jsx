const EmptyBoard = () => {
    return (
        <div className="col-xl-4 mb-xl-10">
            <div className="card bg-transparent h-md-100" dir="ltr">
                <div className="card-body d-flex flex-column flex-center">
                    <div className="mb-2">
                        <h1 className="fw-semibold text-gray-800 text-center lh-lg">
                        Let's create issue in your <span className="fw-bolder"> Kanban</span>
                        </h1>
                        <div className="py-10 text-center">
                        <i
                      
                      className='bi bi-kanban text-primary fs-4x'
                    />
                        </div>
                    </div>
                    <div className="text-center mb-1">
                    <p>Elevate your project management efficiency and visibility with Oxygen's intuitive Kanban boards. Visualize tasks, enhance team collaboration, and achieve optimal workflow control for unmatched productivity</p>
                        <p>Organize, prioritize, and manage work seamlessly, delivering results faster and with increased agility. Stay on top of projects with real-time insights, driving continuous improvement.</p>

                    </div>
                </div>
            </div>
        </div>

    )
}

export default EmptyBoard