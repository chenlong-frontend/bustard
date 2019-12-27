import THREE from './libs/three_export'
import * as _ from 'lodash'
import CameraControls from 'camera-controls'

class Core {
  constructor(el: HTMLDivElement | null) {
    if (_.isNull(el)) throw 'el can not be null'
    this.width = el.offsetWidth
    this.height = el.offsetHeight
    this.el = el

    this.clock = new THREE.Clock()
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.01,
      100
    )
    this.camera.updateProjectionMatrix()

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    })

    const hemiLight = new THREE.HemisphereLight()
    this.scene.add(hemiLight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI)
    directionalLight.position.set(0.5, 0, 0.866)
    this.camera.add(ambientLight)
    this.camera.add(directionalLight)

    CameraControls.install({ THREE: THREE })
    this.cameraControls = new CameraControls(
      this.camera,
      this.renderer.domElement
    )
    el.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0xffffff)

    // 添加坐标辅助
    this.scene.add(this.axesHelper)

    this.renderer.setSize(this.width, this.height)
    this.renderer.render(this.scene, this.camera)

    this.animation()
  }

  private clock: THREE.Clock
  private axesHelper = new THREE.AxesHelper(5)
  public width: number
  public height: number
  public el: HTMLDivElement
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  public renderer: THREE.WebGLRenderer
  public cameraControls: CameraControls

  /**
   * 模型动画帧
   */
  private animation = () => {
    const delta = this.clock.getDelta()
    const updated = this.cameraControls.update(delta)
    requestAnimationFrame(this.animation)
    if (updated) this.render()
  }

  /**
   * 渲染
   */
  public render = () => {
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * 获取整个模型的 bounding box
   */
  public bbox = () => {
    let bbox = new THREE.Box3()
    bbox.setFromObject(this.scene)

    return bbox
  }

  /**
   * 调整camera的角度和远近
   */
  public adjustCamera = object => {
    object.updateMatrixWorld()
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3()).length()

    this.camera.near = size / 100
    this.camera.far = size * 100
    this.camera.updateProjectionMatrix()
  }

  /**
   * 设置camera
   */
  public setCamera = (
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  ) => {
    this.camera = camera
    const modelCenter = this.getModelCenter()
    const modelSize = this.getModelSize()
    this.camera.position.set(
      modelCenter.x,
      modelCenter.y,
      modelCenter.z + modelSize
    )
    this.camera.lookAt(modelCenter.x, modelCenter.y, modelCenter.z)
  }

  /**
   * 遍历所有模型材质
   * @param object 需要遍历的对象
   * @param callback 对遍历结果执行的函数
   * @param visible 是否遍历不可见构件,false遍历不可见,true只遍历可见
   */
  public traverseMaterials = (
    object: THREE.Object3D,
    callback: (v: THREE.Material) => void,
    visible?: boolean
  ) => {
    const traverse = (node: THREE.Object3D | THREE.Mesh) => {
      if (!(<THREE.Mesh>node).isMesh) return
      const materials = _.isArray((<THREE.Mesh>node).material)
        ? (<THREE.Mesh>node).material
        : [(<THREE.Mesh>node).material]
      _.forEach(materials, callback)
    }
    !visible ? object.traverse(traverse) : object.traverseVisible(traverse)
  }

  /**
   * 遍历所有模型
   * @param object 需要遍历的对象
   * @param callback 对遍历结果执行的函数
   * @param visible 是否遍历不可见构件,false遍历不可见,true只遍历可见
   */
  public traverseNodes = (
    object: THREE.Object3D,
    callback: (v: THREE.Mesh) => void,
    visible?: boolean
  ) => {
    const traverse = (node: THREE.Object3D | THREE.Mesh) => {
      if (!(<THREE.Mesh>node).isMesh) return
      const nodes = _.isArray(<THREE.Mesh>node)
        ? <THREE.Mesh>node
        : [<THREE.Mesh>node]
      _.forEach(nodes, callback)
    }
    !visible ? object.traverse(traverse) : object.traverseVisible(traverse)
  }

  /**
   * 清除模型
   */
  public clearModel = () => {
    _.forEach(this.scene.children, v => {
      if (v.type === 'Scene') {
        this.traverseNodes(v, mesh => {
          mesh.geometry.dispose()
        })
        this.scene.remove(v)
      }
    })
    this.render()
  }

  /**
   * 删除传入的mesh
   * @param model 要删除的mesh
   */
  public removeMesh(model: THREE.Object3D): void
  public removeMesh(model: THREE.Object3D[]): void
  public removeMesh(model: any): void {
    if (_.isArray(model)) {
      _.forEach(model, v => {
        this.traverseNodes(v, mesh => {
          mesh.geometry.dispose()
          if (mesh.parent) mesh.parent.remove(v)
        })
      })
    } else if (_.isObject(model)) {
      this.traverseNodes(model, mesh => {
        mesh.geometry.dispose()
      })
      model.parent.remove(model)
    }
    this.render()
  }

  /**
   * 获取指定name的scene
   * @param name 需查询的名称
   * @returns 全scene或者指定名称的scene或者null
   */
  public getModelScene = (name?: string): THREE.Object3D | null => {
    if (_.isUndefined(name)) return this.scene
    let scene: THREE.Object3D | null = null
    _.forEach(this.scene.children, v => {
      if (v.name === name) scene = v
    })
    return scene
  }

  /**
   * 将gltf模型添加至场景中
   * @param scene fbx模型
   */
  public fbxAddScene = (scene: THREE.IFbxSceneGraph) => {
    this.scene.add(scene)
    // this.render()
  }

  /**
   * 获取模型中心点
   * @returns 中心点3D坐标
   */
  public getModelCenter = (): THREE.Vector3 => {
    let bBox = new THREE.Box3()
    bBox.setFromObject(this.scene)
    return bBox.getCenter(this.cameraControls.getTarget())
  }

  /**
   * 获取模型大小
   * @returns 模型bounding box大小
   */
  public getModelSize = (): number => {
    let bBox = new THREE.Box3()
    bBox.setFromObject(this.scene)
    return bBox.getSize(new THREE.Vector3()).length()
  }

  public getSceneByModelName(name: string) {
    for (let o of this.scene.children) {
      if (o.name === name) return o
    }
    let sceneToAdd = new THREE.Scene()
    sceneToAdd.name = name
    this.scene.add(sceneToAdd)
    return sceneToAdd
  }

  /**
   * 将gltf模型添加至场景中
   * @param scene gltf模型
   */
  public gltfAddScene = (
    scene: THREE.Scene | THREE.IFbxSceneGraph,
    name?: string
  ) => {
    const addScene = _.isUndefined(name)
      ? this.scene
      : this.getSceneByModelName(name)
    addScene.add(scene)
    this.traverseNodes(addScene, v => {
      if (v.parent) {
        v.parent.userData.modelName = name
        v.parent.userData.uniqId = `${name}|${v.parent.name}`
      }
    })

    this.adjustCamera(scene)
    this.cameraControls.fitTo(scene, false)
  }

  /**
   * 从屏幕位置发射一条射线，得到相交的Intersection数组
   * @param x 鼠标x轴位置
   * @param y 鼠标y轴位置
   */
  public getIntersections = (x: number, y: number): THREE.Intersection[] => {
    const mouse = new THREE.Vector2()
    mouse.x =
      ((x - this.el.getBoundingClientRect().left) / this.el.clientWidth) * 2 - 1
    mouse.y =
      -((y - this.el.getBoundingClientRect().top) / this.el.clientHeight) * 2 +
      1
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    return raycaster.intersectObjects(this.scene.children, true)
  }

  /**
   * 从鼠标位置发射一条射线，得到相交的Intersection数组,, 返回第一个Intersection
   * 由于line会导致点的错误，具体原因不详，在此将line过滤掉
   * @param x 鼠标x轴位置
   * @param y 鼠标y轴位置
   */
  public getFirstIntersection = (
    x: number,
    y: number
  ): THREE.Intersection | null => {
    let intersects = this.getIntersections(x, y)
    let intersectsExLine = _.filter(intersects, v => {
      return !(<THREE.Line>v.object).isLine
    })

    if (intersectsExLine === null || intersectsExLine.length === 0) return null
    return intersectsExLine[0]
  }

  /**
   * 从鼠标位置发射一条射线，得到第一个Intersection中的mesh
   * @param x 鼠标x轴位置
   * @param y 鼠标y轴位置
   */
  public getFirstIntersectionObject = (
    x: number,
    y: number
  ): THREE.Object3D | null => {
    let intersect = this.getFirstIntersection(x, y)
    if (_.isNull(intersect)) return null
    return intersect.object.parent
  }

  /**
   * 通过intersection数据计算法向量
   * @param intersection
   */
  public getFaceNormal(intersection: THREE.Intersection) {
    var normalMatrix = new THREE.Matrix3().getNormalMatrix(
      intersection.object.matrixWorld
    )
    if (_.isNil(intersection.face)) return new THREE.Vector3(0, 0, 0)
    return intersection.face.normal
      .clone()
      .applyMatrix3(normalMatrix)
      .normalize()
  }

  /**
   * 使用图片作为模型背景
   * @param url 图片地址
   */
  public addImgToBackground(url: string) {
    let texture = new THREE.TextureLoader().load(url)
    this.scene.background = texture
  }

  /**
   * 设置所有构件为透明
   * @param model 传入的模型
   * @param val 透明度
   */
  public opacity(model: THREE.Mesh, val: number): void
  public opacity(model: THREE.Mesh[], val: number): void
  public opacity(model: string, val: number): void
  public opacity(model: any, val: number) {
    if (_.isString(model)) {
      this.traverseMaterials(this.scene, material => {
        material.transparent = true
        material.opacity = val
      })
    } else if (_.isArray(model)) {
      _.forEach(model, v => {
        v.material.transparent = true
        v.material.opacity = val
      })
    } else if (_.isObject(model)) {
      model.material.transparent = true
      model.material.opacity = val
    }
    this.render()
  }
}

export { Core }
