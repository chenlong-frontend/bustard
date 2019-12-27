import { Tool } from './tool'
import { ClickEvent } from '../typings'

export class Hide extends Tool {
  // 私有属性
  private hideObjs: THREE.Object3D[]
  public activeClick: boolean = true
  // 构造函数
  constructor() {
    super()
    this.hideObjs = new Array()
  }

  public action = (e: ClickEvent) => {
    if (!this.activeClick) return
    const { intersect } = e
    if (intersect !== null) {
      intersect.visible = false
      this.hideObjs.push(intersect)
    }

    // must render to hide object
    this.getCore().render()
  }

  // 公开方法
  public restore = () => {
    this.hideObjs.forEach(obj => {
      obj.visible = true
    })

    this.hideObjs = new Array()

    // must render to restore objects
    this.getCore().render()
  }
}
