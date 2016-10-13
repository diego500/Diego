<?php
	date_default_timezone_set("America/Sao_Paulo");
	define('BASE', 'http://localhost/florida/mini-twitter');

	$pdo = new PDO('mysql:host=localhost;dbname=imigrantes', 'root','');
	$pdo->exec("set names utf8");
?>