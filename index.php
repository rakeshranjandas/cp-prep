<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Dashboard - CP Prep</title>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>	<link rel="stylesheet" href="styles.css">
	<script src="main.js"></script>
	<style>
		:root {
			--bg: #f6f8fb;
			--card: #ffffff;
			--muted: #6b7280;
			--accent: #2563eb;
			--success: #16a34a;
			--warning: #f59e0b;
			--status-completed: #d8d8d8ff;
			--radius: 10px;
			--shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
			--pad: 14px;
			--font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
		}
		html, body {
			height: 100%;
		}
		body {
			font-family: var(--font-sans);
			background: var(--bg);
			color: #0f172a;
			margin: 0;
			padding: 28px;
		}
		.dashboard {
			/* max-width: 1400px; */
			margin: 0 auto;
			display: grid;
			grid-template-columns: 0.6fr 2fr 0.6fr; /* Left, Center, Right layout */
			gap: 20px;
			align-items: start;
		}
		main {
			grid-column: 2; /* Center column */
		}
		.due-tasks {
			grid-column: 1; /* Left column */
			position: sticky;
			top: 0;
		}
		.sessions {
			grid-column: 3; /* Right column */
			position: sticky;
			top: 0;
		}
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 18px;
		}
		.header .title {
			font-size: 20px;
			font-weight: 700;
		}
		.card {
			background: var(--card);
			border-radius: var(--radius);
			padding: var(--pad);
			box-shadow: var(--shadow);
			border: 1px solid rgba(15, 23, 42, 0.04);
		}
		.toolbar {
			display: flex;
			gap: 10px;
			align-items: center;
			margin-bottom: 10px;
		}
		.toolbar input[type=search] {
			flex: 1;
			padding: 8px 12px;
			border-radius: 8px;
			border: 1px solid #e6eefc;
			background: #f8fbff;
		}
		.button {
			background: #fff;
			/* color: #fff; */
			font-weight: bold;
			padding: 8px 12px;
			border: 1px solid grey;
			border-radius: 8px;
			cursor: pointer;
			opacity: 0.5;
		}
		.button:hover {
			opacity: 1;
		}
		.table {
			width: 100%;
			border-collapse: collapse;
			font-size: 14px;
		}
		.table thead th {
			position: sticky;
			top: 0;
			background: linear-gradient(180deg, #fff, #fbfdff);
			padding: 10px;
			text-align: left;
			border-bottom: 1px solid #eef2ff;
			font-weight: 400;
			color: var(--muted);
		}
		.table tbody tr {
			transition: background .12s;
		}
		.table tbody tr:hover {
			background: #fbfdff;
		}
		.table td {
			padding: 10px;
			border-bottom: 1px solid #f3f6fb;
			vertical-align: middle;
		}
		.table-page-number {
			font-size: small;
   			color: var(--muted);
		}
		.taskTitleView {
			cursor: pointer;
		}
		.status {
			padding: 6px 8px;
			border-radius: 999px;
			color: #fff;
			font-size: 12px;
		}
		.status.pending {
			background: var(--warning);
		}
		.status.inprogress {
			background: var(--accent);
		}
		.status.completed {
			background: var(--status-completed);
		}

		#taskPreview > p > strong {
			font-size: small;
			opacity: 0.5;
		}

		#taskPreview > p > span {
			margin-left: 10px;
		}

		#previewReviewTable {
			/* margin-top: 40px; */
			margin-bottom: 50px;
		}

		#previewReviewTable td, #previewReviewTable th {
			text-align: center;
		}

		#previewReviewTable button {
			padding: 2px;
		}

		#previewRepeatPolicy {
			list-style: none;
		}

		#addNewReviewDateFromPreview,#addNewRepeatPolicyFromPreview {
			margin-left: 10px;
			margin-right: 20px;
			padding: 8px;
			border: 1px solid #ddd;
			border-radius: 4px;
			box-sizing: border-box;
		}

		#previewReviewTable tbody {
			display: block;
			max-height: 200px; /* Adjust the height as needed */
			overflow-y: auto;
		}

		#previewReviewTable thead, #previewReviewTable tbody tr {
			display: table;
			width: 100%;
			table-layout: fixed;
		}

		.tag {
			display: inline-block;
			padding: 4px 8px;
			border-radius: 999px;
			background: #eef6ff;
			color: #12366b;
			border: 1px solid rgba(19, 54, 107, 0.08);
			margin-right: 6px;
			font-size: 12px;
		}

		.due-list-item {
			display: flex;
			justify-content: space-between;
			padding: 12px;
			flex-direction: column;
			gap: 6px;
		}

		.switch {
			position: relative;
			width: 44px;
			height: 24px;
			background: #e6eefc;
			border-radius: 999px;
			display: inline-block;
			vertical-align: middle;
			cursor: pointer;
		}
		.switch .knob {
			position: absolute;
			top: 3px;
			left: 3px;
			width: 18px;
			height: 18px;
			background: #fff;
			border-radius: 50%;
			box-shadow: 0 2px 6px rgba(16, 24, 40, 0.12);
			transition: left .16s;
		}
		.switch.on {
			background: var(--accent);
		}
		.switch.on .knob {
			left: 23px;
		}
		@media (max-width: 900px) {
			.dashboard {
				grid-template-columns: 1fr;
			}
			.header {
				flex-direction: column;
				align-items: flex-start;
				gap: 10px;
			}
		}

		.section-header {
			font-weight: 700;
			font-size: 16px;
			color: var(--muted);
		}

		.pagination-controls {
			display: flex;
			justify-content: right;
			gap: 10px;
			margin-top: 15px;
			align-items: center;
		}

		.modal {
			position: fixed;top: 0px;left: 0px;width: 100%;height: 100%;background: rgba(0, 0, 0, 0.5);z-index: 1000;justify-content: center;align-items: center;display: flex;
		}

		.modal-content {
			background:#fff;padding:20px;border-radius:8px;width:400px;box-shadow:0 4px 8px rgba(0,0,0,0.2);width:40%;
		}

		.formField {
			display: flex;
			flex-direction: column;
			gap: 5px;
			margin-bottom: 20px;
		}

		.formField > label {
			opacity: 0.5;
			font-size: 15px;
		}
		
		.textFieldInput {
			width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;
			box-sizing: border-box; 
		}

		.overdue {
			color: red;
		}

		.card .sectionHeaderDiv {
			height: 3rem;
			display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;
		}

		#taskTable {
			display: block;
		}

		#taskTable tbody {
			display: block;
			max-height: 300px;
			height: 300px;;
			overflow-y: auto;
		}

	</style>

