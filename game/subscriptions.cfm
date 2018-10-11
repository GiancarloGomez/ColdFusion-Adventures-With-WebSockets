<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="icon" href="/favicon.ico">
	<title>SUBSCRIPTIONS</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	<link rel="stylesheet" href="/assets/css/ui.css">
</head>
<body id="subscriptions">
	<section>
		<h1>Subscriptions</h1>
		<cfscript>
			topLevelChannels = WSGetAllChannels();

			for (channel in topLevelChannels){

				subChannels = WSGetAllChannels(channel);

				if (subChannels.len()){
					for (subChannel in subChannels)
						writeDump(label:subChannel,var:WSGetSubscribers(subChannel))
				} else {
					writeDump(label:channel,var:WSGetSubscribers(channel));
				}
			}
		</cfscript>
	</section>
</body>
</html>