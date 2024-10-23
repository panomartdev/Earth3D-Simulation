import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// global variables
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth /
window.innerHeight, 0.1, 1000);
camera.position.z = 3;
camera.position.y = 2;
scene.add(camera);

// renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientlight);
// point light
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(5, 3, 5);
scene.add(pointLight);


///======================== Earth Model =============================
// earth geometry
const earthGeometry = new THREE.SphereGeometry(0.6, 32, 32);
// earth material
const earthMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('/images/earthmap1k.jpg'),//Earth Texture
    bumpMap: new THREE.TextureLoader().load('/images/earthbump.jpeg'), //terrain texture
    bumpScale: 0.1
});
// earth mesh
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earthMesh);
//--------------------------------------------------------------------------------------------

//========================== Moon and Orbiting ==========================

const moonRadius = 0.6 * 0.27; // คำนวนขนาดดวงจันทร์ โดยดวงจันทร์จะมีขนาด 27% ของขนาดจริงของโลก
const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32); //สร้างลูก Sphere ทรงกลมของดวงจันทร์ขึ้นมา
const moonMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('/images/moonmap1k.jpg'), //นำภาพดวงจันทร์ Load ตัว Texture ให้กับลูก Sphere ที่สร้างขึ้นมา
});
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moonMesh)
//========================== Moon Orbiting ==========================

// Create a pivot point for the moon's orbit 
const moonOrbit = new THREE.Object3D(); // สร้างตัว Pivot ขึ้นมาซึ่งเป็นจุดหมุนหรือจุดอ้างอิงของวัตถุทุกชิ้นที่อ้างอิงกับ Pivot นี้ ซึ่งเป็นสิ่งสำคัญในการทำ 3D 
    // โดยการสร้าง Pivot จะเป็นการสร้าง Object ที่ไม่มีรูปร่าง 

earthMesh.add(moonOrbit);//นำค่า Pivot ไปใส่ในค่า Earth ซึ่งทำให้ Pivot อยู่ในตำแหน่งเดียวกันกับโลก
moonOrbit.add(moonMesh);//นำเอาโมเดลดวงจันทร์มาขึ้นตรงกับ Pivot ที่สร้างขึ้นมา
const moonOrbitRadius = 2.5; // ค่าระยะห่างระหว่าง โมเดลดวงจันทร์ กับ Pivot
moonMesh.position.set(moonOrbitRadius, 0, 0); //ทำให้ตำแหน่งวัตถุของดวงจันทร์ออกห่างจาก Pivot ไป 2.5 ซึ่งเมื่อทำการหมุนวัตถุที่ตัว Pivot เราจะเห็นดวงจันทร์หมุนรอบโลกได้

// Orbit animation variables
let moonOrbitAngle = 0;
const moonOrbitSpeed = 0.005; // Adjust this value to change the orbit speed

//--------------------------------------------------------------------------------------------


//========================== Cloud Model ========================

// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(0.63, 32, 32);
// cloud metarial
const cloudMetarial = new THREE.MeshPhongMaterial({
map: new THREE.TextureLoader().load('/images/earthCloud.png'),
opacity: 0.8,
transparent: true,
});
// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
scene.add(cloudMesh);
//--------------------------------------------------------------------------------------------

//========== Outer Space as a Background  ================

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64);
// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
map : new THREE.TextureLoader().load('/images/galaxy.png'),
side: THREE.BackSide
});
// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);
//--------------------------------------------------------------------------------------------

//========================== Aurora ================================

// Aurora effect
const auroraGeometry = new THREE.SphereGeometry(0.645, 64, 64);
const auroraVertexShader = `
varying vec3 vNormal;
varying vec2 vUv;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;// ทำการสร้าง VertexShader ตัว แสงเหนือ
const auroraFragmentShader = `
uniform float time;
varying vec3 vNormal;
varying vec2 vUv;

float noise(vec3 p) {
    vec3 i = floor(p);
    vec4 a = dot(i, vec3(1., 57., 21.)) + vec4(0., 57., 21., 78.);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    a = mix(sin(cos(a) * a), sin(cos(1.+a) * (1.+a)), f.x);
    a.xy = mix(a.xz, a.yw, f.y);
    return mix(a.x, a.y, f.z);
}
void main() {
    vec3 aurora = vec3(0.1, 0.5, 0.3);
    float n = noise(vec3(vUv * 10.0, time * 0.1));
    float intensity = pow(1.0 - vNormal.y, 3.0) * (0.5 + 0.5 * sin(time * 0.5));
    vec3 glow = aurora * n * intensity;
    gl_FragColor = vec4(glow, intensity * 0.5);
}
`;// ทำการสร้าง FragmentShader ตัว แสงเหนือ
const auroraMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: auroraVertexShader,
    fragmentShader: auroraFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
}); //นำเอา VertexShader และ FragmentShader มาใส่ใน Material

const auroraMesh = new THREE.Mesh(auroraGeometry, auroraMaterial); 
scene.add(auroraMesh);

//--------------------------------------------------------------------------------------------

// handling resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    }, false);

// OrbitControl(by Mouse) setup การควบคุมการหมุนกล้องรอบวัตถุจาก การหมุนเมาส์
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; //ปิดการ Pan กล้อง


// spinning animation
function animate(){
    requestAnimationFrame(animate);
    earthMesh.rotation.y += 0.0015;
    cloudMesh.rotation.y += 0.001;
    starMesh.rotation.y -= 0.002;


    //===== Aurora Animation =====
    const time = performance.now() * 0.001; 
    auroraMaterial.uniforms.time.value = time; // Update aurora shader time

    //===Moon Orbiting===
    moonOrbitAngle += moonOrbitSpeed;
    moonMesh.position.x = Math.cos(moonOrbitAngle) * moonOrbitRadius;
    moonMesh.position.z = Math.sin(moonOrbitAngle) * moonOrbitRadius;
    // Moon rotation (assuming it's tidally locked to Earth)
    moonMesh.rotation.y = -moonOrbitAngle;

    //Camera Controlling
    controls.update();
    renderer.render(scene, camera);
    };
    animate();

