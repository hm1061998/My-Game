import Phaser from 'phaser'

export class FoundationScene extends Phaser.Scene {
  constructor() { super('foundation') }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#202633')

    const floor = this.add.graphics()
    floor.fillStyle(0x303846, 1)
    floor.fillPoints([
      new Phaser.Math.Vector2(width * .5, 54),
      new Phaser.Math.Vector2(width - 70, height * .48),
      new Phaser.Math.Vector2(width * .5, height - 54),
      new Phaser.Math.Vector2(70, height * .48),
    ], true)
    floor.lineStyle(2, 0x4b5669, 1)
    floor.strokePath()

    const desk = this.add.rectangle(width * .62, height * .42, 190, 92, 0xb46942).setRotation(-.15).setStrokeStyle(3, 0xe2a77c)
    desk.setDepth(desk.y)
    this.add.ellipse(width * .42, height * .62 + 25, 64, 23, 0x101219, .45).setDepth(height)

    const investigator = this.add.container(width * .42, height * .62)
    const body = this.add.rectangle(0, 0, 34, 58, 0xdb7949).setStrokeStyle(3, 0xf5c19d)
    const head = this.add.circle(0, -39, 15, 0xe7b28e).setStrokeStyle(3, 0x362b2a)
    investigator.add([body, head]).setDepth(investigator.y)

    this.add.text(28, height - 42, 'Foundation scene · movement arrives in T03', {
      color: '#aeb6c8', fontFamily: 'system-ui, sans-serif', fontSize: '14px',
    }).setDepth(height + 100)
  }
}
