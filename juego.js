class Juego extends Phaser.Scene {
    constructor() {
        super("Juego");
    }

    create() {
        // ---------------- PANTALLA ----------------
        this.ancho = this.scale.width;
        this.alto = this.scale.height;

        // ---------------- FONDO (tileSprite) ----------------
        const imgWidth = 400;
        const imgHeight = 600;
        const baseScale = Math.max(this.ancho / imgWidth, this.alto / imgHeight);
        const extraZoom = 1.05;
        const finalScale = baseScale * extraZoom;
        this.bg = this.add.tileSprite(this.ancho / 2, this.alto, imgWidth, imgHeight, "fondo")
            .setOrigin(0.5, 1)
            .setScale(finalScale)
            .setDepth(-1);

        // ---------------- AVE ----------------
        this.bird = this.physics.add.sprite(Math.round(this.ancho * 0.28), this.alto / 2, "MID").setScale(1);
        this.bird.body.setGravityY(900);
        this.bird.body.setSize(Math.round(this.bird.width * 0.6), Math.round(this.bird.height * 0.6));
        this.bird.body.setOffset(Math.round((this.bird.displayWidth - this.bird.body.width) / 2), Math.round((this.bird.displayHeight - this.bird.body.height) / 2));

        // ---------------- GRUPOS ----------------
        this.pipes = this.physics.add.group();

        // ---------------- PUNTOS ----------------
        this.puntos = 0;
        this.textoPuntos = this.add.text(20, 20, "Puntos: 0", {
            fontSize: "32px",
            fill: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4
        });

        // ---------------- CONTROL ----------------
        this.input.on("pointerdown", this.saltar, this);
        this.input.keyboard.on("keydown-SPACE", this.saltar, this);

        // ---------------- VELOCIDAD CONTROLADA ----------------
        this.baseSpeed = -180;
        this.speedVariance = 10;
        this.minSpeed = -700;
        this.speedIncreaseStep = -40;
        this.lastSpeedIncreaseAt = 0;

        // ---------------- GENERADOR DE TUBOS ----------------
        this.time.addEvent({
            delay: 1400,
            callback: this.crearTubos,
            callbackScope: this,
            loop: true
        });

        // ---------------- COLISION ----------------
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);

        // ---------------- PALETA DE TINTS PARA PIPES ----------------
        this._pipePalette = [
            0xff4d4d,
            0xff8a65,
            0xffd166,
            0x9ad3bc,
            0x7fb3ff,
            0xd291ff
        ];
        this._pickPipeTint = () => {
            return this._pipePalette[Phaser.Math.Between(0, this._pipePalette.length - 1)];
        };

        // ---------------- OSCILACION ----------------
        this.pipeOscillation = {
            minDuration: 300,
            maxDuration: 800,
            minAmplitude: 100,
            maxAmplitude: 180
        };

        // inclinación del pájaro
        this._maxTilt = 30;
        this._tiltLerp = 0.12;
        this._jumpTilt = -20;
    }

    update(time, delta) {
        this.verificarCaida();
        this.verificarPuntos();

        // ---------------- MOVIMIENTO FONDO EN LOOP ----------------
        const scrollSpeed = Math.abs(this.baseSpeed) * 0.01;
        this.bg.tilePositionX += scrollSpeed * (delta / 16.6667);

        // texturas del ave según su velocidad
        const vy = this.bird.body.velocity.y;
        if (vy < -150) {
            if (this.bird.texture.key !== "UP") this.bird.setTexture("UP");
        } else if (vy > 150) {
            if (this.bird.texture.key !== "DOWN") this.bird.setTexture("DOWN");
        } else {
            if (this.bird.texture.key !== "MID") this.bird.setTexture("MID");
        }

        // inclinación suave
        const maxVyForTilt = 600;
        let targetAngle = Phaser.Math.Clamp((vy / maxVyForTilt) * this._maxTilt, -this._maxTilt, this._maxTilt);
        this.bird.angle = Phaser.Math.Linear(this.bird.angle, targetAngle, this._tiltLerp);

        // limpieza de pipes fuera de pantalla
        this.pipes.getChildren().forEach(pipe => {
            if (pipe.x + pipe.displayWidth < -50) pipe.destroy();
        });
    }

    saltar() {
        this.bird.setVelocityY(-350);
        this.bird.angle = this._jumpTilt;
    }

    verificarCaida() {
        if (this.bird.y > this.alto || this.bird.y < 0) {
            this.gameOver();
        }
    }

    verificarPuntos() {
        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getData("tipo") == "arriba") {
                const pipeCenterX = pipe.x + pipe.displayWidth / 2;
                if (pipeCenterX < this.bird.x && !pipe.getData("pasado")) {
                    pipe.setData("pasado", true);
                    this._incrementPoints(1);
                }
            }
        });
    }

    _incrementPoints(amount) {
        this.puntos += amount;
        this.textoPuntos.setText("Puntos: " + this.puntos);

        // aplicar tinte aleatorio al pájaro cada vez que gana 1 punto
        this._applyRandomTintToBird();

        // ejemplo: aumentar velocidad cada 50 puntos
        if (this.puntos % 50 === 0 && this.puntos !== this.lastSpeedIncreaseAt) {
            this.baseSpeed = Math.max(this.minSpeed, this.baseSpeed + this.speedIncreaseStep);
            this.lastSpeedIncreaseAt = this.puntos;
            this._actualizarVelocidadesExistentes();

            const aviso = this.add.text(this.ancho / 2, 120, "¡Velocidad aumentada!", {
                fontSize: "28px",
                fill: "#ffdddd",
                stroke: "#000000",
                strokeThickness: 4
            }).setOrigin(0.5);
            this.tweens.add({ targets: aviso, alpha: 0, duration: 1400, delay: 600, onComplete: () => aviso.destroy() });
        }
    }

    _applyRandomTintToBird() {
        const randColor = Phaser.Display.Color.RandomRGB();
        if (randColor && typeof randColor.color !== "undefined") {
            this.bird.setTint(randColor.color);
        } else {
            this.bird.clearTint();
        }
    }

    crearTubos() {
        const PIPE_W = 80;
        const PIPE_H = 400;
        const espacio = Math.round(Math.max(160, this.alto * 0.28));

        const minV = this.baseSpeed - this.speedVariance;
        const maxV = this.baseSpeed + this.speedVariance;
        const velocidad = Phaser.Math.Between(minV, maxV);

        const minCenterY = PIPE_H / 2 + espacio / 2;
        const maxCenterY = this.alto - PIPE_H / 2 - espacio / 2;
        const centerY = Phaser.Math.Between(Math.round(minCenterY), Math.round(maxCenterY));

        const topBottomY = centerY - espacio / 2;
        const bottomTopY = centerY + espacio / 2;
        const startX = this.ancho + PIPE_W / 2;

        let arriba = this.pipes.create(startX, topBottomY - PIPE_H, "pipe");
        arriba.setDisplaySize(PIPE_W, PIPE_H);
        arriba.setOrigin(0, 0);
        arriba.setFlipY(true);
        arriba.body.allowGravity = false;
        arriba.body.immovable = true;
        arriba.setVelocityX(velocidad);
        arriba.setData("tipo", "arriba");
        arriba.setData("pasado", false);
        arriba.body.setSize(Math.round(arriba.displayWidth), Math.round(arriba.displayHeight));
        arriba.body.setOffset(0, 0);

        let abajo = this.pipes.create(startX, bottomTopY, "pipe");
        abajo.setDisplaySize(PIPE_W, PIPE_H);
        abajo.setOrigin(0, 0);
        abajo.body.allowGravity = false;
        abajo.body.immovable = true;
        abajo.setVelocityX(velocidad);
        abajo.setData("tipo", "abajo");
        abajo.body.setSize(Math.round(abajo.displayWidth), Math.round(abajo.displayHeight));
        abajo.body.setOffset(0, 0);

        // aplicar tint a los pipes
        arriba.setTint(this._pickPipeTint());
        abajo.setTint(this._pickPipeTint());

        // Oscilación rápida y con amplitud variable (parámetros desde pipeOscillation)
        const maxAmplitude = Phaser.Math.Between(this.pipeOscillation.minAmplitude, this.pipeOscillation.maxAmplitude);
        const duration = Phaser.Math.Between(this.pipeOscillation.minDuration, this.pipeOscillation.maxDuration);
        const deltaY = Phaser.Math.Between(-maxAmplitude, maxAmplitude);

        this.tweens.add({
            targets: [arriba, abajo],
            y: "+=" + deltaY,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    // Actualiza la velocidad X de tubos existentes cuando cambia baseSpeed
    _actualizarVelocidadesExistentes() {
        const minV = this.baseSpeed - this.speedVariance;
        const maxV = this.baseSpeed + this.speedVariance;
        this.pipes.getChildren().forEach(pipe => {
            const newV = Phaser.Math.Between(minV, maxV);
            pipe.setVelocityX(newV);
        });
    }

    gameOver() {
        this.scene.start("GameOver", { puntos: this.puntos });
    }
}