import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from "../slices/authenticate/authenticateSlice";



function Menu() {
    // redux
    const dispatch = useDispatch();
    const navigate = useNavigate();


    // проверка аутентификации пользователя 
    const isAuthenticated = useSelector((state) => state.authenticate.isAuthenticated);

    // получаем пользователя
    const user = useSelector((state) => state.authenticate.user);


    // заглушка? в разметке есть зависимость от роли, и пока мы ее не узнаем (нужно залогиниться), нужно что бы что-то было
    let userRole = 'user';
    // если пользователь определен, то ставим роль, которую он имеет
    if (user) {
        userRole = user.role;
    }


    // Метод выхода
    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <>
            <nav className="py-3 bg-dark">
                <div className="container">
                    <ul className="nav">
                        {isAuthenticated === true ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className='nav-link text-light' to='/'>Доступные задачи</NavLink>
                                </li>
                                {userRole !== 'admin' && (
                                    <li className="nav-item">
                                        <NavLink className='nav-link text-light' to='/myTask'>Мои задачи</NavLink>
                                    </li>
                                )}

                                <li className="nav-item dropdown ms-auto">
                                    <button className="btn btn-dark dropdown-toggle" data-bs-toggle='dropdown' aria-expanded='false'>
                                        {user.username}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-dark">
                                        <li><button className="dropdown-item" onClick={handleLogout}>Выйти</button></li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item ms-auto">
                                    <NavLink className='nav-link text-light' to='/login'>Вход</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className='nav-link text-light' to='/register'>Регистрация</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </>
    )
};



export default Menu;
