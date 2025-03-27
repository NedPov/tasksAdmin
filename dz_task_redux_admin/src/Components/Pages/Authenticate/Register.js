import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../slices/authenticate/authenticateSlice";




function Register() {
    // состояния
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

     // redux
     const navigate = useNavigate();
     const dispatch = useDispatch();

    // state
    const error = useSelector(state => state.authenticate.error);
    const status = useSelector(state => state.authenticate.status);

   
    // Метод отправки
    const handleSubmit = (e) => {
        e.preventDefault();

        // вызов метода
        dispatch(registerUser({ username, password }));

        // сброс состояний
        setUsername('');
        setPassword('');

        // перенаправление
        navigate('/login');
    };


    return (
        <div className="container my-2">

            <h2 className="mb-4">Регистрация</h2>

            {/* алерты на успех и ошибку */}
            {error && (
                <div className="alert alert-danger">{error}</div>
            )}
            {status && (
                <div className="alert alert-success">{status}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group my-3">
                    <input type="text" className="form-control" placeholder="Введите имя" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group my-3">
                    <input type="password" className="form-control" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className="btn btn-outline-success my-2" type="submit">Зарегестрироваться</button>
            </form>
        </div>
    )
};


export default Register;





