class Inicio extends Phaser.Scene{
    constructor(){
        super("Inicio");
    }

    preload(){
        // cargo imágenes y demás assets
        this.load.image("fondo","Fondo.png");
        this.load.image("UP","F1.png");
        this.load.image("MID","F2.png");
        this.load.image("DOWN","F3.png");
        this.load.image("pipe","pipe.png");

        
        // ---------------- MÚSICA ----------------
        this.load.audio("music", "Light_it_Up.mp3");
    }

    create(){
        // ACTIVIDAD:
        // Cambiar estas posiciones fijas para que se adapten al tamaño del celular
        // usando this.scale.width y this.scale.height

        this.add.image(this.scale.width / 2,this.scale.height / 2 ,"fondo")
            .setDisplaySize(this.scale.width,this.scale.height);

        this.add.text(this.scale.width / 2, this.scale.height * 0.22, "Flappy the Happy",{
            fontSize: Math.max(18, Math.round(this.scale.width * 0.06)) + "px",
            fill:"#ffffff",
            fontStyle: "bold",
            stroke: "#5c76de",
            align: 'center',
            strokeThickness: 6,
            backgroundColor: "rgba(0, 0, 0, 0)"
        }).setOrigin(0.5);

        let boton = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + (this.scale.height * 0.12),
            "Play",
            {
                fontSize: Math.max(20, Math.round(this.scale.width * 0.08)) + "px",
                color: "#ffffff",
                backgroundColor: "rgba(0, 0, 0, 0)",
                stroke: "#5c76de",
                fontStyle: "bold",
                strokeThickness: 6,
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);

        boton.setInteractive();
        boton.on("pointerdown", () => {
            this.scene.start("Juego");
        });

        // ---------------- REPRODUCIR MÚSICA ----------------
        try {
            this.sound.play("music", { loop: true, volume: 0.5 });
        } catch (e) {
        }

        const resumeAudio = () => {
            if (!this.sound.locked) {
                this.input.off('pointerdown', resumeAudio);
                return;
            }
            this.sound.resumeAll();
            if (!this.sound.get('music')) {
                this.sound.play("music", { loop: true, volume: 0.5 });
            } else {
                const m = this.sound.get('music');
                if (m && !m.isPlaying) m.play();
            }
            this.input.off('pointerdown', resumeAudio);
        };

        this.input.on('pointerdown', resumeAudio);
    }
}