import Phaser from 'phaser'
import type { GameLifecycleEvent, WorldInteraction } from '../bridge/events'
import { moveWithCollision, movementDelta, type Point, type Rect } from '../movement'

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
  private shadow?: Phaser.GameObjects.Ellipse
  private keys?: MovementKeys
  private pauseLabel?: Phaser.GameObjects.Text
  private paused = false
  private overlayPaused = false
  private interactions: WorldInteraction[] = []
  private markers: Phaser.GameObjects.Container[] = []
  private nearestId: string | null = null

  constructor(emit: (event: GameLifecycleEvent) => void) {
    super('office')
    this.emit = emit
  }

  create() {
    this.cameras.main.setBackgroundColor('#9ebfc5')
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.drawOffice()
    this.drawFurniture()
    this.createPlayer()
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

    this.pauseLabel = this.add.text(22, 58, 'TẠM DỪNG  ·  ESC để tiếp tục', {
      color: '#17333d', backgroundColor: '#fff8e9', fontFamily: 'system-ui, sans-serif',
      fontSize: '18px', fontStyle: 'bold', padding: { x: 14, y: 10 },
    }).setScrollFactor(0).setDepth(10000).setVisible(false)

    this.cameras.main.startFollow(this.player!, true, 0.12, 0.12)
    this.cameras.main.setDeadzone(80, 60)
    this.emit({ type: 'play-state', state: 'playing' })

    window.addEventListener('blur', this.pauseForFocusLoss)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('blur', this.pauseForFocusLoss)
      document.removeEventListener('visibilitychange', this.onVisibilityChange)
      keyboard.off('keydown-ESC', this.togglePause)
      keyboard.off('keydown-E', this.tryInteract)
      keyboard.resetKeys()
    })
  }

  update(_time: number, delta: number) {
    const keys = this.keys
    if (!keys) return

    if (this.paused || this.overlayPaused) return

    const input = {
      x: Number(keys.d.isDown || keys.right.isDown) - Number(keys.a.isDown || keys.left.isDown),
      y: Number(keys.s.isDown || keys.down.isDown) - Number(keys.w.isDown || keys.up.isDown),
    }
    const movement = movementDelta(input, delta, keys.shift.isDown)
    this.position = moveWithCollision(this.position, movement, FLOOR, OBSTACLES)
    this.player?.setPosition(this.position.x, this.position.y).setDepth(this.position.y)
    this.shadow?.setPosition(this.position.x, this.position.y + 1).setDepth(this.position.y - 1)
    this.updateNearby()
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
      const color = interaction.kind === 'npc' ? 0x4a7da2 : 0xf4bd64
      marker.add([
        this.add.ellipse(0, 0, 52, 17, 0x29434e, 0.25),
        this.add.circle(0, -25, 16, color).setStrokeStyle(3, 0xffffff),
        this.add.text(0, -58, interaction.labelVi, {
          color: '#17333d', backgroundColor: '#fff8e9', fontFamily: 'system-ui, sans-serif',
          fontSize: '14px', padding: { x: 5, y: 3 },
        }).setOrigin(0.5),
      ])
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
    this.emit({ type: 'interaction-requested', interactionId: this.nearestId })
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

  private drawOffice() {
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0xa5c4c8).setDepth(-100)
    this.add.rectangle(800, 540, 1488, 816, 0x526772).setDepth(-90)
    this.add.rectangle(800, 540, 1456, 786, 0xd7e9df).setDepth(-80)

    const tileLines = this.add.graphics().setDepth(-70)
    tileLines.lineStyle(1, 0xb9d7cf, 0.6)
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
      color: '#58717a', fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold',
    }).setDepth(-50)
    this.add.text(1180, 824, 'MEETING ZONE', {
      color: '#678890', fontFamily: 'system-ui, sans-serif', fontSize: '20px', fontStyle: 'bold',
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
    this.player.add([
      this.add.rectangle(-10, -16, 14, 32, 0x263d51).setRotation(-0.08),
      this.add.rectangle(10, -16, 14, 32, 0x263d51).setRotation(0.08),
      this.add.rectangle(0, -48, 39, 52, 0xd7734e).setStrokeStyle(3, 0x914a3e),
      this.add.circle(0, -88, 19, 0xf0bd91).setStrokeStyle(3, 0x4b3432),
      this.add.ellipse(0, -103, 38, 17, 0x433536),
    ])
  }
}
