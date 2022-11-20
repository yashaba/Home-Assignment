// You can write more code here
import { Card, Button } from "../Classes/gameElements.js";
import { iCard, iBoard, iAlternatingText } from "../Interfaces/gameElements.interface";
// / <reference path="../../node_modules/phaser/types/phaser.d.ts"/>
/* START OF COMPILED CODE */

export default class MainScene extends Phaser.Scene {
	private centerH = window.innerHeight / 2
	private centerW = window.innerWidth / 2
	private gridMapSmall: iBoard = {
		x: [this.centerW - 194, this.centerW - 4, this.centerW + 186],
		y: [this.centerH - 233, this.centerH - 108, this.centerH + 22, this.centerH + 152],
		bg: { x: this.centerW, y: this.centerH, scale: { x: 0.6, y: 0.6 } }
	};
	private gridMapMedium: iBoard = {
		x: [this.centerW - 284, this.centerW - 94, this.centerW + 96, this.centerW + 286],
		y: [this.centerH - 233, this.centerH - 108, this.centerH + 22, this.centerH + 152],
		bg: { x: this.centerW, y: this.centerH, scale: { x: 0.8, y: 0.6 } }

	};
	private gridMapBig: iBoard = {
		x: [this.centerW - 476, this.centerW - 286, this.centerW - 96, this.centerW + 94, this.centerW + 284, this.centerW + 474],
		y: [this.centerH - 390 + 70, this.centerH - 260 + 70, this.centerH - 130 + 70, this.centerH + 70, this.centerH + 130 + 70, this.centerH + 260 + 70],
		bg: { x: this.centerW, y: this.centerH + 70, scale: { x: 1.2, y: 0.9 } }

	};

	
	//Game Setup
	private selectedMap!: iBoard
	private symbols_layer!: Phaser.GameObjects.Layer | undefined;
	private bg!: Phaser.GameObjects.Image | undefined;
	private cards: iCard[] = [];
	private cardFrames: string[] = []
	private baseCardFrames: string[] = ['symbol_1.png', 'symbol_2.png', 'symbol_3.png', 'symbol_4.png', 'symbol_5.png', 'symbol_6.png'];
	private alternatingText = {
		playerMatch: {
			text: 'Nice!',
			duration: 2,
		},
		playerFail: {
			text: 'Try again',
			duration: 2,
		},
		playerWin: {
			text: 'You won!',
			duration: 2
		},
		playerLoss: {
			text: 'Game Over',
			duration: 2
		},
		gameStart: {
			text: 'Start!',
			duration: 2
		},

	}

	//Game State
	private clickedCard1: iCard | undefined
	private clickedCard2: iCard | undefined
	private matchCount: number = 0
	private remainingMoves!: number
	private remainingMovesText!: Phaser.GameObjects.Text;
	private isPaused: boolean = false
	private playerFeedBackText!: Phaser.GameObjects.Text;
	private retryButton!: Button;
	private smallLayoutGame!: Button;
	private mediumLayoutGame!: Button;
	private bigLayoutGame!: Button;


