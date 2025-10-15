<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once('db.php');
$db = DB::init();
$db->beginTransaction();


try {
    $result = [];

    switch ($_REQUEST['action']) {

        case 'get_all_tasks':
            $page = $_REQUEST['page'];
            $result = $db->getAllTasks($page);
            break;

        case 'get_task':
            $taskId = $_REQUEST['id'];
            $result = $db->getTask($taskId);
            break;

        case 'add_task':
            $taskInput = $_REQUEST['task'];
            $result = $db->addTask($taskInput);
            break;

        case 'remove_task':
            $taskId = $_REQUEST['id'];
            $db->removeTask($taskId);
            break;

        case 'get_due_tasks':
            $result = $db->getDueTasks();
            break;

        case 'get_tasks_by_prefix':
            $prefix = $_REQUEST['prefix'];
            $lastCounter = $_REQUEST['last_counter']; // Used by js to process the last output
            $result = [
                'last_counter' => $lastCounter,
                'tasks' => $db->getTasksByPrefix($prefix)
            ];
            break;

        case 'update_task_status_to_in_progress':
            $taskOccurenceId = $_REQUEST['task_occurences_id'];
            $db->updateTaskOccurenceStatusToInProgress($taskOccurenceId);
            break;

        case 'update_task_status_to_completed':
            $taskOccurenceId = $_REQUEST['task_occurences_id'];
            $result = $db->updateTaskOccurenceStatusToCompleted($taskOccurenceId);
            break;


        case 'update_task_status_to_pending':
            $taskOccurenceId = $_REQUEST['task_occurences_id'];
            $db->updateTaskOccurenceStatusToPending($taskOccurenceId);
            break;

        case 'add_task_review':
            $taskId = $_REQUEST['task_id'];
            $reviewDate = $_REQUEST['review_date'];
            $repeatPolicy = $_REQUEST['repeat_policy'];

            $db->addTaskReview($taskId, $reviewDate, $repeatPolicy);
            break;

        case 'get_all_sessions':
            $page = $_REQUEST['page'];
            $showCompleted = $_REQUEST['show_completed'];
            $result = $db->getAllSessions($page, $showCompleted);
            break;

        case 'get_session':
            $sessionId = $_REQUEST['id'];
            $result = $db->getSession($sessionId);
            break;

        case 'add_session':
            $sessonInput = $_REQUEST['session'];
            $result = $db->addSession($sessonInput);
            break;

        case 'remove_session':
            $sessionId = $_REQUEST['id'];
            $db->removeSession($sessionId);
            break;

        case 'get_anime_list':
            $result = $db->getAnimeList();
            break;

        case 'add_anime':
            $name = $_REQUEST['name'];
            $db->addAnime($name);
            break;

        case 'watch_anime':
            $id = $_REQUEST['id'];
            $db->watchAnime($id);
            break;

        case 'finish_anime':
            $id = $_REQUEST['id'];
            $db->finishAnime($id);
            break;

        case 'remove_anime':
            $id = $_REQUEST['id'];
            $db->removeAnime($id);
            break;

        case 'undo_finished_anime':
            $id = $_REQUEST['id'];
            $db->undoFinishedAnime($id);
            break;
    }

    $db->commit();
    echo json_encode($result);

} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    echo $e->getMessage();
}