</head>
<body>
	<div class="dashboard">
		<div class="due-tasks">
			<div class="card">
				<div class="sectionHeaderDiv">
					<div class="section-header">Due Tasks</div>
				</div>
				<ul class="due-list" style="padding:0;margin:0;list-style:none">
					<li class="due-list-item">
						<div style="font-weight:bold">Binary Search Practice</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-05</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Dynamic Programming Session</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-06</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
					<li class="due-list-item">
						<div style="font-weight:bold">Graph Theory Review</div>
						<div style="font-size:12px;color:var(--muted)">2025-10-07</div>
					</li>
				</ul>
			</div>
		</div>

		<main>
			<div class="card">
				<div class="sectionHeaderDiv">
					<div class="section-header">All Tasks</div>
					<div style="display:flex;gap:12px;align-items:center">
					<button class="button" onclick="TaskModal.showAdd()">New Task</button>
				</div>
				</div>

				<div>
					<table class="table tasks-table" aria-label="All Tasks">
						<thead>
							<tr>
								<th>Title</th>
								<th>Platform</th>
								<th>Status</th>
								<th>Next Review</th>
								<th>Tags</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td onclick="TaskModal.showPreview(1);">Binary Search Practice</td>
								<td>LeetCode</td>
								<td><span class="status inprogress">In progress</span></td>
								<td>2025-10-05</td>
								<td><span class="tag">arrays</span><span class="tag">binary-search</span></td>
							</tr>
							<tr>
								<td>Graph Theory Review</td>
								<td>Codeforces</td>
								<td><span class="status pending">Pending</span></td>
								<td>2025-10-07</td>
								<td><span class="tag">graphs</span><span class="tag">dfs</span></td>
							</tr>
							<tr>
								<td>Dynamic Programming Session</td>
								<td>AtCoder</td>
								<td><span class="status inprogress">In progress</span></td>
								<td>2025-10-06</td>
								<td><span class="tag">dp</span><span class="tag">memoization</span></td>
							</tr>
							<tr>
								<td>Sorting Algorithms</td>
								<td>HackerRank</td>
								<td><span class="status completed">Completed</span></td>
								<td>2025-09-28</td>
								<td><span class="tag">sorting</span><span class="tag">divide-and-conquer</span></td>
							</tr>
							<!-- Add more rows as needed -->
						</tbody>
					</table>
				</div>
				<div class="pagination-controls">
                    <button class="button prev-button" id="allTasksPrev" title="Prev" onclick="App.prevPageTasks()"><</button>
					<span id="tasksTablePageNumber" class="table-page-number">1</span>
                    <button class="button next-button" id="allTasksNext" title="Next" onclick="App.nextPageTasks()">></button>
                </div>
			</div>
		</main>

		<div class="sessions">
			<div class="card">
				<div class="sectionHeaderDiv">
					<div class="section-header">Sessions</div>
					<button class="button" id="addSessionBtn" onclick="SessionModal.showAdd()">New Session</button>
				</div>

				<div style="display:flex;align-items:center;gap:8px;justify-content:right">
                        <span style="font-size:13px;color:var(--muted)">Show completed</span>
                        <div id="sessionsSwitch" class="switch on" role="button" aria-pressed="false">
                            <div class="knob"></div>
                        </div>
                    </div>

				<table class="table sessions-table" id="sessionsTable" aria-label="Sessions table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Due Date</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						<tr data-status="inprogress">
							<td>Morning Practice</td>
							<td>2025-10-05</td>
							<td><span class="status inprogress">In progress</span></td>
						</tr>
						<tr data-status="completed" class="status-completed">
							<td>Weekly Review</td>
							<td>2025-09-30</td>
							<td><span class="status completed">Completed</span></td>
						</tr>
						<tr data-status="pending">
							<td>Graph Workshop</td>
							<td>2025-10-08</td>
							<td><span class="status pending">Pending</span></td>
						</tr>
						<tr data-status="completed" class="status-completed">
							<td>Sorting Deep-dive</td>
							<td>2025-09-25</td>
							<td><span class="status completed">Completed</span></td>
						</tr>
					</tbody>
				</table>

				<div class="pagination-controls">
                    <button class="button prev-button" id="sessionsPrev"><</button>
                    <button class="button next-button" id="sessionsNext">></button>
                </div>
			</div>
		</div>
	</div>

	<!-- Modal for Task Preview and Edit -->
	<div id="taskModal" class="modal" style="display: none;">
		<div class="modal-content">
			<h2 id="modalTitle"></h2>
			<div id="taskPreview" style="display:block;" data-taskid="">
				<p><strong>Tags:</strong> <span id="previewTags"></span></p>
				<p><strong>URL:</strong> <span id="previewUrl"></span></p>
				<p><strong>Platform:</strong> <span id="previewPlatform"></span></p>
				<p><strong>Description:</strong> <span id="previewDescription"></span></p>
				<!-- <p><strong>Active Repeats:</strong> <ul id="previewRepeatPolicy"></ul></p> -->
				<p id="reviewTaskAgainInPreview" style="display:none">
					<strong>Add New Review:</strong>
					<input type="date" id="addNewReviewDateFromPreview">
					<strong>Repeat Policy:</strong>
					<input type="text" id="addNewRepeatPolicyFromPreview">
					<button class="button" type="button" onclick="App.addNewTaskReviewFromPreview()">Add</button>
				</p>
				<table id="previewReviewTable" class="table">
					<thead>
						<tr>
							<th>Review Date</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
				<div style="display:flex;justify-content:space-between;">
					<button id="editTaskButton" class="button" onclick="TaskModal.showEdit()">Edit</button>
					<button type="button" id="closeModal" class="button closeModalButton" style="background:#ccc;color:#000;" onclick="TaskModal.close()">Cancel</button>
				</div>
			</div>
			<form id="taskForm" style="display:none;">
				<input type="hidden" id="taskIdHidden" name="taskId" value="0">
				<div class="formField">
					<label for="taskTitle">Title</label>
					<input type="text" id="taskTitle" name="taskTitle" class="textFieldInput">
				</div>
				<div class="formField">
					<label for="taskTags">Tags</label>
					<input type="text" id="taskTags" name="taskTags" placeholder="Comma-separated" class="textFieldInput">
				</div>
				<div class="formField">
					<label for="taskUrl">URL</label>
					<input type="text" id="taskUrl" name="taskUrl" class="textFieldInput">
				</div>
				<div class="formField">
					<label for="taskPlatform">Platform</label>
					<input type="text" id="taskPlatform" name="taskPlatform" class="textFieldInput">
				</div>
				<div class="formField">
					<label for="taskDescription">Description</label>
					<textarea id="taskDescription" name="taskDescription" class="textFieldInput" rows="8"></textarea>
				</div>
				<!-- <div class="formField">
					<label for="taskStatus">Status</label>
					<select id="taskStatus" name="taskStatus" class="textFieldInput"">
						<option value="Pending">Pending</option>
						<option value="In progress">In progress</option>
						<option value="Completed">Completed</option>
					</select>
				</div> -->
				<div class="formField">
					<label for="taskReview">Next Review</label>
					<input type="date" id="taskReview" name="taskReview" class="textFieldInput" value="<?php echo date('Y-m-d'); ?>">
				</div>
				<div class="formField">
					<label for="taskRepeatPolicy">Repeat Policy</label>
					<input type="text" id="taskRepeatPolicy" name="taskRepeatPolicy" class="textFieldInput" placeholder="e.g. 0-4-5-10">
				</div>
				<div style="display:flex;justify-content:space-between;">
					<button type="submit" class="button" onclick="App.addEditTask()">Save</button>
					<button type="button" id="closeModal" class="button closeModalButton" style="background:#ccc;color:#000;" onclick="TaskModal.close()">Cancel</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Modal for Session Preview and Edit -->
	<div id="sessionModal" class="modal" style="display: none;">
    <div class="modal-content">
        <h2 class="section-header" id="sessionModalTitle"></h2>
        <div id="sessionPreview" style="display:block;" data-sessionid="">
            <p><strong>Name:</strong> <span id="previewSessionName"></span></p>
            <p><strong>Description:</strong> <span id="previewSessionDescription"></span></p>
            <p><strong>Due Date:</strong> <span id="previewSessionDueDate"></span></p>
            <p><strong>Status:</strong> <span id="previewSessionStatus"></span></p>
            <div style="display:flex;justify-content:space-between;">
                <button id="editSessionButton" class="button" onclick="SessionModal.showEdit()">Edit</button>
                <button type="button" id="closeSessionModal" class="button closeModalButton" style="background:#ccc;color:#000;" onclick="SessionModal.close()">Cancel</button>
            </div>
        </div>
        <form id="sessionForm" style="display:none;">
            <input type="hidden" id="sessionIdHidden" name="sessionId" value="0">
            <div class="formField">
                <label for="sessionName">Name</label>
                <input type="text" id="sessionName" name="sessionName" class="textFieldInput">
            </div>
            <div class="formField">
                <label for="sessionDescription">Description</label>
                <textarea id="sessionDescription" name="sessionDescription" class="textFieldInput" rows="4"></textarea>
            </div>
            <div class="formField">
                <label for="sessionDueDate">Due Date</label>
                <input type="date" id="sessionDueDate" name="sessionDueDate" class="textFieldInput" value="<?php echo date('Y-m-d');?>">
            </div>
            <div class="formField">
                <label for="sessionTasks">Select Tasks</label>
                <div class="formField" style="display: flex; gap: 10%; flex-direction: row;">
                    <div style="width: 60%;">
                        <input type="text" id="taskFilter" class="textFieldInput" placeholder="Search tasks..." oninput="SessionModal.searchTasks(this)">
                        <table id="taskTable" class="table">
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                    <div style="width: 30%;">
                        <ul id="selectedTasksList" style="list-style: none; padding: 0; margin: 0; border: 1px solid #ddd; border-radius: 4px; max-height: 200px; overflow-y: auto;">
                            <!-- Selected tasks will appear here -->
                        </ul>
                    </div>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;">
                <button type="submit" class="button" onclick="App.addEditSession()">Save</button>
                <button type="button" id="closeSessionModal" class="button closeModalButton" style="background:#ccc;color:#000;" onclick="SessionModal.close()">Cancel</button>
            </div>
        </form>
    </div>
