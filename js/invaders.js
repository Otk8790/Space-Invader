//Creamos las variable necesarias para nuestro juego
var fondoJuego;
var nave;
var cursores;
var detener = "arriba";
var quieto = "idle";

var bala;
var balas;

var puntos;
var txtPuntos;

var vidas;
var txtVidas;

var tiempoBala = 0; 
var botonDisparo; 
var enemigos;
var balaEnemi; //Bala enemiga
var balasEnemi; //Balas enemigas
var tempBala = 0; //Temporizador de disparo de la bala enemiga
var enemigosVivos = []; //Enemigos vivos
var personaje;
var life;
var explosions;
var stateText;

//Sonidos
var boom;
var bip;
var brr;

var juego = new Phaser.Game(800, 600, Phaser.CANVAS, "bloque_juego");

var estadoPrincipal = {

    preload: function(){
        juego.load.image("fondo", "img/starfield.png");
        juego.load.spritesheet("personaje", "img/jugador.png", 55, 55);
        juego.load.image("laser", "img/bullet.png");
        juego.load.image("enemyBullet", "img/enemy-bullet.png");
        juego.load.spritesheet("enemigo", "img/invader (2).png", 32, 32);
        juego.load.spritesheet("kaboom", "img/explode.png", 128, 128);
        juego.load.image("life", "img/life.png");
        juego.load.audio("boom", "audio/explosion.mp3");
        juego.load.audio("bip", "audio/laser.mp3");
        juego.load.audio("brr", "audio/laserEnemy.mp3");
    },

    create: function(){

        juego.physics.startSystem(Phaser.Physics.ARCADE);

        fondoJuego = juego.add.tileSprite(0, 0, 800, 600, "fondo");
        
        //Creamos la nave
        nave = juego.add.sprite(juego.width/2, 500, "personaje")
        juego.physics.enable(nave, Phaser.Physics.ARCADE);

        //Creamos el audio
        boom = juego.add.audio("boom");
        bip = juego.add.audio("bip");
        brr = juego.add.audio("brr");

        //Cambiamos el punto de apoyo para que quede en el centro
        nave.anchor.setTo(0.5);
        nave.animations.add("derecha", [2], 10, true);
        nave.animations.add("idle", [1], 10, true);
        nave.animations.add("izquierda", [0], 10, true);
        cursores = juego.input.keyboard.createCursorKeys();
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //Aqui se crean las balas cada vez que oprimimos SPACEBAR
        balas = juego.add.group();
        //Le damos un cuerpo a las balas
        balas.enableBody = true;
        //Hacemos que detecte las colisiones
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        //Creamos las balas con su respectiva imagen
        balas.createMultiple(20, "laser");
        //Le damos el origen, la mitad en "x" y la ultima coordenada en "y"
        balas.setAll("anchor.x", 0.5);
        balas.setAll("anchor.y", 1);
        //Tenemos que decirle a las balas que cada vez que se salgan del área del juego seran destruidas
        balas.setAll("outOfBoundsKill", true);
        //Verificamos que las balas estén dentro de los límites del juego
        balas.setAll("checkWorldBounds", true);

        //Enemigos
        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;

        createEnemigos();

        //Balas enemigas
        balasEnemi = juego.add.group();
        balasEnemi.enableBody = true;
        balasEnemi.physicsBodyType = Phaser.Physics.ARCADE;
        balasEnemi.createMultiple(30, "enemyBullet");
        balasEnemi.setAll("anchor.x", 0.5);
        balasEnemi.setAll("anchor.y", 1);
        balasEnemi.setAll("outOfBoundsKill", true);
        balasEnemi.setAll("checkWorldBounds", true);

        //Texto
        puntos = 0;
        txtPuntos = juego.add.text(20, 20, "Puntos: ", {font: "20px Arial", fill: "#FFF"}); 
        txtPuntos = juego.add.text(100, 20, "0", {font: "20px Arial", fill: "#FFF"}); 
        
        //Vidas
        vidas = juego.add.group();
        txtVidas = juego.add.text(juego.world.width - 100, 10, "Vidas: ", {font: "20px Arial", fill: "#FFF"}); 

        stateText = juego.add.text(juego.world.centerX,juego.world.centerY,' ', { font: "40px Arial", fill: "#fff" });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;

        for (var i = 0; i < 3; i++) 
        {
            var life = vidas.create(juego.world.width - 90 + (30 * i), 60, "life");
            life.anchor.setTo(0.5, 0.5);
            life.angle = 90;
            life.alpha = 0.4;
        }

        //Explosion
        explosions = juego.add.group();
        explosions.createMultiple(30, "kaboom");
        explosions.forEach(setupInvader, this);
        
    },

    update: function(){

        contador = 0;

        fondoJuego.tilePosition.y += 2;

        if(nave.alive){

        nave.body.velocity.setTo(0, 0);

        if(cursores.right.isDown){
            nave.position.x += 2;
            nave.animations.play("derecha");
               if(detener != "derecha")
               {
                    detener = "derecha";
               }
        }
        else if(cursores.left.isDown){
            nave.position.x -= 2;
            nave.animations.play("izquierda");
                if(detener != "izquierda")
               {
                    detener = "izquierda";
               }
        }
        else{
                if(detener != "espera")
                {
                    nave.animations.stop();
                    nave.frame = 1;
                }
                idle = "espera";
        }
        var bala;
        //Este codigo permite que las balas se disparen de manera correcta
        if(botonDisparo.isDown){
            if(juego.time.now > tiempoBala){
                bala = balas.getFirstExists(false);
                bip.play();
            }

            if(bala){
                //Nos da la posicion de la nave, para disparar desde esta
                bala.reset(nave.x, nave.y);
                //Velocidad y direccion de la bala
                bala.body.velocity.y = -400;
                //El tiempo se da en milisegundos
                tiempoBala = juego.time.now + 200;
            }
        }

        if (juego.time.now > tempBala){
            fuegoEnemi();
        }

        juego.physics.arcade.overlap(balas, enemigos, colision, null, this);
        juego.physics.arcade.overlap(balasEnemi, nave, colisionEnemi, null, this);
        }
    }

};

