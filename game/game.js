var Game = {

    colors          : [ "green","red","yellow","blue"],
    body            : document.body,
    plyrs           : document.getElementById('players'),
    restartBtn      : document.getElementById('restart'),
    subscribeBtn    : document.getElementById('subscribe'),
    audio           : document.getElementsByTagName('audio'),
    frm             : document.getElementById('subscribeForm'),
    keys            : document.querySelectorAll('.key'),
    waiting         : document.getElementById('waiting'),
    game            : [],
    players         : [],
    curPick         : [],
    me              : '',
    activePlayer    : null,

    init : function(){
        const _this = this;

        // map key click
        _this.keys.forEach(element => element.addEventListener('click',
            evt => _this.positionClicked(evt.target.dataset.index)
        ));

        // subscribe form
        _this.frm.addEventListener('submit',function(evt){
            var username = _this.frm.username.value.trim();
            // submit if good
            if (username !== ''){
                _this.subscribe(username);
                _this.frm.classList.add('hide');
                _this.waiting.classList.remove('hide');
            }
            evt.preventDefault();
        });

        _this.restartBtn.addEventListener('click',function(){
            ws.publish('game.path_1',{type:'restart-game',position:Math.floor(Math.random() * 4)});
            _this.restartBtn.classList.add('hide');
        });
    },

    disableGameKeys : function (state){
        this.keys.forEach(element => element.disabled = state );
    },

    positionClicked : function(position){
        let _this = this;

        if (_this.me === _this.players[_this.activePlayer].clientid){
            // add current pick for active player
            if (_this.game.length > 0)
                _this.curPick.push(_this.colors[position]);

            // check if current player matches the selected pick
            if (_this.game.length > 0 && _this.curPick.length <= _this.game.length){
                if (_this.game[_this.curPick.length-1] !== _this.curPick[_this.curPick.length-1]){
                    ws.publish('game.path_1',{type:'stop-game'});
                    _this.gameEnd();
                    return;
                }
            }
            // add initial or new pick
            else if (_this.game.length === 0 || _this.curPick.length > _this.game.length){

                // change players
                if (_this.game.length < _this.curPick.length){
                    // show active player
                    ws.publish('game.path_1',{type:'change-player'});
                    _this.playerSetActive();
                }

                // add to game array
                _this.game.push(_this.colors[position]);
            }
            // push the position
            _this.positionPlayed(position);
            // push the game
            ws.publish('game.path_1',{type:'track-game',data:_this.game,position:position});
        }
    },

    positionPlayed : function(position){
        let _this = this;
        // add animation
        _this.keys[position].classList.add('on');
        // stop animation
        window.setTimeout(function(pos){
            _this.keys[pos].classList.remove('on');
        },100,position);
        // play audio
        _this.audio[position].currentTime = 0;
        _this.audio[position].play();
    },

    gameEnd : function(){
        let _this   = this,
            winner = _this.players[_this.activePlayer ? 0 : 1];

        // add scrore to winning player
        winner.score++;

        // show looser
        _this.plyrs.querySelectorAll('li').forEach(li => {
            li.classList.remove('active');
            if(li.id === 'c-' + winner.clientid){
                li.classList.add('winner');
                li.querySelector('.score').innerHTML = winner.score;
            } else {
                li.classList.add('looser');
            }
        });

        if (winner.clientid === _this.me){
            _this.restartBtn.classList.remove('hide');
            _this.body.classList.remove('no-turn');
            _this.audio[_this.audio.length-1].volume = .8;
            _this.audio[_this.audio.length-1].currentTime = 0;
            _this.audio[_this.audio.length-1].play();
        } else {
            _this.body.classList.add('no-turn');
            _this.audio[_this.audio.length-2].volume = .5;
            _this.audio[_this.audio.length-2].currentTime = 0;
            _this.audio[_this.audio.length-2].play();
        }

        // disable keys
        _this.disableGameKeys(true);
    },

    gameRestart : function(pos){
        let _this   = this;
        // reset game
        _this.game = [];
        _this.plyrs.querySelectorAll('li').forEach(li => li.classList.remove('looser','winner'));
        _this.playerSetActive();
        _this.disableGameKeys(false);
        // settimeout so click happens after a few
        window.setTimeout(function(pos){
            _this.keys[pos].click()
        },500,pos);
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
        // settimeout so first click happens after enable
        window.setTimeout(function(pos){
            _this.keys[pos].click()
        },500,data.first);
        // remove off state
        _this.body.classList.remove('off');
        _this.waiting.classList.add('hide');
        // render players
        _this.playerRender();
        // set active player
        _this.playerSetActive();
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

    receiveData : function(message){
        let _this       = Game,
            _response   = message.data || {},
            _publisher  = message.publisherid || 0,
            _me         = _this.me;
        // I subscribed
        if(message.reqType === 'subscribe' && message.msg === 'ok'){
            _this.me = message.clientid;
        }
        // Room is full
        else if(message.msg && message.msg.indexOf('Access denied') !== -1){
            console.error('The room is full at the moment, please try again later');
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
                    location.reload();
                break;
            }
        }
    },

    subscribe : function(username){
        ws.subscribe('game.path_1',{username:username});
    }
};

Game.init();