import Phaser from 'phaser'
import type { GameLifecycleEvent, WorldInteraction } from '../bridge/events'
import { moveWithCollision, movementDelta, type Point, type Rect } from '../movement'
import { advancePatrol, CHECKPOINT, DODGE_COOLDOWN_MS, DODGE_DURATION_MS,
  reachedCheckpoint, SCANNER_MIN_X, SCANNER_RADIUS, SCANNER_Y, scannerDetects } from '../encounter'
import { COLOR, FONT, prefersReducedMotion } from '../../theme/tokens'
import { characterStyle, evidenceStyle, interactionLabel, movementPose, OFFICE_PALETTE,
  type CharacterStyle } from '../presentation'

declare global {
  interface Window {
    __officeCaseFilesE2E?: { snapshot: () => {
      position: Point; paused: boolean; overlayPaused: boolean; nearestId: string | null
      checkpointId: string; encounterCleared: boolean; dodgeRemainingMs: number
    } }
  }
}

const WORLD_WIDTH = 1600
const WORLD_HEIGHT = 1000
const FLOOR: Rect = { x: 64, y: 142, width: 1472, height: 796 }
const DESK: Rect = { x: 490, y: 375, width: 250, height: 86 }
const CABINET: Rect = { x: 1015, y: 270, width: 120, height: 210 }
const PLANTER: Rect = { x: 815, y: 715, width: 130, height: 70 }
const MEETING_TABLE: Rect = { x: 1190, y: 620, width: 225, height: 106 }
const OBSTACLES = [DESK, CABINET, PLANTER, MEETING_TABLE]

type MovementKeys = {
  w: Phaser.Input.Keyboard.Key
  a: Phaser.Input.Keyboard.Key
  s: Phaser.Input.Keyboard.Key
  d: Phaser.Input.Keyboard.Key
  up: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
  shift: Phaser.Input.Keyboard.Key
}

export class OfficeScene extends Phaser.Scene {
  private readonly emit: (event: GameLifecycleEvent) => void
  private position: Point = { x: 260, y: 645 }
  private player?: Phaser.GameObjects.Container
  private playerFigure?: Phaser.GameObjects.Container
  private shadow?: Phaser.GameObjects.Ellipse
  private leftLeg?: Phaser.GameObjects.Rectangle
  private rightLeg?: Phaser.GameObjects.Rectangle
  private playerFacing: -1 | 1 = 1
  private keys?: MovementKeys
  private pauseLabel?: Phaser.GameObjects.Text
  private paused = false
  private overlayPaused = false
  private interactions: WorldInteraction[] = []
  private markers: Phaser.GameObjects.Container[] = []
  private nearestId: string | null = null
  private checkpointId = 'office-entry'
  private encounterCleared = false
  private assistEnabled = false
  private worldInitialized = false
  private checkpointSignalCooldown = 0
  private scannerX = SCANNER_MIN_X
  private scannerDirection: -1 | 1 = 1
  private scanner?: Phaser.GameObjects.Container
  private checkpointMarker?: Phaser.GameObjects.Container
  private dodgeLabel?: Phaser.GameObjects.Text
  private dodgeRemainingMs = 0
  private dodgeCooldownMs = 0
  private detectionGraceMs = 0
  private lastMoveDirection: Point = { x: 1, y: 0 }
  private dodgeDirection: Point = { x: 1, y: 0 }

  constructor(emit: (event: GameLifecycleEvent) => void) {
    super('office')
    this.emit = emit
  }

