import { iCard } from "../Interfaces/gameElements.interface";


export class Card extends Phaser.GameObjects.Sprite implements iCard {
    id: number = 0;
    isFlipped: boolean = false;
    isSwappable = true
    isFrozen: boolean = false
    scaleX = 0.5
    scaleY = 0.5
    picUrl: string = ''
    public flip1!: Phaser.Tweens.Timeline
    public flip2!: Phaser.Tweens.Timeline
    isAnimationPlaying: boolean = false

    constructor(config: {
        scene: Phaser.Scene; x: number; y: number, key: string; picFrame: string, scaleX?: number, scaleY?: number

    }) {

        super(config.scene, config.x, config.y, 'symbols', 'symbol_0.png');

        this.picUrl = config.picFrame
        this.scaleX = config.scaleX ?? 0.5
        this.scaleY = config.scaleY ?? 0.5
        this.setUpFlip1()
        this.setUpFlip2()


        this.setInteractive()
        this.on('pointerdown', function (this: Card, pointer: any) {

            if (this.isFlipped || this.isFrozen || this.isAnimationPlaying) return
            this.isFlipped = true
            this.emit('test', this)
            const state2 = this.flip1.state


            this.flip1.play()
            this.isAnimationPlaying = true
            this.setUpFlip1()
        });
        config.scene.add.existing(this);

    }

    setUpFlip1() {
        this.flip1 = this.scene.tweens.createTimeline({
            onComplete: (timeline) => {
                timeline.destroy()
            }
        },

        )

        this.flip1.add({
            pendingDelete: false,
            hasStarted: false,
            targets: this,
            scale: 0.6,
            onActive: () => {
            },
            onStart: () => {
                this.isAnimationPlaying = true
            },
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 300,
            onComplete: (tween) => {

            }
        })

        // flip anim 
        this.flip1.add({
            pendingDelete: false,
            hasStarted: false,
            targets: this,
            duration: 300,
            scaleX: 0,
            onComplete: (tween) => {

            }
        })
        this.flip1.add({
            pendingDelete: false,
            hasStarted: false,
            targets: this,
            duration: 300,
            scaleX: 0.5,
            scaleY: 0.5,
            onStart: () => {
                this.setFrame(this.picUrl)

            },
            onComplete: (tween) => {
                this.isAnimationPlaying = false
            }
        })
    }

    setUpFlip2() {
        this.flip2 = this.scene.tweens.createTimeline({
            onComplete: (timeline) => timeline.destroy()
        })

        this.flip2.add({
            targets: this,
            duration: 300,
            scaleX: 0,
            onStart: () => {
                this.isAnimationPlaying = true

            },
            onComplete: () => {
            }
        })

        this.flip2.add({
            targets: this,
            duration: 300,
            scaleX: 0.5,
            onStart: () => {
                this.isAnimationPlaying = true
                this.setFrame('symbol_0.png')

            },
            onComplete: () => {
                this.isAnimationPlaying = false
            }
        })
    }

    resetCard(isGeneralReset?: boolean) {
        this.setTint();
        this.isFlipped = false
        this.isSwappable = true
        this.isFrozen = false
        if (isGeneralReset) {
            this.setFrame('symbol_0.png')
        }
    }

    async playTimeLine(tweens: any[], delay: number) {
        for (let index = 0; index < tweens.length; index++) {


        }
    }

}

export class Button {
    PhaserPrototype!: Phaser.GameObjects.Text
    constructor(x: number, y: number, label: string, scene: Phaser.Scene, callback: Function, isVisible: boolean = true) {
        this.PhaserPrototype = scene.add.text(x, y, label)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#301D63' })
            .setVisible(isVisible)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => this.PhaserPrototype.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => this.PhaserPrototype.setStyle({ fill: '#FFF' }));
    }
}
