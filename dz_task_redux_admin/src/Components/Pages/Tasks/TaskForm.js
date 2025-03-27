import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTasks } from "../../../slices/tasks/tasksSlice";
import { editTasksFalse, editTasksFetch } from "../../../slices/tasks/tasksSlice";



function TaskForm() {
    // redux
    const dispatch = useDispatch();

    // состояния
    const [text, setText] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('Low');


    // получаем все таски
    const tasks = useSelector((state) => state.tasks.tasks);


    // получаем id таски (которую мы изменяем)
    const taskId = useSelector((state) => state.tasks.taskId);

    // ищем таску которую хотим изменить по id в массиве всех тасок 
    const task = tasks.find((task) => task.id == taskId);

    // состояние: происходит ли сейчас изменение задачи или нет (true, false)
    const editingTask = useSelector((state) => state.tasks.editTasks);


    // если происходит изменение, передаем данные найденой таски
    useEffect(() => {
        if (editingTask) {
            setText(task.text);
            setDeadline(task.deadline);
            setPriority(task.priority);
        }
    }, [editingTask]);


    // отправка формы
    const handleSubmit = (e) => {
        e.preventDefault();

        // если происходит изменение состояния передаем данные и вызываем метод, который меняет состояние editingTask
        if (editingTask) {
            dispatch(editTasksFetch({ text, deadline, priority, taskId }))
            dispatch(editTasksFalse(null));
        } else {
            // иначе просто добавляем задачу в пул
            dispatch(addTasks({ text, deadline, priority }));
        }


        // сброс состояний
        setText('');
        setDeadline('');
        setPriority('Low');
    }

    return (
        <div className="container my-2">
            <h1 className="mb-4">Список задач</h1>

            <form className="my-4" onSubmit={handleSubmit}>
                <div className="d-flex align-items-center justify-content-between gap-3">
                    <input type="text" className="form-control" value={text} onChange={(e) => setText(e.target.value)} placeholder="Введите описание задачи..." required />
                    <input type="datetime-local" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />

                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Low">Низкий</option>
                        <option value="Medium">Средний</option>
                        <option value="High">Высокий</option>
                    </select>

                </div>

                {editingTask == true ? (
                    <button type="submit" className="btn btn-outline-warning my-2">Изменить</button>
                ) : (
                    <button type="submit" className="btn btn-outline-success my-2">Добавить</button>
                )}
            </form>
        </div>
    )
};


export default TaskForm;