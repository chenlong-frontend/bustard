import * as _ from 'lodash'
import THREE from '../libs/three_export'
import { Tool } from './tool'
import { ClickEvent } from '../typings'

export class Measure extends Tool {
  // 构造函数
  constructor() {
    super()
  }

  private linePoint: THREE.Vector3[] = []

  public activeClick: boolean = true

  public action = (e: ClickEvent) => {
    if (!this.activeClick) return
    const selected = e.intersection
    if (!selected) return
    this.linePoint.push(selected.point)
    const linePoint = this.getLastLine()
    if (linePoint.length === 2) {
      const data = this.createLine(linePoint)
    }
  }

  /**
   * 重置测距方法
   */
  public measureReset() {
    this.removeLine()
    this.linePoint = []
  }

  /**
   * 获取测距信息
   */
  public getDistance() {
    const lines = this.getDistanceLine()
    return _.map(lines, 'userData')
  }

  // 获取最新的一条线
  private getLastLine(): THREE.Vector3[] {
    const lines = _.chunk(this.linePoint, 2)
    const lastLine = _.last(lines)
    if (_.isUndefined(lastLine)) return []
    return lastLine
  }

  // 根据两点生成一条线
  private createLine(points: THREE.Vector3[]) {
    if (points.length !== 2) return
    const core = this.getCore()
    const geometry = new THREE.Geometry()
    geometry.vertices.push(...points)
    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 10
    })
    const line = new THREE.LineSegments(geometry, material)
    const lineData = {
      uuid: line.uuid,
      distance: points[0].distanceTo(points[1]).toFixed(2)
    }
    line.name = 'distanceLine'
    line.userData = lineData
    core.scene.add(line)
    core.render()
    return lineData
  }

  // 获取所有的测距线
  private getDistanceLine() {
    const core = this.getCore()
    return _.filter(core.scene.children, { name: 'distanceLine' })
  }

  // 清除所有的测距线
  private removeLine() {
    const core = this.getCore()

    const distanceLine = this.getDistanceLine()
    _.forEach(distanceLine, v => {
      core.traverseNodes(v, mesh => {
        mesh.geometry.dispose()
      })
      core.scene.remove(v)
    })
    core.render()
  }
}
