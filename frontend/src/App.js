import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/home/Home";
import Hotel from "./pages/hotel/Hotel";
import List from "./pages/list/List";
import Login from "./pages/login/Login"
import Register from "./pages/login/Register"
import Success from './components/success';
import Cancel from './components/cancel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/hotels" element={<List/>}/>
        <Route path="/hotels/:id" element={<Hotel/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route  path='/success' element={<Success />}/>
      <Route  path='/cancel' element={<Cancel />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