	constructor() {
		super("MainScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	//Game Creation ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	create() {
		this.input.mouse.disableContextMenu();
		this.editorCreate('small');
		this.game.events.emit("GameCreated");
	}

	destroyGame() {
		this.bg?.destroy()
		this.symbols_layer!.removeAll()
		this.symbols_layer!.destroy()
		this.symbols_layer = undefined
	}

	editorCreate(mapType: string, isLevelChange?: boolean): void {
		this.selectedMap = mapType === 'small' ? this.gridMapSmall : mapType === 'medium' ? this.gridMapMedium : this.gridMapBig
		this.bg = this.add.image(this.selectedMap.bg.x, this.selectedMap.bg.y, "bg");
		this.symbols_layer = this.add.layer()

		if (!isLevelChange) {
			this.playerFeedBackText = this.add.text(550, 40, this.alternatingText.gameStart.text, { fontFamily: 'Walkway Condensed,sans-serif', fontSize: '1.5rem' })
			this.showTemporaryText(this.playerFeedBackText, this.alternatingText.gameStart.text, false)
			this.events.emit("scene-awake");
			this.remainingMovesText = this.add.text(60, 20, `Remaining moves:${this.remainingMoves}`, { fontFamily: 'Walkway Condensed,sans-serif', fontSize: '2.5rem' })
			this.remainingMovesText.setDepth(1)
			this.retryButton = new Button(this.centerW, this.centerH, 'Play Again', this, () => {
				this.resetGame()
			}, false)
			this.playerFeedBackText.setDepth(1)
			this.retryButton.PhaserPrototype.setDepth(1).setScale(1.5, 1.5)

			this.smallLayoutGame = new Button(this.centerW - 200, 45, 'Small 3 x 4', this, () => {
				this.resetGame()
				this.destroyGame()
				this.editorCreate('small', true)
			})
			this.smallLayoutGame.PhaserPrototype.setDepth(1)

			this.mediumLayoutGame = new Button(this.centerW, 45, 'Medium 4 x 4', this, () => {
				this.resetGame()
				this.destroyGame()
				this.editorCreate('medium', true)
			})
			this.mediumLayoutGame.PhaserPrototype.setDepth(1)

			this.bigLayoutGame = new Button(this.centerW + 200, 45, 'Big 6 x 6', this, () => {
				this.resetGame()
				this.destroyGame()
				this.editorCreate('big', true)
			})
			this.bigLayoutGame.PhaserPrototype.setDepth(1)
		}

		this.cardFrames = this.baseCardFrames
		this.remainingMoves = (this.selectedMap.x.length * this.selectedMap.y.length) / 2


		this.bg.scaleX = this.selectedMap.bg.scale.x;
		this.bg.scaleY = this.selectedMap.bg.scale.y;



		this.setRandomImgArray('symbol', 'png')
		this.cardFrames = this.shuffleArray(this.createFramePairs(this.cardFrames))
		this.cards = this.createGameBoard(this.selectedMap.x.length, this.selectedMap.y.length, this.selectedMap)
		this.cards.forEach((card) => {
			card.on('test', (cardClicked: iCard) => {
				this.handleClick(cardClicked)
			})
			this.symbols_layer!.add(card);
		})
		this.revealAllCards(this.cards)
	}

	createFramePairs(frames: string[]) {
		const cardFramePairs = frames.flatMap((frame => [frame, frame]))
		return cardFramePairs
	}

	setRandomImgArray(imgName: string, imgType: string) {
		const numOfArray: number = this.calcNeededCardFrames()
		const numOfType: number = this.cardFrames.length
		const randomArray = [];
		for (let i = 0; i < numOfArray; i++) {
			const img = `${imgName}_${this.getRandomInt(numOfType)}.${imgType}`
			randomArray.push(img)
		}
		this.cardFrames = [...this.cardFrames, ...randomArray]
		return randomArray;
	}

	//Calculate amount of card frames to generate
	calcNeededCardFrames(): number {
		const singleCardsAmount: number = (this.selectedMap.x.length * this.selectedMap.y.length) / 2
		const extraCardFramesToGen = singleCardsAmount - this.cardFrames.length
		return extraCardFramesToGen
	}

	createGameBoard(xAxisSize: number, yAxisSize: number, boardInfo: iBoard): iCard[] {
		const cardArr: iCard[] = []
		let currFrameIdx = 0
		for (let i = 0; i < xAxisSize; i++) {
			for (let j = 0; j < yAxisSize; j++) {
				const cardConfig = { scene: this, x: this.selectedMap.x[i], y: this.selectedMap.y[j], key: "symbols", picFrame: this.cardFrames[currFrameIdx] }
				const currCard = new Card(cardConfig)
				cardArr.push(currCard)
				currFrameIdx++
			}
		}
		return cardArr
	}
	//Game Creation END ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



	//Game Mechanics ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
	//Attempts to swap locations of two random cards
	async swapCards() {
		const aviableCards = this.cards.filter(card => !card.isFlipped && card.isSwappable)
		if (!aviableCards.length) return


		const targetCardToSwap = aviableCards[Phaser.Math.Between(0, aviableCards.length - 1)]
		try {


			const { x: targetCardX, y: targetCardY } = JSON.parse(JSON.stringify(targetCardToSwap))

			const neighboringCards = this.findNeighbors(targetCardX, targetCardY, aviableCards)
			if (neighboringCards.length) {
				const randomNeighbor = neighboringCards[Phaser.Math.Between(0, neighboringCards.length - 1)]
				const { x: randomNeighborX, y: randomNeighborY } = JSON.parse(JSON.stringify(randomNeighbor))


				while ((randomNeighbor.x <= targetCardX && randomNeighbor.x >= targetCardX) || (randomNeighbor.y !== targetCardY) || (targetCardToSwap.x <= randomNeighborX + 2 && targetCardToSwap.x >= randomNeighborX - 2) || (targetCardToSwap.y !== randomNeighborY)) {
					await this.delay(10)
					if (randomNeighbor.x > targetCardX) {
						randomNeighbor.x -= 7
					} else if (randomNeighbor.x < targetCardX) {
						randomNeighbor.x += 7

					}
					if (randomNeighbor.y > targetCardY) {
						randomNeighbor.y -= 5
					} else if (randomNeighbor.y < targetCardY) {
						randomNeighbor.y += 5

					}
					if (targetCardToSwap.x > randomNeighborX) {

						targetCardToSwap.x -= 7
					} else if (targetCardToSwap.x < randomNeighborX) {
						targetCardToSwap.x += 7

					}
					if (targetCardToSwap.y > randomNeighborY) {
						targetCardToSwap.y -= 5
					} else if (targetCardToSwap.y < randomNeighborY) {
						targetCardToSwap.y += 5

					}
				}
				randomNeighbor.x = targetCardX
				randomNeighbor.y = targetCardY
				targetCardToSwap.x = randomNeighborX
				targetCardToSwap.y = randomNeighborY
			} else {
				targetCardToSwap.isSwappable = false
				this.swapCards()
			}
		}
		catch (error) {

		}

	}

	revealCard(card:iCard){
		card.flip1.play()
		card.setUpFlip1()

		setTimeout(()=>{
			card.flip2.play()
		card.setUpFlip2()
		},3000)
	}

	async revealAllCards(card:iCard[]){
	for (let i = 0; i < card.length; i++) {
		const currCard = card[i];
		await this.delay(50)
		this.revealCard(currCard)
	}
	}

	async checkMatch(selectedCards: iCard[]) {
		const isMatch = selectedCards[0].picUrl === selectedCards[1].picUrl
		await this.delay(1000)

		if (isMatch) {
			this.handleMatch()
		} else {
			this.remainingMoves--
			this.handleMissMatch(selectedCards)
			if (this.remainingMoves <= 0) {
				await this.delay(500)
				this.handleLoss()
				return
			}
		}
	}

    //Freezes all cards to prevent them from being clicked
	toggleFreeze(isFrozen: boolean) {
		this.cards.forEach(card => card.isFrozen = isFrozen)
	}

    //Resets currently selected cards
	resetClickedCards() {
		this.clickedCard1 = undefined
		this.clickedCard2 = undefined
	}
    

	handleWin() {
		this.showTemporaryText(this.playerFeedBackText, this.alternatingText.playerWin.text, true, 2000)
		this.toggleFreeze(true)
		this.isPaused = true
		this.retryButton.PhaserPrototype.setVisible(true)
	}

	resetGame() {
		this.resetClickedCards()
		const sequense = this.shuffleArray(this.createCoordsSequense())
		this.cards.forEach((card, idx) => {
			card.resetCard(true)
			card.x = sequense[idx][0]
			card.y = sequense[idx][1]

		})
		this.remainingMoves = (this.selectedMap.x.length * this.selectedMap.y.length) / 2
		this.matchCount = 0
		this.isPaused = false
		this.retryButton.PhaserPrototype.setVisible(false)
		this.revealAllCards(this.cards)
	}
    
	//Created an array of all the possible location combination
	createCoordsSequense() {
		let sequense: number[][] = []
		for (let i = 0; i < this.selectedMap.x.length; i++) {
			for (let j = 0; j < this.selectedMap.y.length; j++) {
				sequense = [...sequense, [this.selectedMap.x[i], this.selectedMap.y[j]]]
			}

		}

		return sequense
	}

	handleLoss() {

		this.showTemporaryText(this.playerFeedBackText, this.alternatingText.playerLoss.text, true, 2000)
		this.toggleFreeze(true)
		this.isPaused = true
		this.retryButton.PhaserPrototype.setVisible(true)
	}

	handleMatch() {
		// this.
		this.matchCount++
		this.showTemporaryText(this.playerFeedBackText, this.alternatingText.playerMatch.text, false)
		this.resetClickedCards()

		if (this.matchCount === this.cardFrames.length / 2) {
			this.handleWin()
			return
		}
		this.swapCards()
	}

	handleMissMatch(selectedCards: iCard[]) {
		selectedCards.forEach((card) => {
			card.resetCard()
			card.flip2.play()
			card.setUpFlip2()
		})
		this.resetClickedCards()
		this.showTemporaryText(this.playerFeedBackText, this.alternatingText.playerFail.text, false)
	}

	handleClick(card: iCard) {
		if (this.isPaused) return
		if (!this.clickedCard1) {
			this.clickedCard1 = card
			return
		} else if (!this.clickedCard2) {
			this.toggleFreeze(true)
			this.clickedCard2 = card
			this.checkMatch([this.clickedCard1, this.clickedCard2])
		}

	}

	//Game Mechanics END------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




	//Helper Functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 

	//Helps to stop interupting animations
	delay(delay: number) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(null)
			}, delay)
		})
	}
    
	//Generic text displayer
	showTemporaryText(textGameObj: Phaser.GameObjects.Text, text: string, isGameOver: boolean, duration: number = 500) {
		this.isPaused = true
		this.toggleFreeze(true)
		textGameObj.setText(text)
		textGameObj.visible = true

		if (!isGameOver) {
			setTimeout(() => {
				this.isPaused = false
				this.toggleFreeze(false)
				textGameObj.visible = false
				textGameObj.setText('')

			}, duration)
		}
	}
  
	getRandomInt(max: number, min: number = 1) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
    
	//Finds the neighboring cards of the first card to be swapped
	findNeighbors(x: number, y: number, aviableCards: iCard[]) {
		const xIdx = this.selectedMap.x.indexOf(x)
		const yIdx = this.selectedMap.y.indexOf(y)

		const xNeighbors = [this.selectedMap.x[xIdx - 1], this.selectedMap.x[xIdx], this.selectedMap.x[xIdx + 1]]
		const yNeighbors = [this.selectedMap.y[yIdx - 1], this.selectedMap.y[yIdx], this.selectedMap.y[yIdx + 1]]

		const neighbors = aviableCards.filter(card => {
			return (xNeighbors.includes(card.x) && yNeighbors.includes(card.y) && (card.x !== x && card.y !== y))
		})
		return neighbors
	}

	shuffleArray(shuffleArray: any[]) {
		for (let i = shuffleArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
		}
		return shuffleArray
	}


	// Phaser Base Methods


	preload() {
		this.load.pack("pack", './Assets/game_pack_sd.json');
	}

	update(time: number, delta: number): void {
		this.remainingMovesText.setText(`Remaining Moves: ${this.remainingMoves}`)
	}

}
