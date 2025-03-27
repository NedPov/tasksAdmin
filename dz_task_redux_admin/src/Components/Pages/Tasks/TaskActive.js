import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { loadTasks, completedTasks, unpinningTasks } from "../../../slices/tasks/tasksSlice";



function TaskActive() {
    // redux
    const dispatch = useDispatch();


    // получаем id пользователя
    const userId = JSON.parse(localStorage.getItem('user')).id;

    // получаем массив тасок от сервера
    const tasksForUser = useSelector((state) => state.tasks.tasks);

    // делаем заготовку что бы отфильтровать только то, что нам нужно
    let tasks = [];
    // фильтруем и получаем только те задачи, которые закреплены за данным пользователем
    tasks = tasksForUser.filter(task => task.user_id ==  userId);


    // метод загрузки задач
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
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {

                        tasks.map((task) => (
                            <tr key={task.id} className={setPriorityColor(task.priority)} >
                                <td className={task.completed ? "text-decoration-line-through" : ""}>{task.text}</td>
                                <td>{task.deadline}</td>
                                <td className="mx-auto">
                                    <button className="btn btn-outline-danger me-3 btn-sm" onClick={() => dispatch(unpinningTasks(task.id))}>Открепить</button>
                                    <button className="btn btn-outline-success me-3 btn-sm" onClick={() => dispatch(completedTasks(task.id))}>Выполнить</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )

};


export default TaskActive;