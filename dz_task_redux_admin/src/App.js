import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle';

import { BrowserRouter as Router, Routes, Route, redirect as Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';


import Menu from './Components/Menu';
import Login from './Components/Pages/Authenticate/Login';
import Register from './Components/Pages/Authenticate/Register';
import Tasks from './Components/Pages/Tasks/Tasks';
import TaskActive from './Components/Pages/Tasks/TaskActive';




function App() {

  // получили данные пользователя
  const user = useSelector((state) => state.authenticate.user);

  // по дефолту роль = user. /сделано так потому что иначе выпадает ошибка
  let userRole = 'user';

  if(user){
    // если пользователь есть(вошли в систему) меняем роль на ту, которая есть у пользователся
    userRole = user.role;
  }

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <div className="d-flex flex-column min-vh-100">
          <Router>
            <Menu />
            <main className='flex-grow-1'>
              <Routes>
                <Route path='/' element={<Tasks />} />
                {userRole !== 'admin' && (
                  <Route path='/myTask' element={<TaskActive />} />
                )}
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
              </Routes>
            </main>

          </Router>
        </div>

        <footer className='py-3 bg-dark'>
          <div className="container d-flex justify-content-center align-items-center text-light">
            2025, Tasks Corporate. &copy; All Rights Reserved.
          </div>
        </footer>

      </div>
    </>
  );
}

export default App;
