import _ from 'lodash'
import { Tool } from './tool'
import { ClickEvent } from '../typings'

interface Config {
  color?: number
  isMutex?: boolean
}

/**
 * @class ColorTool 着色工具
 */
export class Color extends Tool {
  // 私有属性
  /** @member {Map<THREE.Mesh, number>} 已经染色的mesh */
  private colorMap: Map<THREE.Mesh, number>
  /** @member {number} 16进制的颜色 */
  private color: number
  /** @member {boolean} 是否互斥染色 */
  private isMutex: boolean

  public activeClick: boolean = true

  constructor(config?: Config) {
    super()
    this.colorMap = new Map<THREE.Mesh, number>()

    // default color
    this.color = 0x053ebb
    // default is not mutex
    this.isMutex = false
    if (_.isNil(config)) return
    if (_.isNumber(config.color)) this.color = config.color
    if (_.isBoolean(config.isMutex)) this.isMutex = config.isMutex
  }

  private _getMeshMaterial = (m: THREE.Mesh) => {
    if (!Array.isArray(m.material)) {
      return m.material as THREE.MeshBasicMaterial
    } else {
      return m.material[0] as THREE.MeshBasicMaterial
    }
  }

  public setMeshColor = (m: THREE.Mesh) => {
    let mm = this._getMeshMaterial(m)

    mm.transparent = false
    mm.color.setHex(this.color)
  }

  public getMeshColor = (m: THREE.Mesh) => {
    let mm = this._getMeshMaterial(m)

    return mm.color.getHex()
  }

  /**
   * @method 染色事件
   * @param {Event} e 染色事件参数
   * @returns {void}
   */
  public action = (e: ClickEvent) => {
    if (!this.activeClick) return
    const { intersect } = e
    if (_.isNull(intersect)) return
    intersect.children.forEach(c => {
      let mesh = c as THREE.Mesh
      if (this.colorMap.get(mesh) === undefined)
        this.colorMap.set(mesh, this.getMeshColor(mesh))
      this.setMeshColor(mesh)
    })
    this.getCore().render()
  }

  /**
   * @method 恢复染色的模型
   * @returns {void}
   */
  public restore = () => {
    console.log('方法有问题')
    this.colorMap.forEach((color, mesh) => {
      this.setMeshColor(mesh)
    })

    this.colorMap = new Map<THREE.Mesh, number>()
    this.getCore().render()
  }
}
