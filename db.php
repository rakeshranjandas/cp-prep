<?php

require_once('config.php');

class DB {
    private static $_instance = NULL;
    private $_conn;

    const TASKS_PER_PAGE = 15;
    const SESSIONS_PER_PAGE = 5;

    const STATUS_TASK_IN_PROGRESS = "IN PROGRESS";
    const STATUS_TASK_COMPLETED = "COMPLETED";
    const STATUS_TASK_PENDING = "PENDING";

    public static function init() {
        if (self::$_instance) {
            return self::$_instance;
        }

        $conn = new mysqli(DB_SERVERNAME, DB_USERNAME, DB_PASSWORD, DB_DATABASE);
        if ($conn->connect_error) {
            die("Connection failed. ". $conn->connect_error);
        }

        return self::$_instance = new DB($conn);
    }

    private function __construct($conn) {
        $this->_conn = $conn;
    }

    public function __destruct() {
        $this->_conn->close();
    }

    public function beginTransaction() {
        $this->_conn->begin_transaction();
    }

    public function commit() {
        $this->_conn->commit();
    }

    public function rollback() {
        $this->_conn->rollback();
    }

    public function addTask($task) {
        $taskId = $task['id'];
        $title = $task['title'];
        $url = $task['url'];
        $platform = $task['platform'];
        $description = $task['description'];
        $url = $task['url'];

        $tags = explode(",", $task['tags']);
        for ($i = 0; $i < count($tags); $i++) {
            $tags[$i] = trim($tags[$i]);
        }

        if ($taskId == 0) {
            $nextReview = $task['next_review'];
            $repeatPolicy = $task['repeat_policy'];

            $stmt = $this->_conn->prepare("INSERT INTO tasks(title, description, url, platform) VALUES (?, ?, ?, ?);");
            $stmt->bind_param("ssss", $title, $description, $url, $platform);
            $stmt->execute();
            $taskId = $stmt->insert_id;
            $stmt->close();

            $this->addTagsForTask($taskId, $tags);
            $taskOccurenceId = $this->addTaskOcccurence($taskId, $nextReview);
            $this->addRepeat($taskId, $repeatPolicy, $taskOccurenceId);

        } else {
            $stmt = $this->_conn->prepare("UPDATE tasks SET title = ?, description = ?, url = ?, platform = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $title, $description, $url, $platform, $taskId);
            $stmt->execute();
            $stmt->close();

            $this->addTagsForTask($taskId, $tags);
        }

        return $this->getTask($taskId);
    }

    public function removeTask($taskId) {

        // Remove from session_task_occurences
        $stmt = $this->_conn->prepare("DELETE FROM sessions_task_occurences WHERE task_occurences_id IN (SELECT id FROM task_occurences WHERE tasks_id = ?)");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $stmt->close();

        // Remove from task_occurences
        $stmt = $this->_conn->prepare("DELETE FROM task_occurences WHERE tasks_id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $stmt->close();

        // Remove from tasks_repeat
        $stmt = $this->_conn->prepare("DELETE FROM tasks_repeat WHERE tasks_id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $stmt->close();

        // Remove from tasks_tags
        $stmt = $this->_conn->prepare("DELETE FROM tasks_tags WHERE tasks_id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $stmt->close();

        // Remove from tasks
        $stmt = $this->_conn->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $stmt->close();

    }

    public function getTask($taskId) {
        $stmt = $this->_conn->prepare("SELECT id, title, description, url, platform FROM tasks WHERE id = ?");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();

        $results = $stmt->get_result();

        if ($results->num_rows === 0) {
            return NULL;
        }

        $task = $results->fetch_assoc();
        $task['tags'] = $this->getTagsForTask($taskId);
        $task['task_occurences'] = $this->getAllTaskOccurencesForTask($taskId);

        $lastOccurence = $this->getLastTaskOccurenceOfTask($taskId);
        $task['next_review_date'] = $lastOccurence ? date("Y-m-d", strtotime($lastOccurence['due_date'])) : "";
        $task['status'] = $lastOccurence ? $lastOccurence['status'] : self::STATUS_TASK_COMPLETED;
        $task["repeats"] = $this->getRepeatsForTask($taskId);

        $stmt->close();

        return $task;
    }

    public function getAllTasks($page) {
        $stmt = $this->_conn->prepare(
            "
            SELECT id 
            FROM tasks 
            ORDER BY id DESC 
            LIMIT ".self::TASKS_PER_PAGE." OFFSET ".((int)$page - 1) * self::TASKS_PER_PAGE
        );

        $stmt->execute();

        $results = $stmt->get_result();
        $stmt->close();

        $tasks = [];
        while ($row = $results->fetch_assoc()) {
            $tasks[] = $this->getTask($row['id']);
        }

        return $tasks;
    }

    public function getTasksByPrefix($prefix) {

        // On blank prefix, return first page of All Tasks
        if (strlen($prefix) === 0) {
            return $this->getAllTasks(1);
        }

        $likePrefix = $prefix . '%';
        $stmt = $this->_conn->prepare(
            "SELECT id 
            FROM tasks 
            WHERE title LIKE ?
            ORDER BY id DESC"
        );
        $stmt->bind_param("s", $likePrefix);

        $stmt->execute();

        $results = $stmt->get_result();
        $stmt->close();

        $tasks = [];
        while ($row = $results->fetch_assoc()) {
            $tasks[] = $this->getTask($row['id']);
        }

        return $tasks;
    }

    public function getDueTasks() {
        $stmt = $this->_conn->prepare("
            SELECT tasks_id, MIN(due_date) AS next_due_date
            FROM task_occurences
            WHERE due_date <= NOW() + INTERVAL 1 WEEK
                AND status IN ('".self::STATUS_TASK_IN_PROGRESS."', '".self::STATUS_TASK_PENDING."')
            GROUP BY tasks_id
            ORDER BY next_due_date ASC
        ");

        $stmt->execute();
        $results = $stmt->get_result();
        $stmt->close();

        $dueTasks = [];
        while ($row = $results->fetch_assoc()) {
            $dueTasks[] = $this->getTask($row['tasks_id']);
        }

        return $dueTasks;
    }

    private function addTagsForTask($taskId, $tagsArr) {
        // Step 1: Remove existing tags
        $removeStmt = $this->_conn->prepare("DELETE FROM tasks_tags WHERE tasks_id = ?");
        $removeStmt->bind_param("i", $taskId);
        $removeStmt->execute();

        // Step 2: Get tag ids
        $tagsIdArr = [];
        foreach ($tagsArr as $tag) {
            $tagsIdArr[] = $this->getTagIdFromName($tag);
        };

        // Step 3: Insert new tags
        $stmt = $this->_conn->prepare("INSERT INTO tasks_tags(tasks_id, tags_id) VALUES (?, ?);");
        foreach ($tagsIdArr as $tagId) {
            $stmt->bind_param("ii", $taskId, $tagId);
            $stmt->execute();
        }

        $stmt->close();
    }

    private function getTagIdFromName($tagName) {
        $selectStmt = $this->_conn->prepare("SELECT id FROM tags WHERE name = ?");
        $selectStmt->bind_param("s", $tagName);
        $selectStmt->execute();
        $results = $selectStmt->get_result();

        if ($results->num_rows) {
            $selectStmt->close();
            $row = $results->fetch_assoc();
            return $row['id'];
        }

        $insertStmt = $this->_conn->prepare("INSERT INTO tags(name) VALUES(?);");
        $insertStmt->bind_param("s", $tagName);
        $insertStmt->execute();
        $tagId = $insertStmt->insert_id;
        $insertStmt->close();

        return $tagId;
    }

    private function getTagsForTask($taskId) {
        $stmt = $this->_conn->prepare("
            SELECT tags.name 
            FROM tags
            JOIN tasks_tags ON tags.id = tasks_tags.tags_id
            WHERE tasks_tags.tasks_id = ?
        ");

        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $results = $stmt->get_result();

        $tags = [];
        while ($row = $results->fetch_assoc()) {
            $tags[] = $row['name'];
        }

        return $tags;
    }

    private function addTaskOcccurence($taskId, $dueDate = NULL) {
        $insertStmt = $this->_conn->prepare("INSERT INTO task_occurences(tasks_id, due_date) VALUES(?, ?)");
        $insertStmt->bind_param("is", $taskId, $dueDate);
        $insertStmt->execute();
        $taskOccurenceId = $insertStmt->insert_id;
        $insertStmt->close();

        return $taskOccurenceId;
    }

    private function addRepeat($taskId, $repeatPolicy, $taskOccurenceId) {
        $stmt = $this->_conn->prepare("INSERT INTO tasks_repeat(tasks_id, repeat_policy, last_task_occurences_id) VALUES(?, ?, ?)");
        $stmt->bind_param("isi", $taskId, $repeatPolicy, $taskOccurenceId);
        $stmt->execute();
        $stmt->close();
    }

    public function addTaskReview($taskId, $reviewDate, $repeatPolicy) {
        $taskOccurenceId = $this->addTaskOcccurence($taskId, $reviewDate);
        if ($repeatPolicy) {
            $this->addRepeat($taskId, $repeatPolicy, $taskOccurenceId);
        }
    }

    private function getRepeatsForTask($taskId) {
        $stmt = $this->_conn->prepare("
            SELECT repeat_policy, last_task_occurences_id, last_task_occurences_count
            FROM tasks_repeat
            WHERE tasks_id = ?
            ORDER BY id ASC
        ");

        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $results = $stmt->get_result();

        return $results->fetch_all(MYSQLI_ASSOC);
    }

    private function getTaskOccurence($taskOccurenceId) {
        $stmt = $this->_conn->prepare("
            SELECT
                task_occurences.id,
                task_occurences.status,
                task_occurences.added_date,
                task_occurences.due_date,
                task_occurences.completed_date,

                tasks.id AS tasks_id,
                tasks.title,
                tasks.description,
                tasks.url,
                tasks.platform,
                tasks.added_date

            FROM task_occurences
            JOIN tasks ON task_occurences.tasks_id = tasks.id
            WHERE task_occurences.id = ?
        ");

        $stmt->bind_param("i", $taskOccurenceId);
        $stmt->execute();

        $results = $stmt->get_result();
        $taskOccurence = $results->num_rows ? $results->fetch_assoc() : NULL;
        $stmt->close();

        return $taskOccurence;
    }

    private function getAllTaskOccurencesForTask($taskId) {
        $stmt = $this->_conn->prepare("
            SELECT id, tasks_id, status, added_date, due_date, completed_date
            FROM task_occurences
            WHERE tasks_id = ?
            ORDER BY id DESC
        ");
        $stmt->bind_param("i", $taskId);
        $stmt->execute();

        $results = $stmt->get_result();
        $stmt->close();

        return $results->fetch_all(MYSQLI_ASSOC);
    }

    private function getLastTaskOccurenceOfTask($taskId) {
        $stmt = $this->_conn->prepare("
            SELECT id, tasks_id, status, added_date, due_date, completed_date
            FROM task_occurences 
            WHERE tasks_id = ? 
            AND (status = '" . self::STATUS_TASK_IN_PROGRESS . "' OR status = '" . self::STATUS_TASK_PENDING . "')
            ORDER BY due_date ASC
            LIMIT 1
        ");

        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        $results = $stmt->get_result();

        if ($results->num_rows) {
            return $results->fetch_assoc();
        }

        $stmtCompleted = $this->_conn->prepare("
            SELECT id, tasks_id, status, added_date, due_date, completed_date
                FROM task_occurences 
                WHERE tasks_id = '". self::STATUS_TASK_COMPLETED ."' 
                AND status = ?
                ORDER BY due_date ASC
                LIMIT 1
        ");

        $stmtCompleted->bind_param("i", $taskId);
        $stmtCompleted->execute();
        $results = $stmtCompleted->get_result();

        if ($results->num_rows) {
            return $results->fetch_assoc;
        }

        return NULL;
    }

    public function updateTaskOccurenceStatusToInProgress($taskOccurenceId) {
        $stmt = $this->_conn->prepare("UPDATE task_occurences SET status = '".self::STATUS_TASK_IN_PROGRESS."' WHERE id = ?");
        $stmt->bind_param("i", $taskOccurenceId);
        $stmt->execute();
        $stmt->close();

        $this->updateSessionStatusFromTaskOccurence($taskOccurenceId);
    }

    public function updateTaskOccurenceStatusToCompleted($taskOccurenceId) {
        $stmt = $this->_conn->prepare("UPDATE task_occurences SET status = '".self::STATUS_TASK_COMPLETED."', completed_date = NOW() WHERE id = ?");
        $stmt->bind_param("i", $taskOccurenceId);
        $stmt->execute();
        $stmt->close();

        $newTaskOccurence = $this->addNewRepeatTaskOccurence($taskOccurenceId);
        $this->updateSessionStatusFromTaskOccurence($taskOccurenceId);

        if (!$newTaskOccurence) {
            return ['new_repeat_task_occurence_added' => FALSE];
        }


        return [
            'new_repeat_task_occurence_added' => TRUE,
            'new_repeat_task_occurence_id' => $newTaskOccurence['id'],
            'new_repeat_task_occurence_date' => $newTaskOccurence['due_date'],
        ];
    }

    public function updateTaskOccurenceStatusToPending($taskOccurenceId) {
        $stmt = $this->_conn->prepare("UPDATE task_occurences SET status = '".self::STATUS_TASK_PENDING."' WHERE id = ?");
        $stmt->bind_param("i", $taskOccurenceId);
        $stmt->execute();
        $stmt->close();

        $this->updateSessionStatusFromTaskOccurence($taskOccurenceId);
    }

    private function addNewRepeatTaskOccurence($taskOccurenceId) {
        // Step 1: Find if this task occurence is a part of a repeat policy
        $taskRepeatExistStmt = $this->_conn->prepare("
            SELECT id, tasks_id, repeat_policy, last_task_occurences_id, last_task_occurences_count
            FROM tasks_repeat
            WHERE last_task_occurences_id = ?
        ");

        $taskRepeatExistStmt->bind_param("i", $taskOccurenceId);
        $taskRepeatExistStmt->execute();
        $taskRepeatExistResults = $taskRepeatExistStmt->get_result();
        $taskRepeatExistStmt->close();
        if ($taskRepeatExistResults->num_rows === 0) {
            return NULL;
        };

        // Step 2: Add new task occurence and update tasks_repeat
        $taskRepeat = $taskRepeatExistResults->fetch_assoc();
        $repeatPolicyArr = explode("-", $taskRepeat['repeat_policy']);

        // Do nothing if this occurence is the last of the repeat
        if (count($repeatPolicyArr) === (int) $taskRepeat['last_task_occurences_count']) {
            return NULL;
        }

        // Calculate due date for next task occurene
        $newTaskOccurenceCount = (int) $taskRepeat['last_task_occurences_count'] + 1;
        $deltaDays = (int) $repeatPolicyArr[$newTaskOccurenceCount - 1];
        $lastTaskOccurene = $this->getTaskOccurence($taskOccurenceId);
        $lastTaskOccurenceCompletedDate = $lastTaskOccurene['completed_date'];
        $lastTaskOccurenceDueDate = $lastTaskOccurene['due_date'];

        // Next date would be considered from due_date if completed early, from completed_date if completed late
        $lastTaskOccurenceDateToConsiderForDelta =
            strtotime($lastTaskOccurenceCompletedDate) > strtotime($lastTaskOccurenceDueDate)
            ? $lastTaskOccurenceCompletedDate
            : $lastTaskOccurenceDueDate;
        $newTaskOccurenceDueDate = date('Y-m-d H:i:s', strtotime($lastTaskOccurenceDateToConsiderForDelta . " +{$deltaDays} days"));

        // Add the ewn task occurence
        $newTaskOccurenceId = $this->addTaskOcccurence($taskRepeat['tasks_id'], $newTaskOccurenceDueDate);

        // Update tasks_repeat.last_task_occurences_id and tasks_repeat.last_task_occurences_count
        $updateTasksRepeatStmt = $this->_conn->prepare("
            UPDATE tasks_repeat 
            SET last_task_occurences_id = ?, last_task_occurences_count = ? 
            WHERE id = ?
        ");
        $updateTasksRepeatStmt->bind_param("iii", $newTaskOccurenceId, $newTaskOccurenceCount, $taskRepeat['id']);
        $updateTasksRepeatStmt->execute();

        return $this->getTaskOccurence($newTaskOccurenceId);
    }

    public function addSession($session) {
        $sessionId = $session['id'];
        $name = $session['name'];
        $description = $session['description'];
        $dueDate = $session['due_date'];
        $tasksIdArr = $session['tasks'];

        if ($sessionId == 0) {
            $insertStmt = $this->_conn->prepare("INSERT INTO sessions(name, description, due_date) VALUES(?, ?, ?)");
            $insertStmt->bind_param("sss", $name, $description, $dueDate);
            $insertStmt->execute();
            $sessionId = $insertStmt->insert_id;
            $insertStmt->close();

            $this->addTasksForSession($sessionId, $tasksIdArr, $dueDate);

        } else {
            $existingSession = $this->getSession($sessionId);
            $existingTaskOccurences = $existingSession['tasks'];

            $updateStmt = $this->_conn->prepare("UPDATE sessions SET name = ?, description = ?, due_date = ? WHERE id = ?");
            $updateStmt->bind_param("sssi", $name, $description, $dueDate, $sessionId);
            $updateStmt->execute();
            $updateStmt->close();

            // remove that are not present anymore
            foreach ($existingTaskOccurences as $existingTaskOccurence) {
                if (!in_array($existingTaskOccurence['tasks_id'], $tasksIdArr)) {
                    $deleteTaskOccurenceStmt = $this->_conn->prepare("DELETE FROM sessions_task_occurences WHERE task_occurences_id = ? AND sessions_id = ?");
                    $deleteTaskOccurenceStmt->bind_param("ii", $existingTaskOccurence['id'], $sessionId);
                    $deleteTaskOccurenceStmt->execute();
                }
            }

            // add new ones
            $existingTaskIds = array_map(function ($t) { return $t['tasks_id']; }, $existingTaskOccurences);
            $tasksIdToAdd = array_diff($tasksIdArr, $existingTaskIds);
            $this->addTasksForSession($sessionId, $tasksIdToAdd, $dueDate);
        }

        $this->updateSessionStatus($sessionId);

        return $this->getSession($sessionId);
    }

    public function removeSession($sessionId) {
        // Remove from sessions_task_occurences
        $stmt = $this->_conn->prepare("DELETE FROM sessions_task_occurences WHERE sessions_id = ?");
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $stmt->close();

        // Remove from sessions
        $stmt = $this->_conn->prepare("DELETE FROM sessions WHERE id = ?");
        $stmt->bind_param("i", $sessionId);
        $stmt->execute();
        $stmt->close();
    }

    public function getSession($sessionId) {
        $stmt = $this->_conn->prepare("
            SELECT 
                sessions.id,
                sessions.name,
                sessions.description,
                sessions.status,
                sessions.due_date,
                sessions.completed_date,

                GROUP_CONCAT(sessions_task_occurences.task_occurences_id) AS taskOccurenceIds

            FROM sessions
                LEFT JOIN sessions_task_occurences ON sessions_task_occurences.sessions_id = sessions.id

            WHERE sessions.id = ?

            GROUP BY sessions.id
        ");

        $stmt->bind_param("i", $sessionId);
        $stmt->execute();

        $results = $stmt->get_result();
        $stmt->close();

        if ($results->num_rows === 0) {
            throw new Exception("No session found for id ".$sessionId);
        }

        $session = $results->fetch_assoc();
        $taskOccurenceIdArr = explode(",", $session['taskOccurenceIds'] ?? "");
        $tasks = [];

        foreach ($taskOccurenceIdArr as $taskOccurenceId) {
            $taskOccurence = $this->getTaskOccurence($taskOccurenceId);
            if ($taskOccurence) {
                $tasks[] = $taskOccurence;
            }
        };

        $session['tasks'] = $tasks;

        return $session;
    }

    public function getAllSessions($page, $showCompleted = FALSE) {
        $stmt = '';

        if ($showCompleted) {
            $stmt = $this->_conn->prepare(
                "
                SELECT id
                FROM sessions
                ORDER BY due_date ASC
                LIMIT ".self::SESSIONS_PER_PAGE." OFFSET ".((int)$page - 1) * self::SESSIONS_PER_PAGE
            );
        } else {
            $stmt = $this->_conn->prepare(
                "
                SELECT id
                FROM sessions
                WHERE status IN ('".self::STATUS_TASK_IN_PROGRESS."', '".self::STATUS_TASK_PENDING."')
                ORDER BY due_date ASC
                LIMIT ".self::SESSIONS_PER_PAGE." OFFSET ".((int)$page - 1) * self::SESSIONS_PER_PAGE
            );
        }

        $stmt->execute();
        $results = $stmt->get_result();

        $sessions = [];
        while ($row = $results->fetch_assoc()) {
            $sessions[] = $this->getSession($row['id']);
        }

        return $sessions;
    }

    public function addTasksForSession($sessionId, $tasksIdArr, $dueDate) {
        $taskOccurencesIdArr = [];

        foreach ($tasksIdArr as $taskId) {
            $lastTaskOccurence = $this->getLastTaskOccurenceOfTask($taskId);

            if ($lastTaskOccurence['status'] === self::STATUS_TASK_COMPLETED) {
                $taskOccurencesIdArr[] = $this->addTaskOcccurence($taskId, $dueDate);
            } else {
                $taskOccurencesIdArr[] =  $lastTaskOccurence['id'];
            }
        }

        $insertStmt = $this->_conn->prepare("INSERT INTO sessions_task_occurences(sessions_id, task_occurences_id) VALUES(?, ?)");
        foreach ($taskOccurencesIdArr as $tasksOccurencesId) {
            $insertStmt->bind_param("ii", $sessionId, $tasksOccurencesId);
            $insertStmt->execute();
        }
    }

    private function updateSessionStatusFromTaskOccurence($taskOccurenceId) {
        $stmt = $this->_conn->prepare("SELECT sessions_id FROM sessions_task_occurences WHERE task_occurences_id = ?");
        $stmt->bind_param("i", $taskOccurenceId);
        $stmt->execute();

        $results = $stmt->get_result();
        while ($row = $results->fetch_assoc()) {
            $this->updateSessionStatus($row['sessions_id']);
        }
    }

    private function updateSessionStatus($sessionId) {
        $session = $this->getSession($sessionId);

        $countCompleted = 0;
        $countPending = 0;
        foreach ($session['tasks'] as $taskOccurence) {
            if ($taskOccurence['status'] === self::STATUS_TASK_COMPLETED) {
                $countCompleted++;

            } else if ($taskOccurence['status'] === self::STATUS_TASK_PENDING) {
                $countPending++;
            }
        }

        $updateStatus = '';
        if ($countCompleted === count($session['tasks'])) {
            $updateStatus = self::STATUS_TASK_COMPLETED;

        } else if ($countPending === count($session['tasks'])) {
            $updateStatus = self::STATUS_TASK_PENDING;

        } else {
            $updateStatus = self::STATUS_TASK_IN_PROGRESS;
        }

        $updateStatusStmt = $this->_conn->prepare("UPDATE sessions SET status = ? WHERE id = ?");
        $updateStatusStmt->bind_param("si", $updateStatus, $sessionId);
        $updateStatusStmt->execute();
    }

    public function getAnimeList() {
        $stmt = $this->_conn->prepare("SELECT id, name, status FROM anime");
        $stmt->execute();
        $results = $stmt->get_result();
        $stmt->close();

        return $results->fetch_all(MYSQLI_ASSOC);
    }

    public function addAnime($name) {
        $stmt = $this->_conn->prepare("INSERT INTO anime(name) VALUES(?)");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $stmt->close();
    }

    public function watchAnime($id) {
        $ustmt = $this->_conn->prepare("UPDATE anime SET status = 'ADDED' WHERE status = 'WATCHING'");
        $ustmt->execute();
        $ustmt->close();

        $stmt = $this->_conn->prepare("UPDATE anime SET status = 'WATCHING', started_watching = NOW() WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }

    public function removeAnime($id) {
        $stmt = $this->_conn->prepare("DELETE FROM anime WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }

    public function finishAnime($id) {
        $stmt = $this->_conn->prepare("UPDATE anime SET status = 'FINISHED', finished_watching = NOW() WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }

    public function undoFinishedAnime($id) {
        $stmt = $this->_conn->prepare("UPDATE anime SET status = 'ADDED' WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }

}
