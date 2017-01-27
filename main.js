window.onload = function() {


	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

	function preload() {

		// Player related assets
		game.load.image('ship', 'assets/hero1.png');

		// Enemies/obstacle related assets
		game.load.spritesheet('invader', 'assets/invader32x32x4.png', 32, 32);

		// Projectiles related assets
		game.load.image('bullet', 'assets/bullet.png');
		game.load.image('barrier1', 'assets/tree1.png');
		game.load.image('barrier2', 'assets/tree2.png');
		game.load.image('enemyBullet', 'assets/enemy-bullet.png');
        game.load.image('gameOver', 'assets/game-over.jpg');
		game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);

		// Background related assets
		game.load.image('starfield', 'assets/snow1.jpg');

	}

	var player;
	var cursors;
	var fireButton;
	var explosions;
	var starfield;
	var score = 0;
	var scoreString = '';
	var scoreText;
	var lives;
	var barrier;
	var barrierTimer = 0;
	var stateText;
	var barriers;

	function create() {

	    game.physics.startSystem(Phaser.Physics.ARCADE);

	    //  The scrolling starfield background
	    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

	    // The enemy's bullets
	    barriers = game.add.group();
	    barriers.enableBody = true;
	    barriers.physicsBodyType = Phaser.Physics.ARCADE;
        barriers.createMultiple(20, 'barrier1');
        barriers.createMultiple(20, 'barrier2');
        // barriers.setAll('anchor.x', 0.5);
        // barriers.setAll('anchor.y', 1);
	    barriers.setAll('outOfBoundsKill', true);
	    barriers.setAll('checkWorldBounds', true);


	    //  The hero!
	    player = game.add.sprite(400, 500, 'ship');
	    player.anchor.setTo(0.5, 0.5);
	    game.physics.enable(player, Phaser.Physics.ARCADE);

	    //  The score
	    scoreString = 'Score : ';
	    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

	    //  Lives
	    lives = game.add.group();
	    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

		 // Add the game over screen, but don't display it just yet
		 gameOver = game.add.sprite(0, 0, 'gameOver');
		 gameOver.visible = false;

	    //  Text
	    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
	    stateText.anchor.setTo(0.5, 0.5);
	    stateText.visible = false;

	    for (var i = 0; i < 3; i++)
	    {
	        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
	        ship.anchor.setTo(0.5, 0.5);
	        ship.angle = 90;
	        ship.alpha = 0.4;
	    }

	    //  An explosion pool
	    explosions = game.add.group();
	    explosions.createMultiple(30, 'kaboom');
	    explosions.forEach(setupInvader, this);

	    //  And some controls to play the game with
	    cursors = game.input.keyboard.createCursorKeys();
	    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	}

	function setupInvader (invader) {

	    invader.anchor.x = 0.5;
	    invader.anchor.y = 0.5;
	    invader.animations.add('kaboom');

	}

	function update() {

	    //  Scroll the background
	    starfield.tilePosition.y += 3;
        //  Increase the score
        score += 1;
        scoreText.text = scoreString + score;

	    if (player.alive)
	    {
	        //  Reset the player, then check for movement keys
	        player.body.velocity.setTo(0, 0);

	        if (cursors.left.isDown)
	        {
	            player.body.velocity.x = -400;
	        }
	        else if (cursors.right.isDown)
	        {
	            player.body.velocity.x = 400;
	        }

	        if (game.time.now > barrierTimer)
	        {
	            barrierAppears();
	        }

	        //  Run collision
	        game.physics.arcade.overlap(barriers, player, barrierHitsPlayer, null, this);
	    }

	}

	function render() {

	    // for (var i = 0; i < aliens.length; i++)
	    // {
	    //     game.debug.body(aliens.children[i]);
	    // }

	}

	function barrierHitsPlayer (player,bullet) {

	    bullet.kill();

	    live = lives.getFirstAlive();

	    if (live)
	    {
	        live.kill();
	    }

	    //  And create an explosion :)
	    var explosion = explosions.getFirstExists(false);
	    explosion.reset(player.body.x, player.body.y);
	    explosion.play('kaboom', 30, false, true);

	    // When the player dies
	    if (lives.countLiving() < 1)
	    {
	        player.kill();
	        barriers.callAll('kill');

			  gameOver.visible = true;

	        stateText.text=" GAME OVER \n Click to restart";
	        stateText.visible = true;

	        //the "click to restart" handler
	        game.input.onTap.addOnce(restart,this);
	    }

	}

	function barrierAppears () {

	    barrier = barriers.getFirstExists(false);

	    if (barrier)
	    {
	        var randomX = game.rnd.integerInRange(0,800);
	        barrier.reset(randomX, -80);
            game.physics.arcade.moveToXY(barrier,randomX,600,180);

	        barrierTimer = game.time.now + game.rnd.integerInRange(50,250);
	    }

	}

	function restart () {

	    //  A new level starts

		score = 0;
	    //resets the life count
	    lives.callAll('revive');
	    //  And brings the aliens back from the dead :)

		gameOver.visible = false;

	    //revives the player
	    player.revive();
	    //hides the text
	    stateText.visible = false;

	}

};
