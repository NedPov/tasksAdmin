# tasksAdmin
Таски с админской панелью и сервером и БД mysql

Проект написан на React, с использованием Redux\toolkit.

В проекте присутствуют возможности: добавление задачи, изменение (редактирование), удаление, переключение выполнено\не выполнено, закрепление задачи за пользователем\открепление задачи от пользователя.

Реализована панель администратора. Роль администратора определяется заранее заготовленным логином и паролем, которые прописаны на сервере.
Администратор может выполнять полный спектр взаимодействия с задачами, а так же видеть задачу и пользователя, которую он выполняет.

Функционал пользователя ограничен. Он может видеть только те задачи, которые еще никто не взял. А так же может просмотреть свои задачи (задачи, которые он взял)
По взаимодействию с задачами пользователь может только закрепить за собой\открепить, и изменить статус "Выполнено".

Серверная часть реализована на Node.js.

БД выбрана MySQL.
