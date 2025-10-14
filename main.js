let App = {

    renderAll: function(onComplete) {

        this.renderTasks(null, () => {
            this.renderSessions(null, () => {
                this.renderDueTasks(null, () => {
                    App.updatePreviews();
                    if (onComplete) onComplete();
                })
            })
        })

    },

    updatePreviews: function() {
        TaskModal.updatePreview();
        SessionModal.updatePreview();
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
                this.renderAll(() => App.updatePreviews());
            }
        })
    },

    markTaskAsInProgress: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToInProgress(
            taskOccurenceId,
            () =>  this.renderAll()
        );
    },

    markTaskAsCompleted: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToCompleted(
            taskOccurenceId,
            (res) =>  {
                if (res.new_repeat_task_occurence_added) {
                    alert(`Next review to be on ${formatDate(res.new_repeat_task_occurence_date)} as per the repeat policy.`);
                }

                this.renderAll(() => {
                    TaskModal.updatePreview();
                    SessionModal.updatePreview();
                })
            }
        );
    },

    markTaskAsPending: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToPending(
            taskOccurenceId,
            () =>  this.renderAll()
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
            () => this.renderAll()
        )
    },

    // SESSIONS
    renderSessions: function(page, onComplete) {
        if (!page) {
            page = $('#sessionsTablePageNumber').text();
        }

        let showCompleted = $('#sessionsSwitch').attr('aria-pressed') === 'true' ? 1: 0;

        Service.getAllSessions({ page: page, show_completed: showCompleted }, (sessions) => {
            this._renderSessionsTable(sessions);
            if (onComplete) onComplete();
        });
    },

    _renderSessionsTable: function(sessions) {
        const $tbody = $('#sessionsTable tbody');
        $tbody.empty();
        sessions.forEach(session => {
            $tbody.append(`
                <tr data-status="inprogress">
                    <td class="sessionTitleView" onclick="SessionModal.showPreview(${session.id})">${session.name}</td>
                    <td>${formatDate(session.due_date)}</td>
                    <td><span class="status ${session.status.toLowerCase().replace(' ', '')}">${session.status.toLowerCase()}</span></td>
                </tr>
            `);
        });
    },

    showCompletedSwitched: function() {
        let $switch = $('#sessionsSwitch');
        let currentStateIsOn = $switch.attr('aria-pressed') === 'true';

        if (currentStateIsOn) {
            $switch.removeClass('on').attr('aria-pressed','false');

        } else {
            $switch.addClass('on').attr('aria-pressed','true');
        }

        this.renderSessions();

    },

    nextPageSessions: function() {
        let page = parseInt($('#sessionsTablePageNumber').text());
        let showCompleted = $('#sessionsSwitch').attr('aria-pressed') === 'true' ? 1: 0;

        Service.getAllSessions({ page: page+1, show_completed: showCompleted }, (sessions) => {
            if (sessions.length == 0) {
                return;
            }

            this._renderSessionsTable(sessions);
            $('#sessionsTablePageNumber').text(page+1)
        });
    },

    prevPageSessions: function() {
        let page = parseInt($('#sessionsTablePageNumber').text());
        if (page == 1) {
            return;
        }

        let showCompleted = $('#sessionsSwitch').attr('aria-pressed') === 'true' ? 1: 0;

        Service.getAllSessions({ page: page-1, show_completed: showCompleted }, (sessions) => {
            if (sessions.length == 0) {
                return;
            }

            this._renderSessionsTable(sessions);
            $('#sessionsTablePageNumber').text(page-1)
        });
    },

    addEditSession: function() {
        event.preventDefault();

        let session = SessionModal.getSessionForm();
        if (!session) {
            return;
        }

        Service.addEditSession(session, () => {
            if (session.id == 0) {
                this.renderAll();
                SessionModal.close();
            } else {
                this.renderAll();
            }
        })
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
                        <td class="taskActionsTd">${_buttonsInReviewTable(cur)}</td>
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

    updatePreview: function() {
        if ($('#taskModal').is(':visible')) {
            this.showPreview($('#taskPreview').attr('data-taskid'));
        }
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

const SessionModal = {
    _searchTaskTimeout: null,

    _selectedTasks: [],

    showAdd: function() {
        $('#sessionModalTitle').text('New Session');
        $('#sessionPreview').hide();
        $('#sessionForm').show();
        $('#sessionForm')[0].reset();
        $('#sessionModal').fadeIn();
        this._selectedTasks = [];
        this.searchTasks();
    },

    showPreview: function(sessionId) {
        let session = Service.getSession(sessionId);

        $('#sessionModalTitle').text(session.name);
        $('#previewSessionStatus').html(`<span class="status ${session.status.toLowerCase().replace(' ', '')}">${session.status.toLowerCase()}</span>`);
        $('#previewSessionDueDate').text(formatDate(session.due_date));
        $('#previewSessionDescription').text(session.description);

        $('#sessionTasksReviewTable>tbody').html(
            session.tasks.reduce((prev, cur) => {
                return prev +
                    `<tr>
                        <td>
							<a style="text-decoration:none" href="${cur.url}" target="_blank">🔗</a>
						</td>
						<td>
							<span style="cursor:pointer" onclick="TaskModal.showPreview(${cur.tasks_id})">${cur.title}</span>
						</td>
                        <td><span class="status ${cur.status.toLowerCase().replace(' ', '')}">${cur.status.toLowerCase()}</span></td>
                        <td class="taskActionsTd">${_buttonsInReviewTable(cur)}</td>
                    </tr>`
            }, "")
        );

        $('#sessionPreview').attr("data-sessionid", sessionId);
        $('#sessionPreview').show();
        $('#sessionForm').hide();
        $('#sessionModal').show();
    },

    updatePreview: function() {
        if ($('#sessionModal').is(':visible')) {
            this.showPreview($('#sessionPreview').attr('data-sessionid'));
        }
    },

    showEdit: function() {
        let sessionId =  $('#sessionPreview').attr("data-sessionId");
        let session = Service.getSession(sessionId);

        $('#sessionIdHidden').val(sessionId);
        $('#sessionModalTitle').text('Edit Task');
        $('#sessionName').val(session.name);
        $('#sessionDescription').val(session.description);
        $('#sessionDueDate').val(session.due_date.split(' ')[0]);

        this._selectedTasks = session.tasks.map((t) => {
            return {
                id: t.tasks_id,
                title: t.title
            };
        });
        this.searchTasks();

        $('#sessionPreview').hide();
        $('#sessionForm').show();
        $('#sessionModal').show();
    },

    close: function() {
        $('#sessionModal').fadeOut();
    },

    searchTasks: function(tis) {
        // Debounce logic
        clearTimeout(this._searchTaskTimeout);
        this._searchTaskTimeout = setTimeout(() => {
            let prefix = tis ? $(tis).val(): "";
            
            Service.getTasksByPrefix(prefix, (tasks) => {

                this._renderSelectedTasks();
                let $tbody = $('#taskTable tbody');
                $tbody.empty();

                tasks.forEach((task) => {
                    let checked = this._selectedTasks.find((selectedTask) => selectedTask.id == task.id) ? 'checked': '';
                    $tbody.append(
                        `<tr data-id="${task.id}">
                            <td><input type="checkbox" name="sessionTasks[]" value="${task.id}" onchange="SessionModal.checkTask(this)" ${checked}></td>
                            <td class="sessionTasksSelectTitle">${task.title}</td>
                            <td>${task.tags.reduce((prev, cur) => prev + ('<span class="tag">'+cur+'</span>'), "")}</td>
                        </tr>`
                    );
                });
            });
        }, 500);

    },

    checkTask: function(tis) {
        let $tr = $(tis).closest('tr');
        let taskId = $tr.attr('data-id');

        if (tis.checked) {
            this._selectedTasks.push({
                id: taskId,
                title: $tr.find('.sessionTasksSelectTitle').text()
            });

        } else {
            this._selectedTasks = this._selectedTasks.filter(task => task.id != taskId);
        }

        this._renderSelectedTasks();
    },

    _renderSelectedTasks: function() {
        let $selectedTasksUl = $('#selectedTasksList');
        $selectedTasksUl.empty();

        this._selectedTasks.forEach((task) => {
            $selectedTasksUl.append(`<li data-id="${task.id}" ondblclick="alert('s');">${task.title}</li>`);
        })
    },

    getSessionForm: function() {
        const name = $('#sessionName').val().trim();
        if (!name) {
            alert('Name is required.');
            return null;
        }

        if (this._selectedTasks.length === 0) {
            alert("No tasks selected.");
            return null;
        }

        const sessionData = {
            id: $('#sessionIdHidden').val(),
            name: name,
            description: $('#sessionDescription').val(),
            due_date: $('#sessionDueDate').val().trim(),
            tasks: this._selectedTasks.map((t) => t.id)
        };

        return sessionData;
    }

};

let Service = {

    _cachedTasks: {},
    _cachedSessions: {},

    // Variables used to render the output of the last sent ajax call
    _lastGetTasksByPrefixSent: 0, 
    _lastGetTasksByPrefixProcessed: 0,

    _cacheTasks: function(tasks) {
        this._cachedTasks = {};
        tasks.forEach((task) => {this._cachedTasks[task.id] = task});
    },

    _cacheSessions: function(sessions) {
        this._cachedSessions = {};
        sessions.forEach((session) => {this._cachedSessions[session.id] = session});
    },

    _doAjax: function(data, onSuccess, method = "POST", async = true) {
        $.ajax({
            url: 'ajax.php',
            method: method,
            data: data,
            dataType: "json",
            async: async,
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
        if (this._cachedTasks[taskId]) {
            return this._cachedTasks[taskId];
        }

        this._doAjax(
            { action: 'get_task', id: taskId },
            (task) => { this._cachedTasks[taskId] = task },
            "POST",
            false
        );

        return this._cachedTasks[taskId];
    },

    getTasksByPrefix: function(prefix, onSuccess) {
        this._doAjax(
            { action: "get_tasks_by_prefix", prefix: prefix, last_counter: ++this._lastGetTasksByPrefixSent },
            function (res) {

                if (res.last_counter < Service._lastGetTasksByPrefixProcessed) {
                    return;
                }

                onSuccess(res.tasks);
                Service._lastGetTasksByPrefixProcessed = parseInt(res.last_counter);
            },
            "GET"
        );
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
        this._doAjax(
            { action: "get_all_sessions", page: params.page, show_completed: params.show_completed },
            (sessions) => {
                this._cacheSessions(sessions);
                onSuccess(sessions)
            },
            "GET"
        );
    },

    getSession: function(sessionId) {
        if (this._cachedSessions[sessionId]) {
            return this._cachedSessions[sessionId];
        }

        this._doAjax(
            { action: 'get_session', id: sessionId },
            (session) => { this._cachedSessions[sessionId] = session },
            "POST",
            false
        );

        return this._cachedSessions[sessionId];
    },

    addEditSession: function(session, onSuccess) {
        this._doAjax(
            { action: 'add_session', session: session },
            () => onSuccess(),
            "POST"
        );
    }
}



// HELPERS
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function _buttonsInReviewTable(taskOccurence) {
    let status = taskOccurence.status;
    let id = taskOccurence.id;
    let taskId = taskOccurence.tasks_id;

    let buttons = "";
    if (status != "IN PROGRESS") buttons += `<button type="button" class="button" onclick="App.markTaskAsInProgress(${id}, ${taskId})">in progress</button>`;
    if (status != "PENDING") buttons += `<button type="button" class="button" onclick="App.markTaskAsPending(${id}, ${taskId})">pending</button>`;
    if (status != "COMPLETED") buttons += `<button type="button" class="button" onclick="App.markTaskAsCompleted(${id}, ${taskId})">completed</button>`;

    return buttons;
}

