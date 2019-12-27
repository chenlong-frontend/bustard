import * as THREE from 'three'
;(<any>global).THREE = THREE

// controls
require('three/examples/js/controls/OrbitControls')
require('three/examples/js/controls/FirstPersonControls')

// loaders
require('three/examples/js/loaders/GLTFLoader')
require('three/examples/js/loaders/FBXLoader')

export default (<any>global).THREE
