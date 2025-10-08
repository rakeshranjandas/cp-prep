

let App = {

    renderAll: function(onComplete) {
        this.renderTasks(null, onComplete);
        this.renderSessions(null, onComplete);
        this.renderDueTasks(null, onComplete);
    },

    // TASKS
    renderTasks: function(page, onComplete) {
        if (!page) {
            page = $('#tasksTablePageNumber').text();
        }

        Service.getAllTasks({page: page}, (tasks) => {
            this._renderTasksTable(tasks);
            if (onComplete) onComplete();
        });
    },

    _renderTasksTable: function(tasks) {
        const $tbody = $('.tasks-table tbody');
        $tbody.empty();
        tasks.forEach(task => {
            $tbody.append(`
                <tr>
                    <td class="taskTitleView" onclick="TaskModal.showPreview(${task.id})">${task.title}</td>
                    <td>${task.platform}</td>
                    <td><span class="status ${task.status.toLowerCase().replace(' ', '')}">${task.status.toLowerCase()}</span></td>
                    <td>${formatDate(task.next_review_date)}</td>
                    <td>${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</td>
                </tr>
            `);  });
    },

    nextPageTasks: function() {
        let page = parseInt($('#tasksTablePageNumber').text());

        Service.getAllTasks({page: page+1}, (tasks) => {
            if (tasks.length === 0) {
                return;
            }

            this._renderTasksTable(tasks);
            $('#tasksTablePageNumber').text(page+1)
        });
    },

    prevPageTasks: function() {
        let page = parseInt($('#tasksTablePageNumber').text());

        if (page == 1) {
            return;
        }

        Service.getAllTasks({page: page-1}, (tasks) => {
            if (tasks.length === 0) {
                return;
            }

            this._renderTasksTable(tasks);
            $('#tasksTablePageNumber').text(page-1)
        });
    },

    addEditTask: function() {
        event.preventDefault();

        let task = TaskModal.getTaskForm();
        if (!task) {
            return;
        }

        Service.addEditTask(task, () => {
            if (task.id == 0) {
                this.renderAll();
                TaskModal.close();
            } else {
                this.renderAll(() => TaskModal.showPreview(task.id));
            }
        })
    },

    markTaskAsInProgress: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToInProgress(
            taskOccurenceId,
            () =>  this.renderAll(() => TaskModal.showPreview(taskId))
        );
    },

    markTaskAsCompleted: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToCompleted(
            taskOccurenceId,
            (res) =>  {
                if (res.new_repeat_task_occurence_added) {
                    alert(`Next review to be on ${formatDate(res.new_repeat_task_occurence_date)} as per the repeat policy.`);
                }

                this.renderAll(() => TaskModal.showPreview(taskId))
            }
        );
    },

    markTaskAsPending: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToPending(
            taskOccurenceId,
            () =>  this.renderAll(() => TaskModal.showPreview(taskId))
        );
    },

    addNewTaskReviewFromPreview: function() {
        let taskId =  $('#taskPreview').attr("data-taskid");
        let reviewDate = $('#addNewReviewDateFromPreview').val();
        let repeatPolicy = $('#addNewRepeatPolicyFromPreview').val().trim();

        Service.addNewTaskReview(
            taskId,
            reviewDate,
            repeatPolicy,
            () => this.renderAll(() => TaskModal.showPreview(taskId))
        )
    },

    // SESSIONS
    renderSessions: function(page, onComplete) {
        if (!page) {
            page = $('#sessionsTablePageNumber').text();
        }

        Service.getAllSessions({page: page}, (sessions) => {
            const $tbody = $('#sessionsTable tbody');
            $tbody.empty();
            sessions.forEach(session => {
                $tbody.append(`
                    <tr>
                        <td onclick="SessionModal.showPreview(${session.id})">${session.name}</td>
                        <td>${session.dueDate}</td>
                        <td><span class="status ${session.status.toLowerCase().replace(' ', '')}">${session.status}</span></td>
                    </tr>
                `);
            });

            if (onComplete) onComplete();
        });

    },

    nextPageSessions: function() {

    },

    prevPageSessions: function() {

    },

    addSession: function() {

    },

    editSession: function() {

    },


    // DUE
    renderDueTasks: function(page, onComplete) {
        Service.getDueTasks((dueTasks) => {
            const $dueList = $('.due-list');
            $dueList.empty();

            dueTasks.forEach((dueTask) => {
                const isOverdue = new Date(dueTask.next_review_date) <= new Date();
                $dueList.append(`
                    <li class="due-list-item${isOverdue ? ' overdue' : ''}">
                        <div style="font-weight:bold" class="taskTitleView" onclick="TaskModal.showPreview(${dueTask.id})">${dueTask.title}</div>
                        <div style="font-size:12px;opacity:0.5">${formatDate(dueTask.next_review_date)}</div>
                    </li>
                `);  
            });
            
            if (onComplete) onComplete();
        });
    }

};

