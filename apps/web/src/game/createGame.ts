import Phaser from 'phaser'
import { OfficeScene } from './scenes/OfficeScene'
import type { GameFactory } from './runtime'

export const createGame: GameFactory = (parent, emit) => new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#b9d7db',
  scene: [new OfficeScene(emit)],
  scale: { mode: Phaser.Scale.RESIZE, width: 960, height: 540 },
  render: { antialias: true, pixelArt: false },
})
