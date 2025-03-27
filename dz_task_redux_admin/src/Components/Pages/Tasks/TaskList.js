import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { loadTasks, completedTasks, deleteTasks, pinnedTasks, editTasks} from "../../../slices/tasks/tasksSlice";




function TaskList() {
    // redux
    const dispatch = useDispatch();


    // Получение роли
    const userRole = useSelector((state) => state.authenticate.user.role);

    // получаем массив тасок от сервера
    const tasksForUser = useSelector((state) => state.tasks.tasks);

    // заготовка массива для фильтрации в if else. Т.К. в if else нельзя вызывать useSelector
    let tasks = [];

    // если роль не админ, выводим только те задачи, которые еще никто не взял. При закреплении задача из списка тоже удаляется
    if (userRole !== 'admin') {
        tasks = tasksForUser.filter(task => !task.user_id && !task.username);
    } else if (userRole === 'admin') {
        tasks = tasksForUser;
    } 
    // console.log(tasks);

    
    // вызов метода для загрузки задач
    useEffect(() => {
        dispatch(loadTasks());
    }, [dispatch]);


    // кейс на отображение заливки tr в зависимости от приоритета
    const setPriorityColor = (priority) => {
        switch (priority) {
            case "Low": return 'table-success';
            case "Medium": return 'table-warning';
            case "High": return 'table-danger';
            default: return 'table-primary';
        }
    };


    return (
        <div className="container my-2">
            <table className="table table-hover table-striped align-middle my-5">
                <thead>
                    <tr className="table-primary">
                        <th>Название</th>
                        <th>Выполнить до</th>
                        {userRole === 'admin' && (
                            <th>Ответственный</th>
                        )}
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tasks.map((task) => (
                            <tr key={task.id} className={setPriorityColor(task.priority)} >

                                <td className={task.completed ? "text-decoration-line-through" : ""}>{task.text}</td>
                                <td>{task.deadline}</td>
                                {userRole === 'admin' && (
                                    <td>{task.username}</td>
                                )}
                                <td className="mx-auto">
                                    <button className="btn btn-outline-primary me-3 btn-sm" onClick={() => dispatch(pinnedTasks(task.id))}>Закрепить</button>
                                    <button className="btn btn-outline-success me-3 btn-sm" onClick={() => dispatch(completedTasks(task.id))}>Выполнить</button>
                                    {userRole === 'admin' && (
                                        <>
                                            <button className="btn btn-outline-warning me-3 btn-sm" onClick={() => dispatch(editTasks(task.id))}>Изменить</button>
                                            <button className="btn btn-outline-danger me-3 btn-sm" onClick={() => dispatch(deleteTasks(task.id))}>Удалить</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
};


export default TaskList;