function createEnemigos () {

    for(var y = 0; y < 4; y++){
        for(var x = 0; x < 10; x++){
            var enemigo = enemigos.create(x*48, y*50, "enemigo");
            enemigo.anchor.setTo(0.5, 0.5);
            enemigo.animations.add("volar", [ 0, 1, 2, 3 ], 20, true);
            enemigo.play("volar");
            enemigo.body.moves = false;
            }   
        }
        
    enemigos.x = 100;
    enemigos.y = 50;

    //Creamos una animación para los enemigos
    //Tween = transicion animada entre dos estados
    var animacion = juego.add.tween(enemigos).to({x:200}, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //Ahora a descender
    animacion.onLoop.add(descender, this);

    }

function fuegoEnemi () {
    balaEnemi = balasEnemi.getFirstExists(false);
    enemigosVivos.length=0;
    enemigos.forEachAlive(function(enemigos){
        enemigosVivos.push(enemigos);
        brr.play();
    });
    
    if (balaEnemi && enemigosVivos.length > 0)
    {
        var random=juego.rnd.integerInRange(0,enemigosVivos.length-1);
        var disparo=enemigosVivos[random];
        balaEnemi.reset(disparo.body.x, disparo.body.y);
        juego.physics.arcade.moveToObject(balaEnemi,nave,120);
        tempBala = juego.time.now + 2000;
    }

}

function colision(bala, enemigo){
    bala.kill();
    enemigo.kill();

    puntos+=20;
    txtPuntos.text = puntos;

    boom.play();

    //Creamos la explosion
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemigo.body.x, enemigo.body.y);
    explosion.play("kaboom", 30, false, true);

    if (enemigos.countLiving() === 0)
    {
        txtPuntos.text = puntos;
        balasEnemi.callAll("kill",this);
        stateText.text = " Felicidades has ganado, \n Click para reiniciar";
        stateText.visible = true;

        //Reiniciar el juego al hacer click
        juego.input.onTap.addOnce(restart, this);
    }
}

function colisionEnemi(nave, bala){

    bala.kill();

    vida = vidas.getFirstAlive();
    boom.play();

    if (vida)
    {
        vida.kill();
    }

    //Creamos la explosion
    var explosion = explosions.getFirstExists(false);
    explosion.reset(nave.body.x, nave.body.y);
    explosion.play("kaboom", 30, false, true);

    //Cuando el personaje muere
    if (vidas.countLiving() < 1)
    {
        nave.kill(); //Sirve para que la nave no aparezca cuando muere
        balasEnemi.callAll("kill");
        stateText.text= " Has perdido \n Click para reiniciar";
        stateText.visible = true;

        //Reinicia el juego al hacer click
        juego.input.onTap.addOnce(restart, this);
    }
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add("kaboom");

}

function restart () {

    //Comienza un nuevo nivel
    
    //Reinicia el conteo de vidas
    vidas.callAll("revive");

    //Se crean otra vez los enemigos
    enemigos.removeAll();
    createEnemigos();

    //Revivimos al jugador
    nave.revive();
    //Y ocultamos el texto
    stateText.visible = false;

}

function descender(){
    enemigos.y += 10;
}

juego.state.add("invaders", estadoPrincipal);
juego.state.start("invaders");