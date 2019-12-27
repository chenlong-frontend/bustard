import THREE from '../libs/three_export'
import { EventDispatcher } from './event-dispatcher'
import { Camera, Object3D } from 'three'

export class DragControls extends EventDispatcher {
  // 私有属性
  private _objects: Object3D[]
  private _camera: Camera
  private _domElement: HTMLElement

  private _plane: THREE.Plane
  private _raycaster: THREE.Raycaster

  private _mouse: THREE.Vector2
  private _offset: THREE.Vector3
  private _intersection: THREE.Vector3
  private _worldPosition: THREE.Vector3
  private _inverseMatrix: THREE.Matrix4

  private _selected: Object3D | null
  private _hovered: Object3D | null

  private enabled: boolean

  constructor(objects: Object3D[], camera: Camera, domElement: HTMLElement) {
    super()

    this._objects = objects
    this._camera = camera
    this._domElement = domElement

    this._plane = new THREE.Plane()
    this._raycaster = new THREE.Raycaster()
    this._mouse = new THREE.Vector2()
    this._offset = new THREE.Vector3()
    this._intersection = new THREE.Vector3()
    this._worldPosition = new THREE.Vector3()
    this._inverseMatrix = new THREE.Matrix4()

    this._selected = null
    this._hovered = null
    this.enabled = true
  }

  public activate = () => {
    this._domElement.addEventListener(
      'mousemove',
      this.onDocumentMouseMove,
      false
    )
    this._domElement.addEventListener(
      'mousedown',
      this.onDocumentMouseDown,
      false
    )
    this._domElement.addEventListener(
      'mouseup',
      this.onDocumentMouseCancel,
      false
    )
    this._domElement.addEventListener(
      'mouseleave',
      this.onDocumentMouseCancel,
      false
    )
    this._domElement.addEventListener(
      'touchmove',
      this.onDocumentTouchMove,
      false
    )
    this._domElement.addEventListener(
      'touchstart',
      this.onDocumentTouchStart,
      false
    )
    this._domElement.addEventListener(
      'touchend',
      this.onDocumentTouchEnd,
      false
    )
  }

  public deactivate = () => {
    this._domElement.removeEventListener(
      'mousemove',
      this.onDocumentMouseMove,
      false
    )
    this._domElement.removeEventListener(
      'mousedown',
      this.onDocumentMouseDown,
      false
    )
    this._domElement.removeEventListener(
      'mouseup',
      this.onDocumentMouseCancel,
      false
    )
    this._domElement.removeEventListener(
      'mouseleave',
      this.onDocumentMouseCancel,
      false
    )
    this._domElement.removeEventListener(
      'touchmove',
      this.onDocumentTouchMove,
      false
    )
    this._domElement.removeEventListener(
      'touchstart',
      this.onDocumentTouchStart,
      false
    )
    this._domElement.removeEventListener(
      'touchend',
      this.onDocumentTouchEnd,
      false
    )
  }

  public dispose = () => {
    this.deactivate()
  }

  public onDocumentMouseMove = (event: MouseEvent) => {
    event.preventDefault()

    let rect = this._domElement.getBoundingClientRect()
    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this._raycaster.setFromCamera(this._mouse, this._camera)
    if (this._selected && this.enabled) {
      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._selected.position.copy(
          this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix)
        )
      }
      this.dispatchEvent({ type: 'drag', object: this._selected })
      return
    }

    this._raycaster.setFromCamera(this._mouse, this._camera)
    var intersects = this._raycaster.intersectObjects(this._objects)
    if (intersects.length > 0) {
      var object = intersects[0].object
      this._plane.setFromNormalAndCoplanarPoint(
        this._camera.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(object.matrixWorld)
      )
      if (this._hovered !== object) {
        this.dispatchEvent({ type: 'hoveron', object: object })
        this._domElement.style.cursor = 'pointer'
        this._hovered = object
      }
    } else {
      if (this._hovered !== null) {
        this.dispatchEvent({ type: 'hoveroff', object: this._hovered })

        this._domElement.style.cursor = 'auto'
        this._hovered = null
      }
    }
  }

  public onDocumentMouseDown = (event: MouseEvent) => {
    event.preventDefault()

    this._raycaster.setFromCamera(this._mouse, this._camera)
    var intersects = this._raycaster.intersectObjects(this._objects)
    if (intersects.length > 0) {
      this._selected = intersects[0].object
      if (
        this._raycaster.ray.intersectPlane(this._plane, this._intersection) &&
        this._selected.parent
      ) {
        this._inverseMatrix.getInverse(this._selected.parent.matrixWorld)
        this._offset
          .copy(this._intersection)
          .sub(
            this._worldPosition.setFromMatrixPosition(
              this._selected.matrixWorld
            )
          )
      }
      this._domElement.style.cursor = 'move'
      this.dispatchEvent({ type: 'dragstart', object: this._selected })
    }
  }

  public onDocumentMouseCancel = (event: MouseEvent) => {
    event.preventDefault()

    if (this._selected) {
      this.dispatchEvent({ type: 'dragend', object: this._selected })
      this._selected = null
    }
    this._domElement.style.cursor = this._hovered ? 'pointer' : 'auto'
  }

  public onDocumentTouchMove = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault()
    let event = touchEvent.changedTouches[0]

    var rect = this._domElement.getBoundingClientRect()
    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this._raycaster.setFromCamera(this._mouse, this._camera)
    if (this._selected && this.enabled) {
      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._selected.position.copy(
          this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix)
        )
      }
      this.dispatchEvent({ type: 'drag', object: this._selected })
      return
    }
  }

  public onDocumentTouchStart = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault()
    let event = touchEvent.changedTouches[0]

    var rect = this._domElement.getBoundingClientRect()
    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    this._raycaster.setFromCamera(this._mouse, this._camera)

    var intersects = this._raycaster.intersectObjects(this._objects)
    if (intersects.length > 0) {
      this._selected = intersects[0].object
      this._plane.setFromNormalAndCoplanarPoint(
        this._camera.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(this._selected.matrixWorld)
      )
      if (
        this._raycaster.ray.intersectPlane(this._plane, this._intersection) &&
        this._selected.parent
      ) {
        this._inverseMatrix.getInverse(this._selected.parent.matrixWorld)
        this._offset
          .copy(this._intersection)
          .sub(
            this._worldPosition.setFromMatrixPosition(
              this._selected.matrixWorld
            )
          )
      }

      this._domElement.style.cursor = 'move'
      this.dispatchEvent({ type: 'dragstart', object: this._selected })
    }
  }

  public onDocumentTouchEnd = (event: TouchEvent) => {
    event.preventDefault()

    if (this._selected) {
      this.dispatchEvent({ type: 'dragend', object: this._selected })
      this._selected = null
    }

    this._domElement.style.cursor = 'auto'
  }
}
