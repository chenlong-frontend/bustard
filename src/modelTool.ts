import * as _ from 'lodash'
import { Core } from './core'
import {
  Tool,
  Rotate,
  Hide,
  Color,
  Clip,
  Drag,
  WireframeTool,
  Pick,
  SaveView,
  Translate,
  Mark,
  Measure,
  Roam,
  Loader,
  TreeLoader
} from './tools'
import { EventDispatcher } from './libs/event-dispatcher'

class ModelTool extends EventDispatcher {
  static Color = Color
  static Clip = Clip
  static Drag = Drag
  static Hide = Hide
  static Mark = Mark
  static Measure = Measure
  static Rotate = Rotate
  static Roam = Roam
  static Pick = Pick
  static SaveView = SaveView
  static Translate = Translate
  static Wireframe = WireframeTool
  static Loader = Loader
  static TreeLoader = TreeLoader

  constructor(el: HTMLDivElement | null) {
    super()
    this.core = new Core(el)
    this.eventBind()
  }

  // 事件绑定
  public eventBind() {
    this.core.el.addEventListener(
      'click',
      e => {
        const intersect = this.core.getFirstIntersectionObject(
          e.clientX,
          e.clientY
        )
        const intersection = this.core.getFirstIntersection(
          e.clientX,
          e.clientY
        )
        this.dispatchEvent({ type: 'click', event: e, intersect, intersection })
      },
      false
    )
    this.core.el.addEventListener(
      'mousedown',
      event => {
        this.dispatchEvent({ type: 'mousedown', event })
      },
      false
    )
    this.core.el.addEventListener(
      'mousemove',
      event => {
        this.dispatchEvent({ type: 'mousemove', event })
      },
      false
    )
    this.core.el.addEventListener(
      'mouseup',
      event => {
        this.dispatchEvent({ type: 'mouseup', event })
      },
      false
    )
  }
  private core: Core

  // 给tool注入core和事件，注册工具
  public use = <T extends Tool>(tool: T): T => {
    tool.core = this.core
    if (!_.isNull(tool.action)) this.addEventListener('click', tool.action)

    if (!_.isNull(tool.mousedownAction))
      this.addEventListener('mousedown', tool.mousedownAction)

    if (!_.isNull(tool.mouseMoveAction))
      this.addEventListener('mousemove', tool.mouseMoveAction)

    if (!_.isNull(tool.mouseUpAction))
      this.addEventListener('mouseup', tool.mouseUpAction)

    return tool
  }

  // 给清除tool的core和事件，注销工具
  public remove = (tool: Tool) => {
    if (!_.isNull(tool.action)) this.removeEventListener('click', tool.action)
    if (!_.isNull(tool.mousedownAction))
      this.removeEventListener('mousedown', tool.mousedownAction)
    if (!_.isNull(tool.mouseMoveAction))
      this.removeEventListener('mousemove', tool.mouseMoveAction)
    if (!_.isNull(tool.mouseUpAction))
      this.removeEventListener('mouseup', tool.mouseUpAction)
    if (!_.isNull(tool.restore)) tool.restore()
    tool.core = null
  }
}

export { ModelTool }
