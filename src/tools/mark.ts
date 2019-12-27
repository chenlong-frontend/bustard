import * as _ from 'lodash'
import THREE from '../libs/three_export'
import { Tool } from './tool'
import { ClickEvent } from '../typings'

export interface markData {
  newBuild: THREE.Mesh[]
  exist: THREE.Mesh[]
  all: THREE.Mesh[]
}

export enum markMethod {
  NEW = 'new',
  EXIST = 'exist'
}

export interface showMarkData {
  position: THREE.Vector3
  worldNormal: THREE.Vector3
  method: markMethod
  delEnable?: boolean
  name: string
  markType?: string
}

export class Mark extends Tool {
  // 构造函数
  constructor() {
    super()
  }

  private particle: THREE.Object3D | null = null

  // 一个从0自增的数字，用来标识当前生成标记的唯一性
  private markId: number = 0

  // 标识是否开启多标记
  public multiple = false

  public activeClick: boolean = true

  public action = (e: ClickEvent) => {
    if (!this.activeClick) return
    const core = this.getCore()
    const selected = e.intersection
    if (_.isNull(selected)) return
    // 如果点到标记模型，如果此标记模型可删，则删，否则不变
    if (selected.object.userData.markType === 'mark') {
      if (selected.object.userData.delEnable) core.removeMesh(selected.object)
      return
    }
    // 如果单点，点击是删除其他可删除标记
    if (!this.multiple) {
      const marks = this.getAllMark()
      const delMark = _.filter(
        marks.all,
        v => v.userData.delEnable && v.userData.method === markMethod.NEW
      )
      core.removeMesh(<THREE.Mesh[]>delMark)
    }
    const worldNormal = core.getFaceNormal(selected)
    this._addParticle({
      position: selected.point,
      worldNormal: worldNormal,
      method: markMethod.NEW,
      name: selected.object.name
    })
  }

  /**
   * 加载外部自定义mark模型
   * @param url 模型地址
   */
  public loadMarkModel(url: string) {
    const objectLoader = new THREE.ObjectLoader()
    objectLoader.load(url, (obj: THREE.Object3D) => {
      obj.scale.setScalar(0.1)
      this.particle = obj
    })
  }

  /**
   * 获取所有的标记
   */
  public getAllMark() {
    const core = this.getCore()
    let marks: markData = { newBuild: [], exist: [], all: [] }
    core.traverseNodes(
      core.scene,
      v => {
        const { markType, method } = v.userData
        if (markType !== 'mark') return
        marks.all.push(v)
        if (method === markMethod.NEW) marks.newBuild.push(v)
        if (method === markMethod.EXIST) marks.exist.push(v)
      },
      true
    )
    return marks
  }

  /**
   * 获取所有标记的数据
   */
  public getAllMarkData() {
    const mark = this.getAllMark()
    return {
      all: _.map(mark.all, 'userData'),
      exist: _.map(mark.exist, 'userData'),
      new: _.map(mark.newBuild, 'userData')
    }
  }

  /**
   * 清除所有的标记
   */
  public clearAllMark() {
    const core = this.getCore()
    const marks = this.getAllMark().all
    core.removeMesh(marks)
  }

  /**
   * 清除所有method为new的标记
   */
  public clearNewMark() {
    const core = this.getCore()
    const marks = this.getAllMark().newBuild
    core.removeMesh(marks)
  }

  /**
   * 清除所有method为exist的标记
   */
  public clearExistMark() {
    const core = this.getCore()
    const marks = this.getAllMark().exist
    core.removeMesh(marks)
  }

  /**
   * 生成锥子模型
   * @param color 定义锥子的颜色
   */
  private _generateMarkModel(color = 0xff0000) {
    const core = this.getCore()
    const modelSize = core.getModelSize()
    let radiusBottom = modelSize / 150
    let height = modelSize / 75

    let geometry = new THREE.ConeBufferGeometry(radiusBottom, height, 6)
    let material = new THREE.MeshPhysicalMaterial({ color })

    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -height / 2, 0))
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2))

    let markModel: any = this.particle
      ? this.particle.clone()
      : new THREE.Mesh(geometry, material)
    markModel.material.color.setHex(color)
    markModel.userData.markType = 'mark'

    return markModel
  }

  /**
   * 添加锥子
   * @param position 场景中的位置
   * @param worldNormal 锥子的法向量
   * @param uniqId 与锥子相关的模型的id
   * @param method 标记锥子是点击生成的还是通过取已有数据生成的
   * @param delEnable 标记此锥子是否可删
   */
  private _addParticle(mark: showMarkData) {
    const core = this.getCore()
    const { scene } = core
    let particle = this._generateMarkModel()
    scene.add(particle)
    particle.position.set(0, 0, 0)
    particle.lookAt(mark.worldNormal)
    particle.position.copy(mark.position)
    particle.userData.position = mark.position
    particle.userData.worldNormal = mark.worldNormal
    particle.userData.method = mark.method
    particle.userData.delEnable = mark.delEnable || true
    particle.userData.name = mark.name
    particle.userData.markId = this.markId++
    core.render()
  }

  /**
   * 自定义标记位置
   * @param mark 需要展示的标记数据
   */
  public showMark(mark: showMarkData): void
  public showMark(mark: showMarkData[]): void
  public showMark(mark: any) {
    if (_.isArray(mark)) {
      _.forEach(mark, v => {
        v.method = markMethod.EXIST
        v.position = new THREE.Vector3(v.position.x, v.position.y, v.position.z)
        v.worldNormal = new THREE.Vector3(
          v.worldNormal.x,
          v.worldNormal.y,
          v.worldNormal.z
        )
        this._addParticle(v)
      })
    } else if (_.isObject(mark)) {
      mark.method = markMethod.EXIST
      mark.position = new THREE.Vector3(
        mark.position.x,
        mark.position.y,
        mark.position.z
      )
      mark.worldNormal = new THREE.Vector3(
        mark.worldNormal.x,
        mark.worldNormal.y,
        mark.worldNormal.z
      )
      this._addParticle(mark)
    }
  }
}
