import * as _ from 'lodash'
import THREE from '../libs/three_export'
import { Tool } from './tool'
import { Event } from '../typings'

export interface xyCoord {
  x: number
  y: number
}

export interface coordType {
  id: number
  mesh: THREE.Mesh
  pos: xyCoord
  vector?: THREE.Vector3
}

export class Pick extends Tool {
  /**
   * 选择功能
   * 开启框选功能时需要调用 getUnitVertCoordinates 方法缓存构件信息
   * @param mutiPick 框选结束之后的回调
   */
  constructor(mutiPick?: (meshes: THREE.Mesh[]) => void) {
    super()
    this._createMarquee()
    this.mutiPick = mutiPick
  }

  private _mousedowncoords = {
    x: 0,
    y: 0
  }
  private _mousedown: boolean = false
  private _marquee = document.createElement('div')
  private _unitVertCoordinates: coordType[] = []

  public activeMutiPick: boolean = true
  public activeClick: boolean = true
  public mutiPick: (meshes: THREE.Mesh[]) => void | null = null

  // 点击选择事件
  public action = (event: Event) => {
    if (!this.activeClick) return
    const core = this.getCore()
    const e = event.event
    if (e.ctrlKey) return
    const selected = core.getFirstIntersectionObject(e.clientX, e.clientY)
  }

  // 鼠标按下事件
  public mousedownAction = (event: Event) => {
    if (!this.activeMutiPick) return
    const core = this.getCore()
    const e = event.event
    if (!e.ctrlKey || e.button !== 0) return
    core.cameraControls.enabled = false
    this._mousedown = true
    this._mousedowncoords = {
      x: e.layerX,
      y: e.layerY
    }
    const pos = {
      x: (e.layerX / core.width) * 2 - 1,
      y: -(e.layerY / core.height) * 2 + 1
    }
    var vector = new THREE.Vector3(pos.x, pos.y, 1)
    vector.unproject(core.camera)
  }

  // 鼠标移动事件
  public mouseMoveAction = (event: Event) => {
    if (!this.activeMutiPick) return
    const e = event.event
    if (!e.ctrlKey || e.button !== 0) {
      this._resetMarquee()
      return
    }
    const {
      _mousedown: mousedown,
      _marquee: marquee,
      _mousedowncoords: mousedowncoords
    } = this
    if (mousedown) {
      marquee.style.display = 'block'
      var pos = {
        x: e.layerX - mousedowncoords.x,
        y: e.layerY - mousedowncoords.y
      }
      if (pos.x < 0 && pos.y < 0) {
        marquee.style.left = e.layerX + 'px'
        marquee.style.width = -pos.x + 'px'
        marquee.style.top = e.layerY + 'px'
        marquee.style.height = -pos.y + 'px'
      } else if (pos.x >= 0 && pos.y <= 0) {
        marquee.style.left = mousedowncoords.x + 'px'
        marquee.style.width = pos.x + 'px'
        marquee.style.top = e.layerY + 'px'
        marquee.style.height = -pos.y + 'px'
      } else if (pos.x >= 0 && pos.y >= 0) {
        marquee.style.left = mousedowncoords.x + 'px'
        marquee.style.width = pos.x + 'px'
        marquee.style.height = pos.y + 'px'
        marquee.style.top = mousedowncoords.y + 'px'
      } else if (pos.x < 0 && pos.y >= 0) {
        marquee.style.left = e.layerX + 'px'
        marquee.style.width = -pos.x + 'px'
        marquee.style.height = pos.y + 'px'
        marquee.style.top = mousedowncoords.y + 'px'
      }
    }
  }

  // 鼠标抬起事件
  public mouseUpAction = (event: Event) => {
    if (!this.activeMutiPick) return
    const e = event.event
    if (!e.ctrlKey || e.button !== 0) {
      this._resetMarquee()
      return
    }
    const selectedCubes = this._findCubesByVertices({
      x: e.layerX,
      y: e.layerY
    })
    this._resetMarquee()
    if (!_.isNull(this.mutiPick)) this.mutiPick(selectedCubes)
  }

  /**
   * 开启框选时必须要执行的操作，缓存构件信息
   */
  public getUnitVertCoordinates() {
    const core = this.getCore()
    let unprojectedCoordinates: coordType[] = []
    core.traverseNodes(
      core.scene,
      child => {
        let verts = this._computeVertices(child.geometry)
        verts.applyMatrix(child.matrixWorld)
        _.forEach(verts.vertices, v => {
          let coord: coordType = {
            id: child.id,
            mesh: child,
            pos: { x: 0, y: 0 },
            vector: v.clone()
          }
          unprojectedCoordinates.push(coord)
        })
      },
      true
    )
    this._unitVertCoordinates = unprojectedCoordinates
  }

