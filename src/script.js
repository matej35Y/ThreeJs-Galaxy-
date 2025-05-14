import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */

const parametars = {}
parametars.count = 100000
parametars.size = 0.01
parametars.radius = 5
parametars.branches = 3
parametars.spin =  1
parametars.randomness =  0.2
parametars.randomnessPower = 3
parametars.insideColor = '#ff6030'
parametars.outsideColor = '#1b3984'





let geometry = null
let material = null
let points = null

function getLetterPoints(letter = 'M', canvasSize = 128, threshold = 0.5) {
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    const ctx = canvas.getContext('2d')

    // Fill background black and draw white letter
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    ctx.font = `${canvasSize * 0.8}px Arial`
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letter, canvasSize / 2, canvasSize / 2)

    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize)
    const points = []

    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            const index = (y * canvasSize + x) * 4
            const brightness = imageData.data[index] / 255 // R channel

            if (brightness > threshold) {
                // Normalize to -1 to +1 range
                const nx = -((x / canvasSize) * 2 - 1)
                const ny = -((y / canvasSize) * 2 - 1)

                points.push([nx, ny])
            }
        }
    }

    return points
}


const generateLetterGalaxy = (letter = 'M') => {
    if (points != null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    const basePoints = getLetterPoints(letter)
    const totalPoints = parametars.count
    const positions = new Float32Array(totalPoints * 3)
    const colors = new Float32Array(totalPoints * 3)

    const colorInside = new THREE.Color(parametars.insideColor)
    const colorOutside = new THREE.Color(parametars.outsideColor)

    for (let i = 0; i < totalPoints; i++) {
        const i3 = i * 3
        const p = basePoints[Math.floor(Math.random() * basePoints.length)]

        const x = p[0] * parametars.radius + (Math.random() - 0.5) * parametars.randomness
        const y = p[1] * parametars.radius + (Math.random() - 0.5) * parametars.randomness
        const z = (Math.random() - 0.5) * parametars.randomness * 2

        positions[i3 + 0] = x
        positions[i3 + 1] = y
        positions[i3 + 2] = z

        const mixedColor = colorInside.clone().lerp(colorOutside, Math.random())
        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: parametars.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateLetterGalaxy('Ma') // Try other letters too!


gui.add(parametars, 'count').min(100).max(1000000).step(100).onFinishChange(() => generateLetterGalaxy('M'))

gui.add(parametars, 'size').min(0.001).max(0.01).step(0.001).onFinishChange(() => generateLetterGalaxy('M'))

gui.add(parametars, 'radius').min(0.01).max(20).step(0.01).onFinishChange(() => generateLetterGalaxy('M'))

gui.add(parametars, 'branches').min(2).max(20).step(1).onFinishChange(() => generateLetterGalaxy('M'))

gui.add(parametars, 'spin').min(-5).max(5).step(0.001).onFinishChange(() => generateLetterGalaxy('M'))

gui.add(parametars, 'randomness').min(0).max(2).step(0.001).onFinishChange(() => generateLetterGalaxy('M'))

gui.add(parametars, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(() => generateLetterGalaxy('M'))

gui.addColor(parametars, 'insideColor').onFinishChange(() => generateLetterGalaxy('M'))

gui.addColor(parametars, 'outsideColor').onFinishChange(() => generateLetterGalaxy('M'))




// Background stars
const starCount = 500
const starPositions = new Float32Array(starCount * 3)

for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    starPositions[i3] = (Math.random() - 0.5) * 100
    starPositions[i3 + 1] = (Math.random() - 0.5) * 100
    starPositions[i3 + 2] = (Math.random() - 0.5) * 100
}

const starGeometry = new THREE.BufferGeometry()
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    sizeAttenuation: true
})

const starField = new THREE.Points(starGeometry, starMaterial)
scene.add(starField)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Adjust speed as needed
    points.rotation.y = elapsedTime * 0.1; 

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()