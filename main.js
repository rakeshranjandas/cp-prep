let App = {

    renderAllTables: function(onComplete) {

        this.renderTasks(null, () => {
            this.renderSessions(null, () => {
                this.renderDueTasks(null, () => {
                    if (onComplete) onComplete();
                })
            })
        })

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

        Service.addEditTask(task, (addedTask) => {
            if (task.id == 0) { // Add new task
                this.renderAllTables(() => {
                    TaskModal.close();
                    SessionModal.searchTasks();
                });

            } else {    // Edit task
                this.renderAllTables(() => {
                    TaskModal.updatePreview();
                    SessionModal.updatePreview();
                });
            }
        })
    },

    removeTask: function(taskId) {
        let ok = confirm("Do you want to delete this task?");
        if (!ok) return;
        let okok = confirm("Do you REALLY want to delete this task?");
        if (!okok) return;

        Service.removeTask(taskId, () => {
            this.renderAllTables(() => {
                TaskModal.close();
                SessionModal.updatePreview();
            });
        });
    },

    markTaskAsInProgress: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToInProgress(
            taskOccurenceId,
            () =>  this.renderAllTables(() => {
                TaskModal.updatePreview();
                SessionModal.updatePreview();
            })
        );
    },

    markTaskAsCompleted: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToCompleted(
            taskOccurenceId,
            (res) =>  {
                if (res.new_repeat_task_occurence_added) {
                    alert(`Next review to be on ${formatDate(res.new_repeat_task_occurence_date)} as per the repeat policy.`);
                }

                this.renderAllTables(() => {
                    TaskModal.updatePreview();
                    SessionModal.updatePreview();
                })
            }
        );
    },

    markTaskAsPending: function(taskOccurenceId, taskId) {
        Service.updateTaskOccurenceStatusToPending(
            taskOccurenceId,
            () =>  this.renderAllTables(() => {
                TaskModal.updatePreview();
                SessionModal.updatePreview();
            })
        );
    },

    addNewTaskReviewFromPreview: function() {
        let taskId = $('#taskIdHidden').val();
        let reviewDate = $('#addNewReviewDateFromPreview').val();
        let repeatPolicy = $('#addNewRepeatPolicyFromPreview').val().trim();

        Service.addNewTaskReview(
            taskId,
            reviewDate,
            repeatPolicy,
            () => this.renderAllTables(() => {
                TaskModal.updatePreview();
                SessionModal.updatePreview();
            })
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

        Service.addEditSession(session, (addedSession) => {
            if (session.id == 0) { // New session
                this.renderAllTables(() => SessionModal.showPreview(addedSession.id));

            } else {    // Edit session 
                this.renderAllTables(() => SessionModal.updatePreview());
                
            }
        })
    },

    removeSession: function(sessionId) {
        let ok = confirm("Do you want to delete this session?");
        if (!ok) return;
        let okok = confirm("Do you REALLY want to delete this session?");
        if (!okok) return;

        Service.removeSession(sessionId, () => {
            SessionModal.close();
            this.renderAllTables();
        });
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
    },

    // Anime watchlist
    renderAnime: function(onComplete) {
        WatchlistModal.refresh();
    }

};

