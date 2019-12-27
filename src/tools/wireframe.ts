import { MeshBasicMaterial } from 'three'
import { Tool } from './tool'

export class WireframeTool extends Tool {
  // 构造函数
  constructor() {
    super()
  }

  /**
   * 是否显示线框图
   * @param isShow true显示false不显示
   */
  public wireframe = (isShow: boolean) => {
    this.getCore().traverseMaterials(this.getCore().scene, material => {
      ;(<MeshBasicMaterial>material).wireframe = isShow
    })

    this.getCore().render()
  }
}
