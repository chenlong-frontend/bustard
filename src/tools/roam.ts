import { Tool } from './tool'

export class Roam extends Tool {
  // 构造函数
  constructor() {
    super()
  }

  private pos: any = null
  private tar: any = null

  public getPosition() {
    this.pos = this.getCore().cameraControls.toJSON()
    console.log(this.pos)
    console.log(this.tar)
  }

  public lookat() {
    const pos = this.pos
    const tar = this.pos
    console.log(this.pos)
    console.log(this.tar)
    this.getCore().cameraControls.addEventListener('update', e => {
      console.log(JSON.stringify(e.target))
      console.log(e)
    })
    this.getCore().cameraControls.fromJSON(pos, true)
    this.getCore().cameraControls.setTarget(tar.x, tar.y, tar.z, true)
  }
}