</div>

	<script>
		
		// jQuery version: toggle completed sessions visibility
		$(function(){
			var $switch = $('#sessionsSwitch');
			var $rows = $('#sessionsTable tbody tr');

			function setSwitch(on){
				if(on){
					$switch.addClass('on').attr('aria-pressed','true');
				} else {
					$switch.removeClass('on').attr('aria-pressed','false');
				}
			}

			function update(){
				var show = $switch.hasClass('on');
				$rows.each(function(){
					var $r = $(this);
					var isCompleted = $r.data('status') === 'completed' || $r.hasClass('status-completed');
					$r.toggle(show || !isCompleted);
				});
			}

			// clicking the UI switch toggles it
			$switch.on('click', function(){
				var on = !$switch.hasClass('on');
				setSwitch(on);
				update();
			});

			// initialize
			setSwitch(false);
			update();
		});

		$(function() {
			App.renderAll();
		});

		$(document).ready(function() {
			// $('#taskFilter').on('input', function() {
			// 	const filter = $(this).val().toLowerCase();
			// 	$('#taskTable tbody tr').each(function() {
			// 		const taskName = $(this).find('td:nth-child(2)').text().toLowerCase();
			// 		const platform = $(this).find('td:nth-child(3)').text().toLowerCase();
			// 		$(this).toggle(taskName.includes(filter) || platform.includes(filter));
			// 	});
			// });

			// $('#taskTable input[type="checkbox"]').on('change', function() {
			// 	const $checkbox = $(this);
			// 	const taskName = $checkbox.closest('tr').find('td:nth-child(2)').text();
			// 	const taskId = $checkbox.val();

			// 	if ($checkbox.is(':checked')) {
			// 		$('#selectedTasksList').append(`<li data-task-id="${taskId}" ondblclick="alert('s');">${taskName}</li>`);
			// 	} else {
			// 		$(`#selectedTasksList li[data-task-id="${taskId}"]`).remove();
			// 	}
			// });
		});
	</script>
</body>
</html>
