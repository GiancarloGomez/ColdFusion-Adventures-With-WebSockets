<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>GAME</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700">
	<link rel="stylesheet" href="style.css">
</head>
<body class="off">

	<div id="board">
		<div id="game">
			<button type="button" class="key green" data-index="0" disabled></button>
			<button type="button" class="key red" data-index="1" disabled></button>
			<button type="button" class="key yellow" data-index="2" disabled></button>
			<button type="button" class="key blue" data-index="3" disabled></button>
		</div>
		<sidebar>
			<div id="players"></div>
			<div id="controls">
				<button type="button" class="hide" id="restart">RESTART</button>
			</div>
		</sidebar>
	</div>

	<div id="overlay">
		<form id="subscribeForm" name="subscribeForm">
			<input type="text" name="username" value="" placeholder="Enter username to subscribe" autocomplete="off">
			<button type="submit" class="" id="subscribe">SUBSCRIBE</button>
		</form>
		<div id="waiting" class="hide">Waiting for user to join game ...</div>
	</div>

	<audio src="sounds/1.mp3"></audio>
	<audio src="sounds/2.mp3"></audio>
	<audio src="sounds/3.mp3"></audio>
	<audio src="sounds/4.mp3"></audio>
	<audio src="sounds/5.mp3"></audio>
	<audio src="sounds/6.mp3"></audio>

	 <script src="game.js"></script>

	<cfwebsocket 	name 		="ws"
					secure 		="#cgi.server_port_secure#"
					onMessage 	="Game.receiveData" />
</body>
</html>