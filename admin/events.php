<?php
require '../config/db.php';

$stmt = $pdo->query("
    SELECT s.id, s.title, s.date, s.time, t.name AS team
    FROM sessions s
    JOIN teams t ON s.team_id = t.id
");

$events = [];

while ($row = $stmt->fetch()) {
    $events[] = [
        'id' => $row['id'],
        'title' => $row['title'] . ' (' . $row['team'] . ')',
        'start' => $row['date'] . 'T' . $row['time']
    ];
}

echo json_encode($events);

'color' => '#0d6efd'

eventClick: function(info) {
    alert(
        "Titre: " + info.event.title +
        "\nDate: " + info.event.start
    );
}

editable: true

dateClick: function(info) {
    alert("Ajouter séance le : " + info.dateStr);
}