  create() {
    this.cameras.main.setBackgroundColor('#a8cbd0')
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.drawOffice()
    this.drawFurniture()
    this.createPlayer()
    this.drawEncounter()
    this.renderInteractions()

    const keyboard = this.input.keyboard
    if (!keyboard) throw new Error('Keyboard input is required for desktop gameplay')
    this.keys = keyboard.addKeys({
      w: 'W', a: 'A', s: 'S', d: 'D',
      up: 'UP', left: 'LEFT', down: 'DOWN', right: 'RIGHT',
      shift: 'SHIFT',
    }, true) as MovementKeys
    keyboard.on('keydown-ESC', this.togglePause)
    keyboard.on('keydown-E', this.tryInteract)
    keyboard.on('keydown-SPACE', this.tryDodge)

    this.pauseLabel = this.add.text(22, 58, 'TẠM DỪNG  ·  ESC để tiếp tục', {
      color: COLOR.ink, backgroundColor: COLOR.paperLight, fontFamily: FONT.ui,
      fontSize: '18px', fontStyle: 'bold', padding: { x: 14, y: 10 },
    }).setScrollFactor(0).setDepth(10000).setOrigin(0, 1).setVisible(false)
    this.dodgeLabel = this.add.text(22, 15, 'SPACE · Né sẵn sàng', {
      color: COLOR.ink, backgroundColor: COLOR.paperLight, fontFamily: FONT.ui,
      fontSize: '15px', padding: { x: 10, y: 7 },
    }).setScrollFactor(0).setDepth(10000).setOrigin(0, 1)
    this.positionCanvasLabels()
    this.scale.on(Phaser.Scale.Events.RESIZE, this.positionCanvasLabels)

    const lerp = prefersReducedMotion() ? 1 : 0.12
    this.cameras.main.startFollow(this.player!, true, lerp, lerp)
    this.cameras.main.setDeadzone(80, 60)
    if (import.meta.env.VITE_E2E_OBSERVABILITY === '1') {
      window.__officeCaseFilesE2E = { snapshot: () => ({
        position: { ...this.position }, paused: this.paused, overlayPaused: this.overlayPaused,
        nearestId: this.nearestId, checkpointId: this.checkpointId,
        encounterCleared: this.encounterCleared, dodgeRemainingMs: this.dodgeRemainingMs,
      }) }
    }
    this.emit({ type: 'play-state', state: 'playing' })

    window.addEventListener('blur', this.pauseForFocusLoss)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('blur', this.pauseForFocusLoss)
      document.removeEventListener('visibilitychange', this.onVisibilityChange)
      keyboard.off('keydown-ESC', this.togglePause)
      keyboard.off('keydown-E', this.tryInteract)
      keyboard.off('keydown-SPACE', this.tryDodge)
      this.scale.off(Phaser.Scale.Events.RESIZE, this.positionCanvasLabels)
      keyboard.resetKeys()
      if (import.meta.env.VITE_E2E_OBSERVABILITY === '1') {
        delete window.__officeCaseFilesE2E
      }
    })
  }

  update(_time: number, delta: number) {
    const keys = this.keys
    if (!keys) return

    if (this.paused || this.overlayPaused) return

    this.dodgeRemainingMs = Math.max(0, this.dodgeRemainingMs - delta)
    this.dodgeCooldownMs = Math.max(0, this.dodgeCooldownMs - delta)
    this.detectionGraceMs = Math.max(0, this.detectionGraceMs - delta)
    this.checkpointSignalCooldown = Math.max(0, this.checkpointSignalCooldown - delta)
    this.dodgeLabel?.setText(this.dodgeRemainingMs > 0 ? 'SPACE · Đang né' :
      this.dodgeCooldownMs > 0 ? `SPACE · Hồi ${Math.ceil(this.dodgeCooldownMs / 1000)}s` : 'SPACE · Né sẵn sàng')

    const input = {
      x: Number(keys.d.isDown || keys.right.isDown) - Number(keys.a.isDown || keys.left.isDown),
      y: Number(keys.s.isDown || keys.down.isDown) - Number(keys.w.isDown || keys.up.isDown),
    }
    const movement = this.dodgeRemainingMs > 0
      ? { x: this.dodgeDirection.x * 510 * Math.min(delta, 50) / 1000,
          y: this.dodgeDirection.y * 510 * Math.min(delta, 50) / 1000 }
      : movementDelta(input, delta, keys.shift.isDown)
    const pose = movementPose(input, _time, this.dodgeRemainingMs > 0, this.playerFacing)
    this.playerFacing = pose.facing
    this.playerFigure?.setY(pose.bob).setScale(pose.facing, 1).setRotation(pose.tilt)
    this.leftLeg?.setRotation(pose.stride)
    this.rightLeg?.setRotation(-pose.stride)
    this.shadow?.setScale(pose.shadowScale, 1)
    if (this.dodgeRemainingMs === 0 && (input.x !== 0 || input.y !== 0)) {
      const length = Math.hypot(input.x, input.y)
      this.lastMoveDirection = { x: input.x / length, y: input.y / length }
    }
    this.position = moveWithCollision(this.position, movement, FLOOR, OBSTACLES)
    this.player?.setPosition(this.position.x, this.position.y).setDepth(this.position.y)
    this.shadow?.setPosition(this.position.x, this.position.y + 1).setDepth(this.position.y - 1)
    this.updateNearby()

    if (this.checkpointId === 'office-entry' && reachedCheckpoint(this.position) &&
        this.checkpointSignalCooldown === 0) {
      this.checkpointSignalCooldown = 2000
      this.emit({ type: 'checkpoint-reached' })
    }
    if (this.checkpointId === 'meeting-zone' && !this.encounterCleared) {
      const patrol = advancePatrol(this.scannerX, this.scannerDirection, delta, this.assistEnabled)
      this.scannerX = patrol.x
      this.scannerDirection = patrol.direction
      this.scanner?.setPosition(this.scannerX, SCANNER_Y)
      if (this.detectionGraceMs === 0 && scannerDetects(this.position,
          this.scannerX, this.dodgeRemainingMs > 0)) {
        this.detectionGraceMs = 1800
        this.position = { ...CHECKPOINT }
        this.player?.setPosition(this.position.x, this.position.y).setDepth(this.position.y)
        this.shadow?.setPosition(this.position.x, this.position.y + 1).setDepth(this.position.y - 1)
        this.updateNearby()
        this.emit({ type: 'encounter-detected' })
      }
    }
  }

  setWorldState(checkpointId: string, encounterCleared: boolean, assistEnabled: boolean) {
    if (!this.worldInitialized && checkpointId === 'meeting-zone') {
      this.position = { ...CHECKPOINT }
      this.player?.setPosition(this.position.x, this.position.y).setDepth(this.position.y)
      this.shadow?.setPosition(this.position.x, this.position.y + 1).setDepth(this.position.y - 1)
    }
    this.worldInitialized = true
    this.checkpointId = checkpointId
    this.encounterCleared = encounterCleared
    this.assistEnabled = assistEnabled
    this.checkpointMarker?.setVisible(checkpointId === 'office-entry')
    this.scanner?.setVisible(checkpointId === 'meeting-zone' && !encounterCleared)
  }

  setInteractions(interactions: WorldInteraction[]) {
    this.interactions = interactions
    if (this.sys.isActive()) this.renderInteractions()
  }

  setOverlayPaused(paused: boolean) {
    this.overlayPaused = paused
    this.input?.keyboard?.resetKeys()
  }

  private renderInteractions() {
    this.markers.forEach(marker => marker.destroy())
    this.markers = this.interactions.map(interaction => {
      const marker = this.add.container(interaction.x, interaction.y).setDepth(interaction.y - 2)
      marker.add(this.add.ellipse(0, 2, interaction.kind === 'npc' ? 62 : 54, 19,
        OFFICE_PALETTE.ink, 0.2))
      if (interaction.kind === 'npc') {
        const npcId = interaction.id.replace('npc-', '')
        marker.add(this.createCharacterFigure(characterStyle(npcId), 0.82))
      } else {
        const style = evidenceStyle(interaction.id)
        marker.add([
          this.add.rectangle(0, -27, 38, 34, style.color).setStrokeStyle(3, OFFICE_PALETTE.cream),
          this.add.text(0, -29, style.symbol, { color: '#17333d', fontFamily: FONT.display,
            fontSize: '22px', fontStyle: 'bold' }).setOrigin(0.5),
        ])
      }
      marker.add(this.add.text(0, interaction.kind === 'npc' ? -112 : -62,
        interactionLabel(interaction.id, interaction.labelVi), {
          color: COLOR.ink, backgroundColor: COLOR.paperLight, fontFamily: FONT.ui,
          fontSize: '13px', fontStyle: 'bold', padding: { x: 7, y: 4 },
        }).setOrigin(0.5).setStroke('#fff8e9', 1))
      return marker
    })
    this.updateNearby()
  }

  private updateNearby() {
    const nearest = this.interactions
      .filter(item => Math.hypot(this.position.x - item.x, this.position.y - item.y) <= item.radius)
      .sort((a, b) => Math.hypot(this.position.x - a.x, this.position.y - a.y) -
        Math.hypot(this.position.x - b.x, this.position.y - b.y))[0] ?? null
    if (nearest?.id === this.nearestId || (!nearest && !this.nearestId)) return
    this.nearestId = nearest?.id ?? null
    this.emit({ type: 'interaction-nearby', interaction: nearest })
  }

  private readonly tryInteract = (event: KeyboardEvent) => {
    if (event.repeat || this.paused || this.overlayPaused || !this.nearestId) return
    if (this.nearestId === 'archive-terminal' && !this.encounterCleared) {
      this.emit({ type: this.checkpointId === 'meeting-zone' ?
        'encounter-cleared' : 'encounter-checkpoint-required' })
      return
    }
    this.emit({ type: 'interaction-requested', interactionId: this.nearestId })
  }

  private readonly tryDodge = (event: KeyboardEvent) => {
    if (event.repeat || this.paused || this.overlayPaused || this.dodgeCooldownMs > 0) return
    this.dodgeDirection = this.lastMoveDirection
    this.dodgeRemainingMs = DODGE_DURATION_MS
    this.dodgeCooldownMs = DODGE_COOLDOWN_MS
    this.input.keyboard?.resetKeys()
  }

  private drawEncounter() {
    this.checkpointMarker = this.add.container(CHECKPOINT.x, CHECKPOINT.y).setDepth(CHECKPOINT.y - 2)
    this.checkpointMarker.add([
      this.add.ellipse(0, 0, 112, 55, 0x4dbb91, 0.33).setStrokeStyle(2, 0x23866b),
      this.add.text(0, -45, 'MỐC AN TOÀN', { color: '#17333d', backgroundColor: '#e5fff2',
        fontFamily: FONT.ui, fontSize: '15px', padding: { x: 5, y: 3 } }).setOrigin(0.5),
    ])
    this.checkpointMarker.setVisible(this.checkpointId === 'office-entry')
    this.add.rectangle(1360, SCANNER_Y, 330, 180, 0xf4c682, 0.12)
      .setStrokeStyle(2, 0xb67e45, 0.65).setDepth(SCANNER_Y - 5)
    this.scanner = this.add.container(this.scannerX, SCANNER_Y).setDepth(SCANNER_Y)
    this.scanner.add([
      this.add.circle(0, 0, SCANNER_RADIUS, 0xf08a65, 0.19).setStrokeStyle(3, 0xd65d4c, 0.7),
      this.add.circle(0, -26, 21, 0x355f75).setStrokeStyle(4, 0xe9d4a5),
      this.add.circle(0, -26, 8, 0xf7d07b),
      this.add.text(0, -61, 'MÁY QUÉT', { color: '#6f2b22', backgroundColor: '#fff1db',
        fontFamily: FONT.ui, fontSize: '14px', padding: { x: 5, y: 3 } }).setOrigin(0.5),
    ])
    this.scanner.setVisible(this.checkpointId === 'meeting-zone' && !this.encounterCleared)
  }

  private readonly pauseForFocusLoss = () => {
    this.setPaused(true)
    this.input.keyboard?.resetKeys()
  }

  private readonly togglePause = (event: KeyboardEvent) => {
    if (event.repeat || this.overlayPaused) return
    this.setPaused(!this.paused)
    this.input.keyboard?.resetKeys()
  }

  private readonly onVisibilityChange = () => {
    if (document.hidden) this.pauseForFocusLoss()
  }

  private setPaused(paused: boolean) {
    if (this.paused === paused) return
    this.paused = paused
    this.pauseLabel?.setVisible(paused)
    this.emit({ type: 'play-state', state: paused ? 'paused' : 'playing' })
  }

  private readonly positionCanvasLabels = () => {
    this.dodgeLabel?.setPosition(18, this.scale.height - 16)
    this.pauseLabel?.setPosition(18, this.scale.height - 58)
  }

  private drawOffice() {
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0xa8cbd0).setDepth(-100)
    this.add.rectangle(800, 540, 1488, 816, OFFICE_PALETTE.navy).setDepth(-90)
    this.add.rectangle(800, 540, 1456, 786, OFFICE_PALETTE.floor).setDepth(-80)

    const tileLines = this.add.graphics().setDepth(-70)
    tileLines.lineStyle(1, OFFICE_PALETTE.floorLine, 0.72)
    for (let x = FLOOR.x; x <= FLOOR.x + FLOOR.width; x += 80) tileLines.lineBetween(x, FLOOR.y, x, FLOOR.y + FLOOR.height)
    for (let y = FLOOR.y; y <= FLOOR.y + FLOOR.height; y += 80) tileLines.lineBetween(FLOOR.x, y, FLOOR.x + FLOOR.width, y)

    this.add.rectangle(800, 113, 1488, 58, 0xeff3df).setDepth(-60)
    this.add.rectangle(800, 143, 1488, 12, 0x708b93).setDepth(-59)
    this.add.rectangle(82, 540, 22, 796, 0x6f8b94).setDepth(-58)
    this.add.rectangle(1518, 540, 22, 796, 0x6f8b94).setDepth(-58)
    this.add.rectangle(800, 932, 1488, 18, 0x6f8b94).setDepth(940)

    for (const x of [310, 720, 1130]) {
      this.add.rectangle(x, 105, 190, 31, 0x8fc9d8).setStrokeStyle(5, 0xf8f5e7).setDepth(-57)
    }
    this.add.text(132, 185, 'LOBBY  →  MAIN OFFICE', {
      color: '#58717a', fontFamily: FONT.ui, fontSize: '22px', fontStyle: 'bold',
    }).setDepth(-50)
    this.add.text(1180, 824, 'MEETING ZONE', {
      color: '#678890', fontFamily: FONT.ui, fontSize: '20px', fontStyle: 'bold',
    }).setDepth(-50)
    this.add.text(1284, 388, 'ARCHIVE · RESTRICTED', {
      color: '#8e5a43', backgroundColor: '#fff1db', fontFamily: FONT.ui,
      fontSize: '17px', fontStyle: 'bold', padding: { x: 9, y: 5 },
    }).setDepth(-50)
  }

  private drawFurniture() {
    this.addDesk(DESK)
    this.addCabinet(CABINET)
    this.addPlanter(PLANTER)
    this.addMeetingTable(MEETING_TABLE)
  }

  private addDesk(rect: Rect) {
    const footY = rect.y + rect.height
    this.add.ellipse(rect.x + rect.width / 2, footY + 8, rect.width + 26, 34, 0x405764, 0.22).setDepth(footY - 1)
    const desk = this.add.container(rect.x, footY).setDepth(footY)
    desk.add([
      this.add.rectangle(rect.width / 2, -rect.height / 2, rect.width, rect.height, 0xc88159).setStrokeStyle(3, 0x9d5a42),
      this.add.rectangle(rect.width / 2, -rect.height - 11, rect.width + 16, 46, 0xe4a978).setStrokeStyle(3, 0x9d5a42),
      this.add.rectangle(58, -rect.height - 13, 66, 28, 0x355569).setStrokeStyle(3, 0x203846),
      this.add.rectangle(59, -rect.height + 7, 8, 12, 0x59666a),
      this.add.rectangle(182, -rect.height - 13, 44, 30, 0xf7f4e7).setRotation(-0.12),
    ])
  }

  private addCabinet(rect: Rect) {
    const footY = rect.y + rect.height
    const cabinet = this.add.container(rect.x, footY).setDepth(footY)
    cabinet.add([
      this.add.rectangle(rect.width / 2, -rect.height / 2 - 40, rect.width, rect.height + 80, 0x779da1).setStrokeStyle(4, 0x406c78),
      this.add.rectangle(rect.width / 2, -rect.height - 82, rect.width + 12, 32, 0xa9c5b9).setStrokeStyle(3, 0x406c78),
      this.add.rectangle(rect.width / 2, -rect.height + 5, rect.width - 24, 4, 0x406c78),
      this.add.rectangle(rect.width / 2, -rect.height / 2, rect.width - 24, 4, 0x406c78),
      this.add.rectangle(rect.width / 2, -35, rect.width - 24, 4, 0x406c78),
    ])
  }

  private addPlanter(rect: Rect) {
    const footY = rect.y + rect.height
    const planter = this.add.container(rect.x + rect.width / 2, footY).setDepth(footY)
    planter.add([
      this.add.ellipse(0, -47, 132, 110, 0x418c70),
      this.add.ellipse(-28, -64, 72, 81, 0x70aa75),
      this.add.ellipse(32, -73, 76, 78, 0x5c9d6f),
      this.add.rectangle(0, -28, rect.width, 55, 0xe8b47d).setStrokeStyle(3, 0x9b6a54),
    ])
  }

  private addMeetingTable(rect: Rect) {
    const footY = rect.y + rect.height
    const table = this.add.container(rect.x, footY).setDepth(footY)
    table.add([
      this.add.rectangle(rect.width / 2, -rect.height / 2, rect.width, rect.height, 0x75959b).setStrokeStyle(3, 0x4d727a),
      this.add.ellipse(rect.width / 2, -rect.height - 2, rect.width + 18, 78, 0xb8d1c3).setStrokeStyle(3, 0x658a8c),
      this.add.rectangle(rect.width / 2, -rect.height - 6, 62, 35, 0xf8f5e7).setRotation(0.1),
    ])
  }

  private createPlayer() {
    this.shadow = this.add.ellipse(this.position.x, this.position.y + 1, 48, 17, 0x27434b, 0.27).setDepth(this.position.y - 1)
    this.player = this.add.container(this.position.x, this.position.y).setDepth(this.position.y)
    const style = characterStyle('player')
    this.playerFigure = this.add.container(0, 0)
    this.leftLeg = this.add.rectangle(-9, -17, 13, 34, OFFICE_PALETTE.navy).setOrigin(0.5, 0.15)
    this.rightLeg = this.add.rectangle(9, -17, 13, 34, OFFICE_PALETTE.navy).setOrigin(0.5, 0.15)
    this.playerFigure.add([
      this.leftLeg, this.rightLeg,
      this.add.rectangle(0, -52, 42, 55, style.jacket).setStrokeStyle(3, 0x914a3e),
      this.add.rectangle(13, -54, 8, 33, style.accent).setRotation(-0.22),
      this.add.circle(0, -91, 20, style.skin).setStrokeStyle(3, OFFICE_PALETTE.ink),
      this.add.ellipse(0, -106, 40, 17, style.hair),
      this.add.circle(10, -91, 3, OFFICE_PALETTE.ink),
    ])
    this.player.add(this.playerFigure)
  }

  private createCharacterFigure(style: CharacterStyle, scale: number) {
    const figure = this.add.container(0, 0).setScale(scale)
    figure.add([
      this.add.rectangle(-9, -17, 12, 32, OFFICE_PALETTE.navy).setRotation(-0.05),
      this.add.rectangle(9, -17, 12, 32, OFFICE_PALETTE.navy).setRotation(0.05),
      this.add.rectangle(0, -49, 40, 52, style.jacket).setStrokeStyle(3, OFFICE_PALETTE.ink),
      this.add.rectangle(12, -50, 7, 29, style.accent).setRotation(-0.2),
      this.add.circle(0, -87, 19, style.skin).setStrokeStyle(3, OFFICE_PALETTE.ink),
      this.add.ellipse(0, -102, 38, 16, style.hair),
      this.add.circle(10, -87, 3, OFFICE_PALETTE.ink),
      this.add.circle(-13, -52, 11, OFFICE_PALETTE.cream).setStrokeStyle(2, style.accent),
      this.add.text(-13, -52, style.badge, { color: '#17333d', fontFamily: FONT.ui,
        fontSize: '10px', fontStyle: 'bold' }).setOrigin(0.5),
    ])
    return figure
  }
}
