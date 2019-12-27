import { Tool } from './tool'
import THREE from '../libs/three_export'
import CameraControls from 'camera-controls'

export class Translate extends Tool {
  // 构造函数
  constructor() {
    super()
    this.orthographicCamera = {} as THREE.OrthographicCamera
  }
  private orthographicCamera: THREE.OrthographicCamera

  public setOrthographicCamera = () => {
    const core = this.getCore()
    const {
      width,
      height,
      setCamera,
      bbox,
      render,
      renderer,
      getModelSize
    } = core
    const modelBox = bbox().getSize(new THREE.Vector3())
    const size = getModelSize()
    setCamera(
      new THREE.OrthographicCamera(
        (-size * width) / height / 2,
        (size * width) / height / 2,
        size / 2,
        -size / 2,
        1,
        1 + size * 2
      )
    )
    core.cameraControls = new CameraControls(core.camera, renderer.domElement)
    render()
  }
}
