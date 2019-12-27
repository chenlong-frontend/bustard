export interface Event {
  type: string
  event: MouseEvent
}

export interface ClickEvent extends Event {
  intersect: THREE.Object3D
  intersection: THREE.Intersection
}
