import THREE from '../libs/three_export'
import { Tool } from './tool'

/**
 * @class ClipTool 剖切工具
 */
export class Clip extends Tool {
  constructor() {
    super()
  }

  /**
   * @method 模型剖切
   * @param axis 剖切方向, X轴, Y轴或者Z轴
   * @param {number} v 剖切的数值
   * @returns {void}
   */
  public clip(axis: string, v: [number, number]) {
    const { x1, x2, y1, y2, z1, z2 } = this.getBox()
    const clippingPlanes = this.getCore().renderer.clippingPlanes
    switch (axis) {
      case 'x':
        clippingPlanes[0].constant = -x1 - (v[0] / 100) * (x2 - x1)
        clippingPlanes[1].constant = x1 + (v[1] / 100) * (x2 - x1)
        break
      case 'y':
        clippingPlanes[2].constant = -y1 - (v[0] / 100) * (y2 - y1)
        clippingPlanes[3].constant = y1 + (v[1] / 100) * (y2 - y1)
        break
      case 'z':
        clippingPlanes[4].constant = -z1 - (v[0] / 100) * (z2 - z1)
        clippingPlanes[5].constant = z1 + (v[1] / 100) * (z2 - z1)
        break
      default:
        break
    }

    this.getCore().render()
  }

  // 获取bounding box具体值
  private getBox() {
    let bbox = this.getCore().bbox()
    const {
      min: { x: x1, y: y1, z: z1 },
      max: { x: x2, y: y2, z: z2 }
    } = bbox

    return {
      x1: x1,
      x2: x2,
      y1: y1,
      y2: y2,
      z1: z1,
      z2: z2
    }
  }

  /**
   * @method 恢复剖切的模型
   * @returns {void}
   */
  public restore = () => {
    const { x1, x2, y1, y2, z1, z2 } = this.getBox()
    const planes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -x1 + 1),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), x2 + 1),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), -y1 + 1),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), y2 + 1),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -z1 + 1),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), z2 + 1)
    ]

    this.getCore().renderer.clippingPlanes = planes

    this.getCore().render()
  }
}
