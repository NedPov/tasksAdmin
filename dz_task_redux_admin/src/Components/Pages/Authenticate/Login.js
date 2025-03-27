import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../slices/authenticate/authenticateSlice";





function Login() {
    // состояния
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // redux
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // state
    const error = useSelector(state => state.authenticate.error);
    const isAuthenticated = useSelector(state => state.authenticate.isAuthenticated);


    // отправка формы
    const handleSubmit = (e) => {
        e.preventDefault();

        // вызов метода
        dispatch(loginUser({ username, password }));

        // сброс состояний
        setUsername('');
        setPassword('');
    };

    // Перенаправление на таски, если успешно зашли
    if (isAuthenticated) {
        navigate('/');
    }




    return (
        <div className="container my-2">
            <h2 className="mb-4">Вход</h2>

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group my-3">
                    <input type="text" className="form-control" placeholder="Введите имя" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group my-3">
                    <input type="password" className="form-control" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className="btn btn-outline-success my-2">Войти</button>
            </form>
        </div>
    )
};

export default Login;


