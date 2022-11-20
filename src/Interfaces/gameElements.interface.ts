

export interface iCard extends Phaser.GameObjects.Sprite {
id: number
isFlipped: boolean
isSwappable: boolean
isFrozen:boolean
picUrl:string
flip1: Phaser.Tweens.Timeline
flip2: Phaser.Tweens.Timeline
resetCard(isGeneral?:boolean): void
setUpFlip1(): void
setUpFlip2(): void

} 

export interface iBoard {
    x: number[]
    y: number[]
    bg:{
        x:number
        y:number
        scale: {
            x: number
            y: number
        }
    }
    cardScale?: {
        x:number
        y:number
    }
}

export interface iAlternatingText {
text: string
duration: number
font?:string
x?: number
y?: number
}