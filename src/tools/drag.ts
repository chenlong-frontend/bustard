import { DragControls } from '../libs/drag-controls'
import { Tool } from './tool'
import { Object3D } from 'three'

export class Drag extends Tool {
  private _dragControls?: DragControls

  // 构造函数
  constructor() {
    super()
    this._dragControls = undefined
  }

  private _dragstart = (e: Event) => {
    const { cameraControls, render } = this.getCore()

    cameraControls.enabled = false
    render()
  }

  private _drag = (e: Event) => {
    const { render } = this.getCore()

    render()
  }

  private _dragend = (e: Event) => {
    const { cameraControls, render } = this.getCore()

    cameraControls.enabled = true
    render()
  }

  public startDrag = () => {
    let objects: Object3D[] = new Array()
    const { scene, camera, renderer } = this.getCore()

    scene.traverse(obj => {
      objects.push(obj)
    })

    this._dragControls = new DragControls(objects, camera, renderer.domElement)

    this._dragControls.addEventListener('dragstart', this._dragstart)
    this._dragControls.addEventListener('drag', this._drag)
    this._dragControls.addEventListener('dragend', this._dragend)

    this._dragControls.activate()
  }

  public stopDrag = () => {
    if (!this._dragControls) return

    this._dragControls.removeEventListener('dragstart', this._dragstart)
    this._dragControls.removeEventListener('drag', this._drag)
    this._dragControls.removeEventListener('dragend', this._dragend)
    this._dragControls.dispose()
    this._dragControls = undefined
  }
}
