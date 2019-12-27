import { Tool } from './tool'
import { Vector3 } from 'three'

export class SaveView extends Tool {
  // 构造函数
  constructor() {
    super()
    this._position = new Vector3()
  }

  //私有属性
  private _position: Vector3

  public saveView() {
    this._position = this.getCore().cameraControls.getPosition()
    console.log(this._position, 'position')
  }

  public resetView(enableTransition: boolean) {
    this.getCore().cameraControls.setPosition(
      this._position.x,
      this._position.y,
      this._position.z,
      enableTransition
    )
  }
}
