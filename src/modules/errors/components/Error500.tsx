import {Link} from 'react-router-dom'

const Error500 = () => {
  return (
    <div className='d-flex flex-column flex-root'>
      <div className='d-flex flex-column flex-column-fluid'>
        <div className='d-flex flex-column flex-column-fluid text-center p-10 py-lg-15'>
          <div className='pt-lg-10 mb-10'>
            <h1 className='fw-bolder fs-2qx text-gray-800 mb-10'>System Error</h1>
            <div className='fw-bold fs-3 text-muted mb-15'>
              Something went wrong!
              <br />
              Please try again later.
            </div>
            <div className='text-center'>
              <Link to='/' className='btn btn-lg btn-primary fw-bolder'>
                Go to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {Error500}
