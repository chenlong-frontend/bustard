import * as _ from 'lodash'
import { Tool } from './tool'
import { post, get, loadFileByBlob } from '../libs/utils'

class TreeLoader extends Tool {
  constructor(domain: string, modelName: string, type: string) {
    super()
    this.domain = domain
    this.modelName = modelName
    this.type = type
  }
  private codeSelected: string[] = []
  private codeLoaded: string[] = []

  public domain: string

  public modelName: string

  public type: string

  /**
   * 对比code，得出需要请求的code，需要隐藏的code，需要显示的code
   * @param code 传入需要对比的code
   */
  private _codeFilter(code: string[]) {
    // 得到需要显示的codes
    const codeFilter = code.filter(v => this.codeSelected.indexOf(v) === -1)
    // 得到反选取消的codes
    const codeSelectedFileter = this.codeSelected.filter(
      v => code.indexOf(v) === -1
    )
    // 从需要显示的codes里筛选出需要请求的codes
    const codeLoad = codeFilter.filter(v => this.codeLoaded.indexOf(v) === -1)
    // 直接设置显示的
    const codeShow = codeFilter.filter(v => codeLoad.indexOf(v) === -1)
    this._setModelByCodes(codeSelectedFileter, false)
    this._setModelByCodes(codeShow, true)
    return codeLoad
  }

  /**
   * 接受一个code数组，依据isShow进行隐藏和显示
   * @param codes 传入code
   * @param isShow true将传入的code显示，false隐藏
   */
  private _setModelByCodes = (codes: string[], isShow: boolean) => {
    if (codes.length === 0) return
    // 请求得到需要隐藏的ids
    this.codesToIds(codes).then((v: any) => {
      if (v.length === 0) return false
      for (let a of v) {
        let scene = this.core.getModelScene(a.model)
        if (scene)
          this.core.traverseNodes(scene, (node: any) => {
            if (
              node.parent &&
              a.cids.indexOf(parseInt(node.parent.name)) > -1
            ) {
              node.visible = isShow
            }
          })
      }
      this.core.render()
    })
  }

  /**
   * 将按模型名解析id
   * @param ids 需要解析的id数组
   */
  private _parseModeId(ids: string[]) {
    const idsSplit = _.map(ids, v => {
      const splitArr = v.split('|')
      return {
        model: splitArr[0],
        id: splitArr[1]
      }
    })
    let idsObj: {
      [key: string]: any
    } = {}
    _.forEach(idsSplit, a => {
      if (!idsObj[a.model]) idsObj[a.model] = []
      idsObj[a.model].push(a.id)
    })
    let idsArr: { model: string; ids: string[] }[] = []
    _.forEach(idsObj, (v, o) => {
      let idsItem = { model: o, ids: v }
      idsArr.push(idsItem)
    })

    return idsArr[0]
  }

  /**
   * 根据ids加载模型
   * @param ids 需要加载的id组
   */
  public async loadModelByIds(ids: string[] | null) {
    if (_.isNull(ids)) return
    const idsToCodes = await this.idsToCode(this._parseModeId(ids))
    const code = _.uniq(idsToCodes.data)
    return this.loadModelByCodes(code)
  }

  /**
   * 根据codes加载模型
   * @param codes 需要加载的code组
   */
  public async loadModelByCodes(codes: string[] | null) {
    if (_.isNull(codes)) return
    const codeSelected = codes
    const codesArr = this._codeFilter(codeSelected)
    this.codeLoaded.push(...codesArr)
    this.codeLoaded = _.uniq(this.codeLoaded)
    this.codeSelected = codeSelected
    if (codesArr.length === 0) return
    const idsArr = await this.codesToIds(codesArr)
    const modelUrl = this.loadByIds(idsArr)
    return modelUrl
  }

  /**
   * 依据传入的ids加载模型
   * @param ids 传入的id
   */
  public loadByIds = (ids: any[]): Promise<any> => {
    const loadModel = (url: any[]) => {
      let loadPromise = []
      for (let o of url) {
        const loading = new Promise((resolve, reject) => {
          this.idsToFlile(o.cids, o.model_file)
            .then(v => {
              resolve(URL.createObjectURL(v))
            })
            .catch(e => {
              reject(e)
            })
        })
        loadPromise.push(loading)
      }
      return Promise.all(loadPromise)
    }
    return loadModel(ids)
  }

  // 获取模型树
  public getModelTree = () => {
    return post(`${this.domain}/code_rule/tree`, {
      model_name: this.modelName,
      type: this.type
    })
  }

  // 编码规则列表 -> 构件ID列表
  public codesToIds = async (codes: string[]) => {
    const result = await post(`${this.domain}/code_rule/rules/cids`, {
      model_name: this.modelName,
      rules: codes
    })
    return result.data.filter((v: any) => {
      return v.cids.length > 0
    })
  }

  // 构件ID -> 编码规则列表
  public idToCode = (cid: string) => {
    return post(`${this.domain}/code_rule/component/${cid}`, {
      model_name: this.modelName
    })
  }
  // 构件ID列表 -> 编码规则列表
  public idsToCode = async (param: {
    model: string
    ids: string[]
  }): Promise<{ data: string[] }> => {
    return post(`${this.domain}/code_rule/cids/rules`, {
      model_name: param.model,
      cids: param.ids
    })
  }

  // 编码规则 -> 构件ID列表
  public codeToIds = (rule: string) => {
    return post(`${this.domain}/code_rule/${rule}/cids`, {
      model_name: this.modelName
    })
  }

  // 根据构件ID列表组装模型
  public idsToFlile = (ids: string[], models: string) => {
    return loadFileByBlob(`${this.domain}/bim/model/ids`, {
      model_file: models,
      ids: ids
    })
  }
}

export { TreeLoader }
