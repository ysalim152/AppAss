<?php
session_start();
require '../config/db.php';

if ($_POST) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user'] = $user;
        header("Location: ../admin/dashboard.php");
    } else {
        echo "Email ou mot de passe incorrect";
    }
}
?>
<?php
session_start();
require '../config/db.php';

if ($_POST) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
    $stmt->execute([$_POST['email']]);
    $user = $stmt->fetch();

    if ($user && password_verify($_POST['password'], $user['password'])) {
        $_SESSION['user'] = $user;
        header("Location: ../admin/dashboard.php");
    } else {
        echo "Erreur login";
    }
}
?>