import Phaser from 'phaser'
import { OfficeScene } from './scenes/OfficeScene'
import type { GameFactory } from './runtime'
import { COLOR } from '../theme/tokens'

export const createGame: GameFactory = (parent, emit) => {
  const scene = new OfficeScene(emit)
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: COLOR.paper,
    scene: [scene],
    scale: { mode: Phaser.Scale.RESIZE, width: 960, height: 540 },
    render: { antialias: true, pixelArt: false },
    audio: { noAudio: true },
  })
  return {
    destroy: (removeCanvas) => game.destroy(removeCanvas),
    setInteractions: (interactions) => scene.setInteractions(interactions),
    setOverlayPaused: (paused) => scene.setOverlayPaused(paused),
    setWorldState: (state) => scene.setWorldState(state.checkpointId,
      state.encounterCleared, state.assistEnabled),
  }
}