let TaskModal = {

    showAdd: function() {
        $('#taskIdHidden').val("0");
        $('#modalTitle').text('Add Task');
        $('#taskReview').show();
        $('#taskRepeatPolicy').show();
        $('#taskForm')[0].reset();
        $('#taskPreview').hide();
        $('#taskForm').show();
        $('#taskModal').show();
    },

    showPreview: function(taskId) {
        let task = Service.getTask(taskId);

        $('#modalTitle').text(task.title);
        $('#previewStatus').text(task.status);
        $('#previewPlatform').text(task.platform);
        $('#previewUrl').text(task.url);
        $('#previewTags').html(task.tags.reduce((prev, cur) => prev + `<span class="tag">${cur}</span>`, ""));
        $('#previewDescription').text(task.description);
        $('#previewReviewTable>tbody').html(
            task.task_occurences.reduce((prev, cur) => {
                return prev +
                    `<tr>
                        <td>${formatDate(cur.due_date)}</td>
                        <td><span class="status ${cur.status.toLowerCase().replace(' ', '')}">${cur.status.toLowerCase()}</span></td>
                        <td style="display:flex;justify-content:right;gap:10px">${this._buttonsInReviewTable(cur)}</td>
                    </tr>`;
            }, "")
        );

        if (task.task_occurences.every(occurence => occurence.status === "COMPLETED")) {
            $('#reviewTaskAgainInPreview').show();
        } else {
            $('#reviewTaskAgainInPreview').hide();
        }
        
        // Set the value of the date input to today's date in yyyy-mm-dd format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        $('#addNewReviewDateFromPreview').val(`${yyyy}-${mm}-${dd}`);  
        
        // Set the repeat policy field blank
        $('#addNewRepeatPolicyFromPreview').val("");


        $('#taskPreview').attr("data-taskid", taskId);
        $('#taskPreview').show();
        $('#taskForm').hide();
        $('#taskModal').show();
    },

    _buttonsInReviewTable: function(taskOccurence) {
        let status = taskOccurence.status;
        let id = taskOccurence.id;
        let taskId = taskOccurence.tasks_id;

        let buttons = "";
        if (status != "IN PROGRESS") buttons += `<button type="button" class="button" onclick="App.markTaskAsInProgress(${id}, ${taskId})">in progress</button>`;
        if (status != "PENDING") buttons += `<button type="button" class="button" onclick="App.markTaskAsPending(${id}, ${taskId})">pending</button>`;
        if (status != "COMPLETED") buttons += `<button type="button" class="button" onclick="App.markTaskAsCompleted(${id}, ${taskId})">completed</button>`;

        return buttons;
    },

    showEdit: function() {
        let taskId =  $('#taskPreview').attr("data-taskid");
        let task = Service.getTask(taskId);

        $('#taskIdHidden').val(taskId);
        $('#modalTitle').text('Edit Task');
        $('#taskTitle').val(task.title);
        $('#taskPlatform').val(task.platform);
        $('#taskTags').val(task.tags.join(","));
        $('#taskUrl').val(task.url);
        $('#taskDescription').val(task.description);
        $('#taskReview').hide();
        $('#taskRepeatPolicy').hide();

        $('#taskPreview').hide();
        $('#taskForm').show();
        $('#taskModal').show();
    },

    close: function() {
        $('#taskModal').hide();
    },

    getTaskForm: function() {
        const title = $('#taskTitle').val().trim();
        if (!title) {
            alert('Title is required.');
            return null;
        }

        const taskData = {
            id: $('#taskIdHidden').val(),
            title: title,
            url: $('#taskUrl').val().trim(),
            platform: $('#taskPlatform').val().trim(),
            description: $('#taskDescription').val(),
            tags: $('#taskTags').val().trim(),
            next_review: $('#taskReview').val(),
            repeat_policy: $('#taskRepeatPolicy').val()
        };

        return taskData;
    }

};

