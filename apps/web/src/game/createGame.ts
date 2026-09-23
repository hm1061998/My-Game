import Phaser from 'phaser'
import { FoundationScene } from './scenes/FoundationScene'
import type { GameFactory } from './runtime'

export const createGame: GameFactory = (parent) => new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  backgroundColor: '#202633',
  scene: [FoundationScene],
  scale: { mode: Phaser.Scale.RESIZE, width: 960, height: 540 },
  render: { antialias: true, pixelArt: false },
})
