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
// CREATE TEAM
// ======================
if (isset($_POST['add'])) {
    $name = validate($_POST['name']);
    $coach = validate($_POST['coach']);

    $stmt = $pdo->prepare("INSERT INTO teams(name, coach) VALUES(?,?)");
    $stmt->execute([$name, $coach]);

    $team_id = $pdo->lastInsertId();

    // Ajouter membres
    if (!empty($_POST['members'])) {
        foreach ($_POST['members'] as $member_id) {
            $stmt = $pdo->prepare("INSERT INTO team_members(team_id, member_id) VALUES(?,?)");
            $stmt->execute([$team_id, $member_id]);
        }
    }
}

// ======================
// DELETE
// ======================
if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM teams WHERE id=?");
    $stmt->execute([$_GET['delete']]);
}

// ======================
// LOAD MEMBERS (pour select)
// ======================
$allMembers = $pdo->query("SELECT * FROM members")->fetchAll();

// ======================
// LOAD EDIT
// ======================
$editTeam = null;
$selectedMembers = [];

if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM teams WHERE id=?");
    $stmt->execute([$_GET['edit']]);
    $editTeam = $stmt->fetch();

    // membres liés
    $stmt = $pdo->prepare("SELECT member_id FROM team_members WHERE team_id=?");
    $stmt->execute([$_GET['edit']]);
    $selectedMembers = $stmt->fetchAll(PDO::FETCH_COLUMN);
}

// ======================
// UPDATE
// ======================
if (isset($_POST['update'])) {
    $id = $_POST['id'];
    $name = validate($_POST['name']);
    $coach = validate($_POST['coach']);

    $stmt = $pdo->prepare("UPDATE teams SET name=?, coach=? WHERE id=?");
    $stmt->execute([$name, $coach, $id]);

    // reset relation
    $pdo->prepare("DELETE FROM team_members WHERE team_id=?")->execute([$id]);

    if (!empty($_POST['members'])) {
        foreach ($_POST['members'] as $member_id) {
            $pdo->prepare("INSERT INTO team_members(team_id, member_id) VALUES(?,?)")
                ->execute([$id, $member_id]);
        }
    }
}

// ======================
// READ TEAMS
// ======================
$teams = $pdo->query("SELECT * FROM teams")->fetchAll();
?>

<h2>Gestion des équipes</h2>

<!-- FORM -->
<form method="POST">
    <input type="hidden" name="id" value="<?= $editTeam['id'] ?? '' ?>">

    <input name="name" placeholder="Nom équipe" required
        value="<?= $editTeam['name'] ?? '' ?>">

    <input name="coach" placeholder="Coach"
        value="<?= $editTeam['coach'] ?? '' ?>">

    <!-- MULTI SELECT MEMBERS -->
    <label>Membres</label>
    <select name="members[]" multiple style="height:150px;">
        <?php foreach ($allMembers as $m): ?>
            <option value="<?= $m['id'] ?>"
                <?= in_array($m['id'], $selectedMembers) ? 'selected' : '' ?>>
                <?= $m['name'] ?>
            </option>
        <?php endforeach; ?>
    </select>

    <?php if ($editTeam): ?>
        <button name="update">Modifier</button>
        <a href="teams.php">Annuler</a>
    <?php else: ?>
        <button name="add">Ajouter</button>
    <?php endif; ?>
</form>

<!-- TABLE -->
<table>
    <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Coach</th>
        <th>Membres</th>
        <th>Actions</th>
    </tr>

    <?php foreach ($teams as $t): ?>
    <tr>
        <td><?= $t['id'] ?></td>
        <td><?= $t['name'] ?></td>
        <td><?= $t['coach'] ?></td>
        <td>
            <?php
            $stmt = $pdo->prepare("
                SELECT m.name FROM members m
                JOIN team_members tm ON m.id = tm.member_id
                WHERE tm.team_id = ?
            ");
            $stmt->execute([$t['id']]);
            $members = $stmt->fetchAll();

            foreach ($members as $m) {
                echo $m['name'] . "<br>";
            }
            ?>
        </td>
        <td>
            <a href="?edit=<?= $t['id'] ?>">Edit</a>
            <a href="?delete=<?= $t['id'] ?>" onclick="return confirm('Supprimer ?')">Delete</a>
        </td>
    </tr>
    <?php endforeach; ?>
</table>

<?php require '../includes/footer.php'; ?>