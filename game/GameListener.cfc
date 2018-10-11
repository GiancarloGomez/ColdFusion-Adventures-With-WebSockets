component extends="CFIDE.websocket.ChannelListener" {

	public boolean function allowSubscribe(struct subscriberInfo) {
		// make sure there is not more than 2
		// use filter option to allow entry of console log subscription
		var subs 	= wsGetSubscribers(arguments.subscriberInfo.channelname)
					.filter(function(a){
						return !isNull(a.subscriberinfo.username);
					});
		var isUser = !isNull(arguments.subscriberinfo.username);
		// if 2 already joined then you can not
		if (subs.len() >= 2 && isUser)
			return false;
		// if we have 2 subscribers to this channel let's send the startGame call
		if (isUser){
			thread name="subscribers_#createUUID()#" action="run" channel = arguments.subscriberInfo.channelname  {
				sleep(150);
				startGame(attributes.channel);
			}
		}
		return true;
	}

	public any function beforePublish( any message, struct publisherInfo){
		local.messageData = {
			data 			: arguments.message,
			connectioninfo 	: arguments.publisherInfo.connectionInfo
		};
		return local.messageData;
	}

	public function afterUnsubscribe(struct subscriberInfo){
		if (!isNull(arguments.subscriberInfo.username))
			wsPublish(arguments.subscriberInfo.channelname,{type:"player-left"});
	}

	private function startGame(channelname){
		// send ( only work with subscriptions with usernames - allow for console )
		var players = wsGetSubscribers(arguments.channelname)
						.filter(function(a){
							return !isNull(a.subscriberinfo.username);
						});
		// only send start call when more than 1 subscriber
		if (players.len() > 1){
			WsPublish(arguments.channelname,{
				type 	: "start-game",
				players : players,
				first 	: randRange(0, 3)
			});
		}
	}
}