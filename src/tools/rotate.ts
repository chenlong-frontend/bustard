import { Tool } from './tool'

/**
 * 旋转角度定义
 * @enum {number}
 */
export enum Angle {
  TOP = 1,
  BOTTOM,
  LEFT,
  RIGHT,
  FRONT,
  BACK
}

/**
 * @class RotateTool 旋转工具
 */
export class Rotate extends Tool {
  // 构造函数
  constructor() {
    super()
  }

  // 私有方法
  private _rotate = (a: Angle) => {
    let modelCenter = this.getCore().getModelCenter()
    let modelSize = this.getCore().getModelSize()

    switch (a) {
      case Angle.TOP:
        this.getCore().cameraControls.setPosition(
          modelCenter.x,
          modelCenter.y + modelSize,
          modelCenter.z
        )
        break

      case Angle.BOTTOM:
        this.getCore().cameraControls.setPosition(
          modelCenter.x,
          modelCenter.y - modelSize,
          modelCenter.z
        )
        break
      case Angle.FRONT:
        this.getCore().cameraControls.setPosition(
          modelCenter.x,
          modelCenter.y,
          modelCenter.z + modelSize
        )
        break
      case Angle.BACK:
        this.getCore().cameraControls.setPosition(
          modelCenter.x,
          modelCenter.y,
          modelCenter.z - modelSize
        )
        break
      case Angle.LEFT:
        this.getCore().cameraControls.setPosition(
          modelCenter.x - modelSize,
          modelCenter.y,
          modelCenter.z
        )
        break
      case Angle.RIGHT:
        this.getCore().cameraControls.setPosition(
          modelCenter.x + modelSize,
          modelCenter.y,
          modelCenter.z
        )
        break
      default:
        break
    }
  }

  /**
   * @method 旋转模型
   * @param {Angle} a - 旋转的角度
   * @returns {void}
   */
  public rotate(a: Angle) {
    this._rotate(a)
  }

  /**
   * 显示模型顶部
   * @returns {void}
   */
  public rotateTop() {
    this.rotate(Angle.TOP)
  }

  /**
   * 显示模型底部
   * @returns {void}
   */
  public rotateBottom() {
    this.rotate(Angle.BOTTOM)
  }

  /**
   * 显示模型左部
   * @returns {void}
   */
  public rotateLeft() {
    this.rotate(Angle.LEFT)
  }

  /**
   * 显示模型右部
   * @returns {void}
   */
  public rotateRight() {
    this.rotate(Angle.RIGHT)
  }

  /**
   * 显示模型前部
   * @returns {void}
   */
  public rotateFront() {
    this.rotate(Angle.FRONT)
  }

  /**
   * 显示模型后部
   * @returns {void}
   */
  public rotateBack() {
    this.rotate(Angle.BACK)
  }
}
