<?php
require '../includes/auth_check.php';
require '../config/db.php';
require '../includes/header.php';

// ======================
// STATISTIQUES GLOBALES
// ======================
$totalMembers  = $pdo->query("SELECT COUNT(*) FROM members")->fetchColumn();
$totalTeams    = $pdo->query("SELECT COUNT(*) FROM teams")->fetchColumn();
$totalSessions = $pdo->query("SELECT COUNT(*) FROM sessions")->fetchColumn();

// ======================
// GRAPH 1 : sessions par équipe
// ======================
$stmt = $pdo->query("
    SELECT t.name, COUNT(s.id) as total
    FROM teams t
    LEFT JOIN sessions s ON t.id = s.team_id
    GROUP BY t.name
");
$teamLabels = [];
$teamData   = [];
while ($row = $stmt->fetch()) {
    $teamLabels[] = $row['name'];
    $teamData[]   = $row['total'];
}

// ======================
// GRAPH 2 : sessions par date
// ======================
$stmt2 = $pdo->query("
    SELECT date, COUNT(*) as total
    FROM sessions
    GROUP BY date
    ORDER BY date ASC
");
$dateLabels = [];
$dateData   = [];
while ($row = $stmt2->fetch()) {
    $dateLabels[] = $row['date'];
    $dateData[]   = $row['total'];
}

// ======================
// DERNIERES SÉANCES
// ======================
$lastSessions = $pdo->query("
    SELECT s.title, s.date, t.name as team
    FROM sessions s
    JOIN teams t ON s.team_id = t.id
    ORDER BY s.id DESC LIMIT 5
")->fetchAll();
?>

<h2>Dashboard Administrateur</h2>

<!-- ======================
     CARDS STATISTIQUES
====================== -->
<div class="cards">
    <div class="card">
        <h3>Membres</h3>
        <p><?= $totalMembers ?></p>
    </div>
    <div class="card">
        <h3>Équipes</h3>
        <p><?= $totalTeams ?></p>
    </div>
    <div class="card">
        <h3>Séances</h3>
        <p><?= $totalSessions ?></p>
    </div>
</div>

<!-- ======================
     GRAPH 1 : SESSIONS PAR ÉQUIPE
====================== -->
<canvas id="chartTeams"></canvas>

<!-- ======================
     GRAPH 2 : SESSIONS PAR DATE
====================== -->
<canvas id="chartDates"></canvas>

<!-- ======================
     DERNIÈRES SÉANCES
====================== -->
<h3>Dernières séances</h3>
<ul>
<?php foreach ($lastSessions as $s): ?>
    <li><?= htmlspecialchars($s['title']) ?> (<?= htmlspecialchars($s['team']) ?>) le <?= $s['date'] ?></li>
<?php endforeach; ?>
</ul>

<!-- ======================
     CHART.JS SCRIPTS
====================== -->
<script>
const ctxTeams = document.getElementById('chartTeams');
new Chart(ctxTeams, {
    type: 'bar',
    data: {
        labels: <?= json_encode($teamLabels) ?>,
        datasets: [{
            label: 'Séances par équipe',
            data: <?= json_encode($teamData) ?>,
            borderWidth: 1,
            backgroundColor: ['#0d6efd','#198754','#dc3545','#ffc107','#6f42c1','#fd7e14']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Séances par équipe' }
        }
    }
});

const ctxDates = document.getElementById('chartDates');
new Chart(ctxDates, {
    type: 'line',
    data: {
        labels: <?= json_encode($dateLabels) ?>,
        datasets: [{
            label: 'Sessions par date',
            data: <?= json_encode($dateData) ?>,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.2)',
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Séances dans le temps' }
        }
    }
});
</script>

<?php require '../includes/footer.php'; ?>