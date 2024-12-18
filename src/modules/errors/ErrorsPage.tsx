import {Route, Routes, Outlet} from 'react-router-dom'
import {Error500} from './components/Error500'
import {Error404} from './components/Error404'

const ErrorsLayout = () => {
  return <Outlet />
}

const ErrorsPage = () => (
  <Routes>
    <Route element={<ErrorsLayout />}>
      <Route path='404' element={<Error404 />} />
      <Route path='500' element={<Error500 />} />
      <Route index element={<Error404 />} />
    </Route>
  </Routes>
)

export {ErrorsPage}
