class GameOver extends Phaser.Scene{
    constructor(){
        super("GameOver");
    }

    create(data){
        const ancho = this.scale.width;
        const alto = this.scale.height;
        const fontScale = Math.max(16, Math.round(ancho * 0.04));
        const fontScaleLarge = Math.max(20, Math.round(ancho * 0.055));
        const fontScaleMedium = Math.max(18, Math.round(ancho * 0.05));

        this.add.image(ancho / 2, alto / 2, "fondo")
            .setDisplaySize(this.scale.width, this.scale.height);

        this.add.text(ancho / 2, alto * 0.28, "Relajate el fracaso es parte del camino", {
            fontSize: `${fontScale}px`,
            color: "#000000",
            fontStyle: "bold",
            stroke: "#0084ff",
            strokeThickness: 6,
            align: "center",
            backgroundColor: "rgba(255, 255, 255, 0)"
        }).setOrigin(0.5);

        const puntos = (data && typeof data.puntos === "number") ? data.puntos : 0;


        this.add.text(ancho / 2, alto * 0.48, "Puntos: " + puntos, {
            fontSize: `${fontScaleLarge}px`,
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#ff0000",
            strokeThickness: 6,
            backgroundColor: "rgba(0, 0, 0, 0)"
        }).setOrigin(0.5);

        const reintentarText = this.add.text(ancho / 2, alto * 0.78, "Reintentar", {
            fontSize: `${fontScaleMedium}px`,
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#ff0000",
            strokeThickness: 6,
            align: "center",
            backgroundColor: "rgba(255, 255, 255, 0)"
        }).setOrigin(0.5);

        reintentarText.setInteractive({ useHandCursor: true });
        reintentarText.on("pointerdown", () => {
            this.scene.start("Juego");
        });

        // también permitir tocar en cualquier parte para reiniciar (comportamiento previo)
        this.input.once("pointerdown", () => {
            this.scene.start("Juego");
        });
    }
}