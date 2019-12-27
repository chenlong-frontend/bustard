import * as _ from 'lodash'
import THREE from '../libs/three_export'
import { Tool } from './tool'

export class Loader extends Tool {
  private gltfLoader: THREE.GLTFLoader = new THREE.GLTFLoader()
  private fbxLoader: THREE.FBXLoader = new THREE.FBXLoader()

  /**
   * 根据url加载模型
   * @param url 地址
   * @param name 模型名
   */
  public gltfLoadByUrl = (url: string, name?: string): Promise<THREE.Scene> => {
    return new Promise<THREE.Scene>((resolve, reject) => {
      this.gltfLoader.load(
        url,
        gltf => {
          this.core.gltfAddScene(gltf.scene, name)
          resolve(gltf.scene)
        },
        p => {
          // console.log(p)
        },
        function(error) {
          reject(error)
        }
      )
    })
  }

  /**
   * 根据url加载模型
   * @param url 地址
   * @param name 模型名
   */
  public loadFbxByUrl = async (url: string): Promise<THREE.IFbxSceneGraph> => {
    return new Promise<THREE.IFbxSceneGraph>((resolve, reject) => {
      this.fbxLoader.load(
        url,
        fbx => {
          resolve(fbx)
          this.core.fbxAddScene(fbx)
        },
        p => {
          // console.log(p)
        },
        function(error) {
          reject(error)
        }
      )
    })
  }
}
