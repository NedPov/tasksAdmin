import { useSelector } from "react-redux";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";


function Tasks() {

    // Получение роли
    const userRole = useSelector((state) => state.authenticate.user.role);

    return (
        <>
            {userRole === 'admin' && (
                <TaskForm />
            )}
            <TaskList />
        </>
    )
};


export default Tasks;