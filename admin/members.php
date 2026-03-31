<?php
require '../includes/auth_check.php';
require '../config/db.php';
require '../includes/header.php';

// ======================
// VALIDATION FUNCTION
// ======================
function validate($data) {
    return htmlspecialchars(trim($data));
}

// ======================
// CREATE
// ======================
if (isset($_POST['add'])) {
    $name  = validate($_POST['name']);
    $age   = (int)$_POST['age'];
    $email = validate($_POST['email']);
    $phone = validate($_POST['phone']);

    if ($name && $age > 0) {
        $stmt = $pdo->prepare("INSERT INTO members(name, age, email, phone) VALUES(?,?,?,?)");
        $stmt->execute([$name, $age, $email, $phone]);
    } else {
        echo "<p style='color:red;'>Nom et âge valides requis</p>";
    }
}

// ======================
// DELETE
// ======================
if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM members WHERE id=?");
    $stmt->execute([$_GET['delete']]);
}

// ======================
// UPDATE (LOAD DATA)
// ======================
$editMember = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM members WHERE id=?");
    $stmt->execute([$_GET['edit']]);
    $editMember = $stmt->fetch();
}

// ======================
// UPDATE (SAVE)
// ======================
if (isset($_POST['update'])) {
    $id    = $_POST['id'];
    $name  = validate($_POST['name']);
    $age   = (int)$_POST['age'];
    $email = validate($_POST['email']);
    $phone = validate($_POST['phone']);

    $stmt = $pdo->prepare("UPDATE members SET name=?, age=?, email=?, phone=? WHERE id=?");
    $stmt->execute([$name, $age, $email, $phone, $id]);
}

// ======================
// READ
// ======================
$members = $pdo->query("SELECT * FROM members ORDER BY id DESC")->fetchAll();
?>

<h2>Gestion des Membres</h2>

<!-- ======================
     FORM (ADD / EDIT)
====================== -->
<form method="POST">
    <input type="hidden" name="id" value="<?= $editMember['id'] ?? '' ?>">

    <input name="name" placeholder="Nom" required
        value="<?= $editMember['name'] ?? '' ?>">

    <input name="age" type="number" placeholder="Age" required
        value="<?= $editMember['age'] ?? '' ?>">

    <input name="email" type="email" placeholder="Email"
        value="<?= $editMember['email'] ?? '' ?>">

    <input name="phone" placeholder="Téléphone"
        value="<?= $editMember['phone'] ?? '' ?>">

    <?php if ($editMember): ?>
        <button name="update">Modifier</button>
        <a href="members.php">Annuler</a>
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
        <th>Nom</th>
        <th>Age</th>
        <th>Email</th>
        <th>Actions</th>
    </tr>

    <?php foreach ($members as $m): ?>
    <tr>
        <td><?= $m['id'] ?></td>
        <td><?= $m['name'] ?></td>
        <td><?= $m['age'] ?></td>
        <td><?= $m['email'] ?></td>
        <td>
            <a href="?edit=<?= $m['id'] ?>">Edit</a>
            <a href="?delete=<?= $m['id'] ?>" onclick="return confirm('Supprimer ?')">Delete</a>
        </td>
    </tr>
    <?php endforeach; ?>
</table>

<?php require '../includes/footer.php'; ?>