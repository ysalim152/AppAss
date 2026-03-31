<?php
require '../includes/auth_check.php';
require '../config/db.php';
require '../includes/header.php';

// ======================
// VALIDATION
// ======================
function validate($data) {
    return htmlspecialchars(trim($data));
}

// ======================
// LOAD TEAMS (important)
// ======================
$teams = $pdo->query("SELECT * FROM teams")->fetchAll();

// ======================
// CREATE
// ======================
if (isset($_POST['add'])) {
    $title   = validate($_POST['title']);
    $date    = $_POST['date'];
    $time    = $_POST['time'];
    $team_id = $_POST['team_id'];

    if ($title && $team_id) {
        $stmt = $pdo->prepare("INSERT INTO sessions(title, date, time, team_id) VALUES(?,?,?,?)");
        $stmt->execute([$title, $date, $time, $team_id]);
    }
}

// ======================
// DELETE
// ======================
if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE id=?");
    $stmt->execute([$_GET['delete']]);
}

// ======================
// LOAD EDIT
// ======================
$editSession = null;

if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM sessions WHERE id=?");
    $stmt->execute([$_GET['edit']]);
    $editSession = $stmt->fetch();
}

// ======================
// UPDATE
// ======================
if (isset($_POST['update'])) {
    $id      = $_POST['id'];
    $title   = validate($_POST['title']);
    $date    = $_POST['date'];
    $time    = $_POST['time'];
    $team_id = $_POST['team_id'];

    $stmt = $pdo->prepare("UPDATE sessions SET title=?, date=?, time=?, team_id=? WHERE id=?");
    $stmt->execute([$title, $date, $time, $team_id, $id]);
}

// ======================
// READ avec JOIN
// ======================
$sessions = $pdo->query("
    SELECT s.*, t.name AS team_name
    FROM sessions s
    JOIN teams t ON s.team_id = t.id
    ORDER BY s.date DESC
")->fetchAll();
?>

<h2>Gestion des séances</h2>

<!-- ======================
     FORM
====================== -->
<form method="POST">
    <input type="hidden" name="id" value="<?= $editSession['id'] ?? '' ?>">

    <input name="title" placeholder="Titre séance" required
        value="<?= $editSession['title'] ?? '' ?>">

    <input type="date" name="date" required
        value="<?= $editSession['date'] ?? '' ?>">

    <input type="time" name="time" required
        value="<?= $editSession['time'] ?? '' ?>">

    <!-- SELECT TEAM -->
    <select name="team_id" required>
        <option value="">-- Choisir équipe --</option>
        <?php foreach ($teams as $t): ?>
            <option value="<?= $t['id'] ?>"
                <?= (isset($editSession['team_id']) && $editSession['team_id'] == $t['id']) ? 'selected' : '' ?>>
                <?= $t['name'] ?>
            </option>
        <?php endforeach; ?>
    </select>

    <?php if ($editSession): ?>
        <button name="update">Modifier</button>
        <a href="sessions.php">Annuler</a>
    <?php else: ?>
        <button name="add">Ajouter</button>
    <?php endif; ?>
</form>

<!-- ======================
     TABLE
====================== -->
<table>
    <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Date</th>
        <th>Heure</th>
        <th>Équipe</th>
        <th>Actions</th>
    </tr>

    <?php foreach ($sessions as $s): ?>
    <tr>
        <td><?= $s['id'] ?></td>
        <td><?= $s['title'] ?></td>
        <td><?= $s['date'] ?></td>
        <td><?= $s['time'] ?></td>
        <td><?= $s['team_name'] ?></td>
        <td>
            <a href="?edit=<?= $s['id'] ?>">Edit</a>
            <a href="?delete=<?= $s['id'] ?>" onclick="return confirm('Supprimer ?')">Delete</a>
        </td>
    </tr>
    <?php endforeach; ?>
</table>

<?php require '../includes/footer.php'; ?>