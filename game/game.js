var Game = {

    colors          : [ "green","red","yellow","blue"],
    body            : document.body,
    plyrs           : document.getElementById('players'),
    turnLabel       : document.getElementById('turn'),
    gameInfoBar     : document.getElementById('game-info'),
    restartBtn      : document.getElementById('restart'),
    subscribeBtn    : document.getElementById('subscribe'),
    audio           : document.getElementsByTagName('audio'),
    frm             : document.getElementById('subscribeForm'),
    keys            : document.querySelectorAll('.key'),
    waiting         : document.getElementById('waiting'),
    channelLabels   : document.querySelectorAll('.channel_label'),
    game            : [],
    players         : [],
    curPick         : [],
    me              : '',
    channel         : '',
    activePlayer    : null,

    init : function(){
        const _this = this;

        // map key click
        _this.keys.forEach(element => {
            element.addEventListener('click', evt => _this.positionClicked(evt.target.dataset.index));
            element.addEventListener('transitionend', _this.removeTransition);
        });

        // subscribe form
        _this.frm.addEventListener('submit',function(evt){
            const   username = _this.frm.username.value.trim(),
                    channel  = _this.frm.channel.value.trim();
            // submit if good
            if (username !== '' && channel !== ''){
                _this.channel = `game.${channel}`;
                _this.channelLabels.forEach(element => element.innerHTML = channel );
                _this.subscribe(username);
                _this.subscribeBtn.disabled = true;
                _this.subscribeBtn.innerHTML = 'PROCESSING';
            }
            evt.preventDefault();
        });

        _this.restartBtn.addEventListener('click',function(){
            ws.publish(_this.channel,{type:'restart-game',position:Math.floor(Math.random() * 4)});
            _this.restartBtn.classList.add('hide');
        });
    },

    disableGameKeys : function (state){
        this.keys.forEach(element => element.disabled = state );
    },

    gameEnd : function(){
        let _this   = this,
            winner = _this.players[_this.activePlayer ? 0 : 1];

        // add scrore to winning player
        winner.score++;

        // show status on player list
        _this.plyrs.querySelectorAll('li').forEach(li => {
            li.classList.remove('active');
            if(li.id === 'c-' + winner.clientid){
                li.classList.add('winner');
                li.querySelector('.score').innerHTML = winner.score;
            } else {
                li.classList.add('looser');
            }
        });

        // run sounds and update top bar
        if (winner.clientid === _this.me){
            _this.gameInfoBar.classList.add('winner');
            _this.turnLabel.innerHTML = 'YOU WON!!!';
            _this.restartBtn.classList.remove('hide');
            _this.body.classList.remove('no-turn');
            _this.audio[_this.audio.length-1].volume = .8;
            _this.audio[_this.audio.length-1].currentTime = 0;
            _this.audio[_this.audio.length-1].play();
        } else {
            _this.gameInfoBar.classList.add('looser');
            _this.turnLabel.innerHTML = 'YOU LOST :-(';
            _this.body.classList.add('no-turn');
            _this.audio[_this.audio.length-2].volume = .5;
            _this.audio[_this.audio.length-2].currentTime = 0;
            _this.audio[_this.audio.length-2].play();
        }

        // disable keys
        _this.disableGameKeys(true);
    },

    gameRestart : function(position){
        let _this   = this;
        // reset game
        _this.game = [];
        _this.plyrs.querySelectorAll('li').forEach(li => li.classList.remove('looser','winner'));
        _this.playerSetActive();
        _this.disableGameKeys(false);
        _this.gameInfoBar.classList.remove('looser','winner');
        _this.notifyTurn(position,true);
    },

    gameStart : function(data){
        let _this = this;
        // enable keys
        _this.disableGameKeys( false );
        // set players
        _this.players = data.players;
        // add score keeper
        _this.players.forEach(player => {player.score = 0} );
        // reset game
        _this.game = [];
        // remove off state
        _this.body.classList.remove('off');
        _this.waiting.classList.add('hide');
        // render players
        _this.playerRender();
        // set active player
        _this.playerSetActive();
        // notifiy player their turn
        _this.notifyTurn(data.first,true);
    },

    notifyTurn : function(position, firstHit = false){
        let _this       = this,
            isMe        = _this.players[_this.activePlayer].clientid === _this.me,
            username    = _this.players[_this.activePlayer].subscriberinfo.username;

        if ( isMe === true ){
            _this.turnLabel.innerHTML = `It is your turn ${username}!`;
            _this.gameInfoBar.classList.add('my-turn');
        } else {
            _this.turnLabel.innerHTML = `It is ${username}'s turn`;
            _this.gameInfoBar.classList.remove('my-turn');
        }

        if (firstHit === true){
            // settimeout so first click happens after enable
            window.setTimeout(function(pos){
                _this.keys[pos].click()
            },1000,position);
        }
    },

    playerSetActive : function(){
        let _this   = this;
        // set active player
        if (_this.activePlayer === null)
            _this.activePlayer = 0;
        else
            _this.activePlayer = _this.activePlayer ? 0 : 1;
        // update the li elements to show player
        _this.plyrs.querySelectorAll('li').forEach(li => {
            if(li.id === 'c-' + _this.players[_this.activePlayer].clientid)
                li.classList.add('active');
            else
                li.classList.remove('active');
        });
        // make sure we can not click when not our turn
        if (_this.players[_this.activePlayer].clientid === _this.me)
            _this.body.classList.remove('no-turn');
        else
            _this.body.classList.add('no-turn');
        // reset player's pick
        _this.curPick = [];
    },

    playerRender : function(){
        let _this   = this,
            str     = '';
        // render players
        _this.players.forEach(player => str += `
        <li id="c-${player.clientid}">
            <div><strong>${player.clientid === _this.me ? 'ME' : 'OPPONENT'}</strong></div>
            <div>${player.subscriberinfo.username}</div>
            <div>${player.clientid}</div>
            <div class="score">${player.score}</div>
        </li>
        `);
        _this.plyrs.innerHTML = `<ul>${str}</ul>`;
    },

    positionClicked : function(position){
        let _this       = this;

        if (_this.me === _this.players[_this.activePlayer].clientid){
            // add current pick for active player
            if (_this.game.length > 0)
                _this.curPick.push(_this.colors[position]);

            // check if current player matches the selected pick
            if (_this.game.length > 0 && _this.curPick.length <= _this.game.length){
                if (_this.game[_this.curPick.length-1] !== _this.curPick[_this.curPick.length-1]){
                    ws.publish(_this.channel,{type:'stop-game'});
                    _this.gameEnd();
                    return;
                }
            }
            // add initial or last pick
            else if (_this.game.length === 0 || _this.curPick.length > _this.game.length){

                // change players
                if (_this.game.length < _this.curPick.length){
                    // show active player
                    ws.publish(_this.channel,{type:'change-player'});
                    _this.playerSetActive();
                }

                // add to game array
                _this.game.push(_this.colors[position]);
            }
            // push the position
            _this.positionPlayed(position);
            // push the game
            ws.publish(_this.channel,{type:'track-game',data:_this.game,position:position});
        }
    },

    positionPlayed : function(position){
        let _this = this;
        // add animation
        _this.keys[position].classList.add('on');
        // notify turn
        _this.notifyTurn(position,false);
        // play audio
        _this.audio[position].currentTime = 0;
        _this.audio[position].play();
    },

    receiveData : function(message){
        let _this       = Game,
            _response   = message.data || {},
            _publisher  = message.publisherid || 0,
            _me         = _this.me;
        // I subscribed
        if(message.reqType === 'subscribe' && message.msg === 'ok'){
            _this.me = message.clientid;
            _this.frm.classList.add('hide');
            _this.waiting.classList.remove('hide');
        }
        // Room is full
        else if(message.msg && message.msg.indexOf('Access denied') !== -1){
            _this.subscribeBtn.disabled     = false;
            _this.subscribeBtn.innerHTML    = 'SUBMIT';
            window.alert(`The channel ${_this.frm.channel.value.trim()} full at the moment, please try again later or create another channel.`);
        }
        // handle all possible messages
        else if (message.data) {
            switch (_response.data.type){
                case 'change-player':
                    // change player
                    if (_publisher !== _me)
                        _this.playerSetActive();
                break;
                case 'track-game':
                    // if not me update the game array
                    if (_publisher !== _me){
                        _this.game = _response.data.data;
                        _this.positionPlayed(_response.data.position);
                    }
                break;
                case 'start-game':
                    _this.gameStart(_response.data);
                break;
                case 'restart-game':
                    _this.gameRestart(_response.data.position);
                break;
                case 'stop-game':
                    if (_publisher !== _me)
                        _this.gameEnd();
                break;
                case 'player-left':
                    ws.unsubscribe(_this.channel);
                    window.alert('The other player left the game, your session will end now.');
                    location.reload();
                break;
            }
        }
    },

    removeTransition : function(e) {
        if (e.propertyName !== 'transform' && !this.classList.contains('on')) return;
            this.classList.remove('on');
    },

    subscribe : function(username){
        let _this = this;
        ws.subscribe(_this.channel,{username:username});
    }
};

Game.init();