let Service = {

    _cachedTasks: {},

    _cacheTasks: function(tasks) {
        tasks.forEach((task) => {this._cachedTasks[task.id] = task});
    },

    _doAjax: function(data, onSuccess, method = "POST") {
        $.ajax({
            url: 'ajax.php',
            method: method,
            data: data,
            dataType: "json",
            success: function(data) {
                onSuccess(data);
            },
            error: function(xhr, status, error) {
                alert(error);
            }
        });
    },

    getAllTasks: function(params, onSuccess) {
        this._doAjax(
            { action: "get_all_tasks", page: params.page },
            (tasks) => {
                this._cacheTasks(tasks);
                onSuccess(tasks)
            },
            "GET"
        );
    },

    getTask: function(taskId) {
        return this._cachedTasks[taskId];
    },

    getDueTasks: function(onSuccess) {
        this._doAjax(
            { action: "get_due_tasks" },
            (tasks) => {
                this._cacheTasks(tasks);
                onSuccess(tasks)
            },
            "GET"
        );
    },

    addEditTask: function(task, onSuccess) {
        console.log(task);

        this._doAjax(
            {action: "add_task", task: task},
            () => onSuccess(),
            "POST",
        );
    },

    updateTaskOccurenceStatusToInProgress: function(taskOccurenceId, onSuccess) {
        this._doAjax(
            { action: "update_task_status_to_in_progress", task_occurences_id: taskOccurenceId },
            () => onSuccess(),
            "POST",
        );
    },

    updateTaskOccurenceStatusToCompleted: function(taskOccurenceId, onSuccess) {
        this._doAjax(
            { action: "update_task_status_to_completed", task_occurences_id: taskOccurenceId },
            (res) => onSuccess(res),
            "POST",
        );
    },

    updateTaskOccurenceStatusToPending: function(taskOccurenceId, onSuccess) {
        this._doAjax(
            { action: "update_task_status_to_pending", task_occurences_id: taskOccurenceId },
            () => onSuccess(),
            "POST",
        );
    },

    addNewTaskReview: function(taskId, reviewDate, repeatPolicy, onSuccess) {
        this._doAjax(
            { action: "add_task_review", task_id: taskId, review_date: reviewDate, repeat_policy: repeatPolicy },
            () => onSuccess(),
            "POST"
        )
    },

    getAllSessions: function(params, onSuccess) {
        let sessionsData = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            name: `Session ${i + 1}`,
            dueDate: `2025-10-${(i % 30 + 1).toString().padStart(2, '0')}`,
            status: i % 3 === 0 ? 'In progress' : i % 3 === 1 ? 'Pending' : 'Completed'
        }));

        onSuccess(sessionsData);
    },

    getSession: function(sessionId) {

    },

    addSession: function() {

    }
}



// HELPERS
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