let TaskModal = {

    showAdd: function() {
        event.preventDefault();
        $('#taskIdHidden').val("0");
        $('#modalTitle').text('Add Task');
        $('#taskReview').closest('.formField').show();
        $('#taskRepeatPolicy').closest('.formField').show();
        $('#taskForm')[0].reset();
        $('#taskPreview').hide();
        $('#taskForm').show();
        $('#taskModal').fadeIn();
    },

    showPreview: function(taskId) {
        let task = Service.getTask(taskId);

        $('#taskIdHidden').val(taskId);
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

        $('#taskPreview').show();
        $('#taskForm').hide();
        $('#taskModal').fadeIn();
    },

    updatePreview: function() {
        if ($('#taskModal').is(':visible')) {
            this.showPreview($('#taskIdHidden').val());
        }
    },

    showEdit: function() {
        let taskId = $('#taskIdHidden').val();
        let task = Service.getTask(taskId);

        $('#modalTitle').text('Edit Task');
        $('#taskTitle').val(task.title);
        $('#taskPlatform').val(task.platform);
        $('#taskTags').val(task.tags.join(","));
        $('#taskUrl').val(task.url);
        $('#taskDescription').val(task.description);
        $('#taskReview').closest('.formField').hide();
        $('#taskRepeatPolicy').closest('.formField').hide();

        $('#taskPreview').hide();
        $('#taskForm').show();
        $('#taskModal').fadeIn();
    },

    remove: function() {
        event.preventDefault();
        let taskId = $('#taskIdHidden').val();
        App.removeTask(taskId);
    },

    close: function() {
        $('#taskModal').fadeOut();
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
        $('#sessionIdHidden').val('0');
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

        $('#sessionIdHidden').val(sessionId);
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

        $('#sessionPreview').show();
        $('#sessionForm').hide();
        $('#sessionModal').fadeIn();
    },

    updatePreview: function() {         
        if ($('#sessionModal').is(':visible')) {
            // If preview session is open, then re-render preview
            this.showPreview($('#sessionIdHidden').val());
        }
    },

    showEdit: function() {
        let sessionId = $('#sessionIdHidden').val();
        let session = Service.getSession(sessionId);

        $('#sessionModalTitle').text('Edit Session');
        $('#sessionName').val(session.name);
        $('#sessionDescription').val(session.description);
        $('#sessionDueDate').val(session.due_date.split(' ')[0]);

        this._selectedTasks = session.tasks.map((t) => {
            return {
                id: t.tasks_id,
                title: t.title
            };
        });

        $('#sessionPreview').hide();
        $('#sessionForm').show();
        $('#sessionModal').fadeIn();

        this.searchTasks();
    },

    remove: function() {
        event.preventDefault();
        let sessionId = $('#sessionIdHidden').val();
        App.removeSession(sessionId);
    },

    close: function() {
        $('#sessionModal').fadeOut();
    },

    searchTasks: function(tis) {
        if (!$('#taskTable').is(':visible')) {
            return;
        }

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

let WatchlistModal = {
    todos: [],
    
    refresh: function() {
        Service.getAnime((anime) => this.render(anime));
    },

    show: function() {
        this.refresh();
        $("#todoModal").css("display", "flex");
        $("#newTodoInput").val('');
    },

    close: function() {
        $("#todoModal").css("display", "none");
    },

    addTodo: function() {
        const name = $("#newTodoInput").val().trim();
        Service.addAnime(name, () => {
            $("#newTodoInput").val('');
            this.refresh()
        });
    },

    removeTodo: function(index) {
        this.todos.splice(index, 1);
        this.renderTodos();
    },

    toggleTodo: function(index) {
        this.todos[index].done = !this.todos[index].done;
        this.renderTodos();
    },

    toggleCompletedSection: function() {
        const section = $("#completedTodosSection");
        const button = $("#toggleCompletedTodos");
        if (section.css("display") === "none") {
            section.css("display", "block");
            button.text("Hide Finished");
        } else {
            section.css("display", "none");
            button.text("Show Finished");
        }
    },

    watch: function(id) {
        Service.watchAnime(id, () => this.refresh());
    },

    undo: function(id) {
        Service.undoFinishedAnime(id, () => this.refresh());
    },

    remove: function(id) {
        let doRemove = confirm("Do you want to remove this anime from watchlist?");
        if (doRemove) {
            Service.removeAnime(id, () => this.refresh());
        }
    },
    
    finish: function() {
        let id = $('#finishWatchingAnimeButton').attr('data-id');
        if (id == 0) return;
        Service.finishAnime(id, () => this.refresh());
    },

    render: function(anime) {
        const $pending = $("#pendingTodoList");
        const $finished = $("#completedTodoList");
        const $currentAnimeName = $('.currentlyWatchingAnime');
        const $finishWatchingAnimeButton = $('#finishWatchingAnimeButton');
        $pending.empty();
        $finished.empty();
        $currentAnimeName.text("---");
        $finishWatchingAnimeButton.attr('data-id', "0");
        

        anime.forEach((anime) => {
            const animeRow = $(
                `<li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span>${anime.name}</span>
                    <div>
                        <button class="button" ${anime.status==='WATCHING'?'style="display:none"': ''} onclick="WatchlistModal.${anime.status==='ADDED'?'watch':'undo'}(${anime.id})">${anime.status==='FINISHED' ? '&#9100;' : '&#9658;'}</button>
                        <button class="button" style="background: red; color: white;" onclick="WatchlistModal.remove(${anime.id})">X</button>
                    </div>
                </li>`
            );

            if (anime.status === 'FINISHED') {
                $finished.append(animeRow);
                
            } else {
                $pending.append(animeRow);
                if (anime.status === 'WATCHING') {
                    $currentAnimeName.text(anime.name);
                    $finishWatchingAnimeButton.attr('data-id', anime.id);
                }
            }
        });
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
        if (!async) Loader.show();

        $.ajax({
            url: 'ajax.php',
            method: method,
            data: data,
            dataType: "json",
            async: async,
            success: function(data) {
                if (!async) Loader.hide();
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
        this._doAjax(
            {action: "add_task", task: task},
            (addedTask) => onSuccess(addedTask),
            "POST",
        );
    },

    removeTask: function(taskId, onSuccess) {
        this._doAjax(
            { action: 'remove_task', id: taskId },
            () => onSuccess(),
            "POST"
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
            (res) => onSuccess(res),
            "POST"
        );
    },

    removeSession: function(sessionId, onSuccess) {
        this._doAjax(
            { action: 'remove_session', id: sessionId },
            () => onSuccess(),
            "POST"
        );
    },

    getAnime: function(onSuccess) {
        this._doAjax(
            { action: 'get_anime_list' },
            (anime) => onSuccess(anime),
            "GET"
        )
    },

    addAnime: function(name, onSuccess) {
        this._doAjax(
            { action: 'add_anime', name: name },
            () => onSuccess(),
            "POST"
        );
    },

    watchAnime: function(id, onSuccess) {
        this._doAjax(
            { action: 'watch_anime', id: id },
            () => onSuccess(),
            "POST"
        );
    },

    finishAnime: function(id, onSuccess) {
        this._doAjax(
            { action: 'finish_anime', id: id},
            () => onSuccess(),
            "POST"
        );
    },

    removeAnime: function(id, onSuccess) {
        this._doAjax(
            { action: 'remove_anime', id: id },
            () => onSuccess(),
            "POST"
        );
    },

    undoFinishedAnime: function(id, onSuccess) {
        this._doAjax(
            { action: 'undo_finished_anime', id: id },
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


// Loader control methods
Loader = {
    show: function() {
        $("#loaderOverlay").css("display", "flex");
        $("body").css("overflow", "hidden");
    },
    hide: function() {
        $("#loaderOverlay").css("display", "none");
        $("body").css("overflow", "auto");
    }
};