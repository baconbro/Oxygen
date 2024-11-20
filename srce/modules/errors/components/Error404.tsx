import {Link} from 'react-router-dom'

const Error404 = () => {
  return (
    <div className='d-flex flex-column flex-root'>
      <div className='d-flex flex-column flex-center flex-column-fluid p-10'>
        <h1 className='fw-bold mb-10' style={{color: '#A3A3C7'}}>
          Seems there is nothing here
        </h1>
        <Link to='/' className='btn btn-primary'>
          Return Home
        </Link>
      </div>
    </div>
  )
}

export {Error404}
