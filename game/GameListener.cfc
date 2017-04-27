component extends="CFIDE.websocket.ChannelListener" {

	public boolean function allowSubscribe(struct subscriberInfo) {
		// make sure there is not more than 2
		var subs = WSGetSubscribers(arguments.subscriberInfo.channelname);
		// if 2 already joined then you can not
		if (subs.len() >= 2)
			return false;
		// if we have 2 subscribers to this channel let's send the startGame call
		thread name="subscribers_#createUUID()#" action="run" channel = arguments.subscriberInfo.channelname  {
			sleep(150);
			startGame(attributes.channel);
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
		WsPublish(arguments.subscriberInfo.channelname,{type:"player-left"});
	}

	private function startGame(channelname){
		// send
		var players = WSgetSubscribers(arguments.channelname);
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