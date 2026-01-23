import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import AllRoutes from "./components/AllRoutes/AllRoutes.jsx";
import authService from './services/authService.js'
import { setLoginSuccess } from './redux/actions/authAction.js'

function App() {
  const dispatch = useDispatch()
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    // Restore session by checking with server
    // Token is in httpOnly cookie, so just verify session is valid
    const restoreSession = async () => {
      try {
        // Try to get user data - if cookie is valid, this will succeed
        const response = await authService.checkSession()
        if (response && response.data) {
          dispatch(setLoginSuccess(response.data))
        }
      } catch {
        // No valid session - user needs to login
      }
      
      setIsRestoring(false)
    }

    restoreSession()
  }, [dispatch])

  // Show nothing or a loading spinner while restoring session
  if (isRestoring) {
    return null
  }

  return (
    <>
        <AllRoutes/>
    </>
  )
}

export default App
