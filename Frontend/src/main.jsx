import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './Q/App'
import './index.css'
import { ToastContainer } from 'react-toastify'; // Import the toast container
import 'react-toastify/dist/ReactToastify.css';
 //BY0iErycYClxWnIQ
//mongodb+srv://tarikufirdu:BY0iErycYClxWnIQ @devconnect.a99pu.mongodb.net/?retryWrites=true&w=majority&appName=devconnect
//mongodb+srv://tesfa:<db_password>@devconnect.a99pu.mongodb.net/?retryWrites=true&w=majority&appName=devconnect
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider  >
       
     <App /> 
     < ToastContainer />
    </ChakraProvider>
  </StrictMode>,
)
