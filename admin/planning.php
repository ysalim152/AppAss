<?php
require '../includes/auth_check.php';
require '../includes/header.php';
?>

<h2>Planning des séances</h2>

<div id="calendar"></div>

<script>
document.addEventListener('DOMContentLoaded', function () {

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',

        events: 'events.php',

        eventClick: function(info) {
            alert("Séance : " + info.event.title);
        }
    });

    calendar.render();
});
</script>

<?php require '../includes/footer.php'; ?>