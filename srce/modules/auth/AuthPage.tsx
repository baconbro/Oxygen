/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Registration } from './components/Registration'
import { ForgotPassword } from './components/ForgotPassword'
import { Login } from './components/Login'
import { toAbsoluteUrl } from '../../utils'
import { Link } from "react-router-dom";
import { VerifyEmail } from './components/VerifyEmail'

const AuthLayout = () => {
  useEffect(() => {
    document.body.classList.add('bg-body')
    return () => {
      document.body.classList.remove('bg-body')
    }
  }, [])

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid' style={{ backgroundColor: '#DBDFE9' }}>
      <div className="d-flex flex-lg-row-fluid">

        <div className="d-flex flex-column flex-center pb-0 pb-lg-10 p-10 w-100">
          <Link to='/' className="py-9 mb-5">
            <img alt="Logo" src={toAbsoluteUrl('/media/logos/logo_oxy.png')} className="h-60px" /><span className="badge badge-light-primary me-auto">Beta V1.0</span>
          </Link>


          <h1 className="text-gray-800 fs-2qx fw-bold text-center mb-7">Welcome to Oxygen</h1>

          <div className=" fs-base text-center fw-semibold">Empower people and teams to achieve more</div>

        </div>

      </div>
      {/* begin::Content */}
      <div className="d-flex flex-column-fluid flex-lg-row-auto justify-content-center justify-content-lg-end p-12">
        <div className="bg-body d-flex flex-center rounded-4 w-md-600px p-10">

          {/* begin::Wrapper */}
          <div className='w-md-400px'>
            <Outlet />
          </div>
          {/* end::Wrapper */}
        </div>
      </div>
      {/* end::Content */}
    </div>
  )
}

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path='login' element={<Login />} />
      <Route path='registration' element={<Registration />} />
      <Route path='forgot-password' element={<ForgotPassword />} />
      <Route path='verify-email' element={<VerifyEmail />} />
      <Route index element={<Login />} />
    </Route>
  </Routes>
)

export { AuthPage }
