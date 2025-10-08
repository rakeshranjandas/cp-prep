<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>CP-prep</title>
        <!-- jQuery CDN -->
        <script src="https://code.jquery.com/jquery-3.6.4.min.js" integrity="sha256-/xUj+3OJ+Y3Q0hK6Nq6Y9b9+Y2Q5p3yZK3GmZ8Z+7E=" crossorigin="anonymous"></script>    
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css" integrity="sha512-EZLkOqwILORob+p0BXZc+Vm3RgJBOe1Iq/0fiI7r/wJgzOFZMlsqTa29UEl6v6U6gsV4uIpsNZoV32YZqrCRCQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 20px;
            }

            .tasks-container {
                display: flex;
                gap: 20px;
                align-items: flex-start;
                margin-top: 20px;
                justify-content: space-around;
            }

            .all-tasks, .due-tasks {
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                padding: 20px;
                display: flex;
                flex-direction: column;
            }

            .all-tasks {
                flex: 1;
                width: 60%;
            }

            h2 {
                font-size: 20px;
                margin-bottom: 16px;
                color: #333;
            }

            .button {
                background-color: #007bff;
                color: #fff;
                border: none;
                padding: 10px 16px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .button:hover {
                background-color: #0056b3;
            }

            .table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }

            .table th, .table td {
                padding: 12px;
                border: 1px solid #ddd;
                text-align: left;
            }

            .table th {
                background-color: #f9f9f9;
                font-weight: bold;
            }

            .due-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .due-list-item {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 10px;
                background-color: #fefefe;
            }

            .due-list-item .task-name {
                font-weight: bold;
                margin-bottom: 4px;
            }

            .due-list-item .due-date {
                font-size: 14px;
                color: #666;
            }

            .tag {
                display: inline-block;
                padding: 4px 8px;
                background-color: #eef6ff;
                color: #007bff;
                border-radius: 4px;
                font-size: 12px;
                margin-right: 6px;
                border: 1px solid #007bff;
            }

            .tag:hover {
                background-color: #007bff;
                color: #fff;
            }

            @media (max-width: 768px) {
                .tasks-container {
                    flex-direction: column;
                }
            }
        </style>
    </head>
    <body>
        <div class="tasks-container">
            <div class="all-tasks">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2>All Tasks</h2>
                    <button class="button">Add Task</button>
                </div>
                <table class="table tasks-table">
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
                            <td>Binary Search Practice</td>
                            <td>LeetCode</td>
                            <td><span class="status inprogress">In progress</span></td>
                            <td>2025-10-05</td>
                            <td><span class="tag">arrays</span><span class="tag">binary-search</span></td>
                        </tr>
                        <!-- Add more rows as needed -->
                    </tbody>
                </table>
            </div>

            <div class="due-tasks">
                <h2>Due Tasks</h2>
                <ul class="due-list">
                    <li class="due-list-item">
                        <div class="task-name">Binary Search Practice</div>
                        <div class="due-date">Due: 2025-10-05</div>
                    </li>
                    <li class="due-list-item">
                        <div class="task-name">Dynamic Programming Session</div>
                        <div class="due-date">Due: 2025-10-06</div>
                    </li>
                    <li class="due-list-item">
                        <div class="task-name">Dynamic Programming Session</div>
                        <div class="due-date">Due: 2025-10-06</div>
                    </li>
                    <!-- Add more due tasks as needed -->
                </ul>
            </div>
        </div>
    </body>
</html>