  /**
   * 将框选的缓存数据清除掉
   */
  public unitVertCoordinatesDispose() {
    this._unitVertCoordinates = []
  }
  private _createMarquee() {
    if (!_.isNull(document.getElementById('select-marquee'))) return
    const marquee = this._marquee
    marquee.id = 'select-marquee'
    marquee.style.position = 'absolute'
    marquee.style.top = '-2px'
    marquee.style.left = '-2px'
    marquee.style.zIndex = '9999'
    marquee.style.height = '0px'
    marquee.style.width = '10px'
    marquee.style.backgroundColor = 'rgba(208, 255, 242, 0.5)'
    marquee.style.border = 'dotted 1px #9a9a9a'
    marquee.style.margin = '0'
    marquee.style.padding = '0'
    marquee.style.pointerEvents = 'none'
    document.body.append(marquee)
  }

  private _resetMarquee() {
    const core = this.getCore()
    core.cameraControls.enabled = true
    this._mousedown = false
    this._marquee.style.display = 'none'
    this._marquee.style.width = '0'
    this._marquee.style.height = '0'
    this._mousedowncoords = {
      x: 0,
      y: 0
    }
  }

  private _findCubesByVertices(location: { x: number; y: number }) {
    const { _mousedowncoords } = this
    const currentMouse = {
      x: location.x,
      y: location.y
    }
    let inside = false
    let selectedUnits: THREE.Mesh[] = []
    let dupeCheck: { [index: number]: boolean } = {}
    const units = _.map(this._unitVertCoordinates, v => {
      if (v.vector) v.pos = this._toScreenXY(v.vector)
      return v
    })
    const bounds = this._findBounds(currentMouse, _mousedowncoords)
    for (var i = 0; i < units.length; i++) {
      inside = this._withinBounds(units[i].pos, bounds)
      if (inside && dupeCheck[units[i].id] === undefined) {
        selectedUnits.push(units[i].mesh)
        dupeCheck[units[i].id] = true
      }
    }
    return selectedUnits
  }

  // Takes a position and detect if it is within delta of the origin defined by findBounds ({origin, delta})
  private _withinBounds(
    pos: xyCoord,
    bounds: { origin: xyCoord; delta: xyCoord }
  ) {
    var ox = bounds.origin.x,
      dx = bounds.origin.x + bounds.delta.x,
      oy = bounds.origin.y,
      dy = bounds.origin.y + bounds.delta.y
    if (pos.x >= ox && pos.x <= dx) {
      if (pos.y >= oy && pos.y <= dy) {
        return true
      }
    }
    return false
  }

  private _findBounds(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number }
  ) {
    // calculating the origin and vector.
    let origin: xyCoord = {
      x: 0,
      y: 0
    }
    let delta: xyCoord = {
      x: 0,
      y: 0
    }
    if (pos1.y < pos2.y) {
      origin.y = pos1.y
      delta.y = pos2.y - pos1.y
    } else {
      origin.y = pos2.y
      delta.y = pos1.y - pos2.y
    }
    if (pos1.x < pos2.x) {
      origin.x = pos1.x
      delta.x = pos2.x - pos1.x
    } else {
      origin.x = pos2.x
      delta.x = pos1.x - pos2.x
    }
    return {
      origin: origin,
      delta: delta
    }
  }
  private _computeVertices(geometry: THREE.Geometry | THREE.BufferGeometry) {
    if (
      (<THREE.Geometry>geometry).vertices &&
      (<THREE.Geometry>geometry).vertices.length > 0
    ) {
      return <THREE.Geometry>geometry
    }
    return new THREE.Geometry().fromBufferGeometry(<THREE.BufferGeometry>(
      geometry
    ))
  }

  private _toScreenXY(position: THREE.Vector3) {
    const core = this.getCore()
    const { width, height, camera } = core
    var pos = position.clone()
    var projScreenMat = new THREE.Matrix4()
    projScreenMat.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
    pos.applyMatrix4(projScreenMat)
    return {
      x: ((pos.x + 1) * width) / 2,
      y: ((-pos.y + 1) * height) / 2
    }
  }
}
