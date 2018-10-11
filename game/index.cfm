<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="icon" href="/favicon.ico">
	<title>THE GAME DEMO</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	<link rel="stylesheet" href="/assets/css/ui.css">
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
</head>
<body id="welcome">
	<section>
		<h1>ColdFusion Adventures With WebSockets</h1>
		<p>
			Welcome to the 2 Player Simon Game Example
		</p>
		<p>
			What will you like to do?
		</p>
		<p>
			<a href="./play/" target="_blank">Play a Game</a> &bull;
			<a href="./subscriptions/" target="_blank">View Subscribers</a> &bull;
			<a href="./console/" target="_blank">Open Console</a>
		</p>
		<p>
			<small>
				Console requires having the console code at the root of this site either
				by a virtual folder mapping or physical code in disk.
				<br /><br />
				If you use an alias make sure to change the following setting in the ColdFusion Administrator.
				<br /><span><strong>Application.cfc/Application.cfm lookup order<br />In webroot</strong></span>
				<br /><br />
				When you want to monitor a game using the console app, make sure to subscribe to the name of the game using
				dot notation as follows and leave the username blank.
				<br /><span><strong>game.{{name_of_game}}</strong></span>
			</small>
		</p>
	</section>
	<p id="sig">
		Giancarlo Gomez<br />
		<a href="https://fusedevelopments.com" target="_blank">Fuse Developments</a> &bull;
		<a href="https://crosstrackr.com" target="_blank">CrossTrackr</a>
		<br />
		<a href="https://github.com/GiancarloGomez" target="_blank"><i class="fab fa-github"></i></a> &nbsp;
		<a href="https://twitter.com/GiancarloGomez" target="_blank"><i class="fab fa-twitter"></i></a> &nbsp;
		<a href="https://www.instagram.com/GiancarloGomez" target="_blank"><i class="fab fa-instagram"></i></a> &nbsp;
		<a href="https://www.facebook.com/giancarlo.gomez" target="_blank"><i class="fab fa-facebook"></i></a> &nbsp;
		<a href="https://www.linkedin.com/in/giancarlogomez" target="_blank"><i class="fab fa-linkedin-in"></i></a> &nbsp;
		<a href="https://www.giancarlogomez.com" target="_blank"><i class="fas fa-rss"></i></a> &nbsp;
		<a href="mailto:giancarlo.gomez@gmail.com"><i class="far fa-envelope"></i></a>
	</p>
</body>
</html>