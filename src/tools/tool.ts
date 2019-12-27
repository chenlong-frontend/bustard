import { Core } from '../core'
import { ClickEvent } from '../typings'

/**
 * @class Tool模型工具父类
 */
export class Tool {
  public core: Core | null = null

  /**
   * @method 获取Core
   */
  public getCore() {
    return this.core
  }

  public action: null | ((e: ClickEvent) => any) = null

  public mousedownAction: null | ((e: ClickEvent) => any) = null

  public mouseMoveAction: null | ((e: ClickEvent) => any) = null

  public mouseUpAction: null | ((e: ClickEvent) => any) = null

  public restore: null | (() => any) = null
}
