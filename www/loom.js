const loom = {
  colors: {
    primary: "#00ff00",
    secondary: "#ff0000"
  }
}

function onLoad() {
  // init variables WILL REPLACE SOON
  loom.scale = 10
  loom.checkerScale = 16

  // osmose elements from the document into our data object
  loom.drawCanvas = document.getElementById('drawCanvas')
  loom.drawCtx = loom.drawCanvas.getContext('2d')
  loom.renderCanvasContainer = document.getElementById('renderCanvasContainer')
  loom.btn_clear = document.getElementById('btn-clear')
  loom.btn_4px = document.getElementById('btn-4px')
  loom.btn_3px = document.getElementById('btn-3px')
  loom.btn_load = document.getElementById('btn-load')
  loom.btn_save = document.getElementById('btn-save')
  loom.ctrl_scale = document.getElementById('ctrl-scale')
  loom.ctrl_checkerScale = document.getElementById('ctrl-checkerScale')

  // register ALL THE EVENT LISTENERS
  loom.drawCanvas.onmousemove = handleCanvasEvent
  loom.drawCanvas.onmousedown = handleCanvasEvent
  loom.drawCanvas.oncontextmenu = handleCanvasEvent

  document.addEventListener('wheel', handleScroll, {passive: false})
  document.ondragover = handleDrag
  document.ondrop = handleDrag

  loom.btn_clear.onclick = clearCanvas
  loom.btn_4px.onclick = e => loadImage("https://assets.mojang.com/SkinTemplates/4px_reference.png")
  loom.btn_3px.onclick = e => loadImage("https://assets.mojang.com/SkinTemplates/3px_reference.png")
  loom.btn_load.onchange = e => readFile(e.target.files[0])

  loom.ctrl_scale.oninput = updateScales
  loom.ctrl_checkerScale.oninput = updateScales


  loom.drawCtx.fillStyle = loom.colors.secondary
  loom.drawCtx.fillRect(16, 16, 32, 32)
  loom.drawCtx.fillStyle = loom.colors.primary
  swapColor()
  updateScales()

  // three.js stuff
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  loom.renderCanvasContainer.appendChild( renderer.domElement );

  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  const light = new THREE.AmbientLight( 0xffffff ); // soft white light
  scene.add( light );
  
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load("/4px.glb", (gltf) => {
    console.log(gltf)
    const player = gltf.scene
    player.scale.setScalar(0.1)
    player.rotation.y = 3*Math.PI/2
    scene.add(player)
  }, undefined, (error) => {
    console.error(error)
  })
  
  camera.position.z = 10;
  function animate() {
	  requestAnimationFrame( animate );
	  renderer.render( scene, camera );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  animate();
}

function setPixel(x,y,c) {
  loom.drawCtx.fillStyle = c
  loom.drawCtx.fillRect(x,y,1,1)
}

function clearCanvas() {
  loom.drawCtx.clearRect(0,0,64,64)
  /*let tempColors = loom.colors
  loom.colors = {
    primary: "#808080",
    secondary: "#ffffff"
  }
  swapColor() //setup color & fillstyle
  for(let x = 0; x < loom.drawCanvas.width/loom.checkerScale; x++) {
    for(let y = 0; y < loom.drawCanvas.width/loom.checkerScale; y++) {
      loom.drawCtx.fillRect(x*loom.checkerScale,y*loom.checkerScale,loom.checkerScale,loom.checkerScale)
      swapColor()
    }
    swapColor()
  }
  loom.colors = tempColors
  swapColor() //setup color & fillstyle*/
}

function swapColor() {
  console.log(loom.colors)
  let tempColor = loom.colors.primary
  loom.colors.primary = loom.colors.secondary
  loom.colors.secondary = tempColor
  console.log(loom.colors)
  
  console.log(tempColor)
  loom.drawCtx.fillStyle = loom.colors.primary
}

function updateScales(e) {
  if(e != undefined) {
    loom.scale = loom.ctrl_scale.value
    loom.checkerScale = 512/(2**loom.ctrl_checkerScale.value)
  } else {
    loom.ctrl_scale.value = loom.scale
  }
  loom.drawCanvas.setAttribute('style', `--scale:${loom.scale};--checkerScale:${loom.checkerScale}`)
}

// reads file and displays it on canvas
function readFile(file) {
  let fr = new FileReader()
  fr.onload = e => {
    loadImage(fr.result)
  }
  fr.readAsDataURL(file)
}

// takes img source & displays on canvas
// if it's not 64x64, it cancels and notifies the user
function loadImage(src) {
  img = new Image()
  img.onload = e => {
    if(img.width != 64 || img.height != 64) {
      alert("Wrong size!\nImages must be 64x64 pixels.")
    } else {
      clearCanvas()
      loom.drawCtx.drawImage(img, 0, 0)
    }
  }
  img.src = src
}

function handleCanvasEvent(e) {
  let rect = e.target.getBoundingClientRect()
  let x = Math.round((e.clientX - rect.left) / loom.scale) - 1
  let y = Math.round((e.clientY - rect.top) / loom.scale) - 1

  if(e.buttons == 1) {
    setPixel(x, y, loom.colors.primary)
  } else if(e.buttons == 2) {
    setPixel(x, y, loom.colors.secondary)
  }

  e.preventDefault()
  return false
}

function handleScroll(e) {
  e.preventDefault()
  if(e.wheelDeltaY > 0 && loom.scale < 16) {
    loom.scale++
  } else if(e.wheelDeltaY < 0 && loom.scale > 1) {
    loom.scale--
  }
  updateScales()
}

function handleDrag(e) {
  e.preventDefault()
  if(e.type === "drop" && e.dataTransfer.files.length > 0) {
    if(e.dataTransfer.files[0].type.startsWith("image/")) {
      readFile(e.dataTransfer.files[0])
    } else {
      alert("invalid drop")
    }
  }
}