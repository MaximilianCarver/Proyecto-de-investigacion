// Cursor técnico
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
    // Animación más rápida para dar sensación de precisión
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.05, ease: "none" });
});

document.querySelectorAll('a, .content-box').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.5, rotate: 45, backgroundColor: "var(--text-main)" }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, rotate: 0, backgroundColor: "var(--primary)" }));
});

// THREE.JS - ESCENA INDUSTRIAL
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const container = document.getElementById('rocket-canvas');

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ILUMINACIÓN DRAMÁTICA (Estudio técnico)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Muy oscura
scene.add(ambientLight);

// Luz principal blanca muy fuerte
const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(5, 10, 7);
scene.add(mainLight);

// Luz de relleno naranja por debajo/atrás
const accentLight = new THREE.PointLight(0xff4d00, 5, 20);
accentLight.position.set(-5, -5, -5);
scene.add(accentLight);

let rocket;
const loader = new THREE.OBJLoader();

loader.load('cohete.obj', (obj) => {
    rocket = obj;
    
    // AÑADIDO: Reducción del tamaño del cohete
    rocket.scale.set(0.6, 0.6, 0.6);

    // Material industrial oscuro para el OBJ importado
    rocket.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 0.4,
                metalness: 0.8
            });
        }
    });
    scene.add(rocket);
    const box = new THREE.Box3().setFromObject(rocket);
    const center = box.getCenter(new THREE.Vector3());
    rocket.position.sub(center);
}, undefined, (err) => {
    // Fallback: Si no carga, crea un cilindro técnico wireframe
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444, wireframe: true });
    rocket = new THREE.Mesh(geo, mat);
    scene.add(rocket);
});

camera.position.set(0, 0, 10);

// VARIABLES PARA INERCIA DEL SCROLL (Para que el movimiento sea elegante)
let targetScroll = 0;
let currentScroll = 0;

window.addEventListener('scroll', () => {
    targetScroll = window.scrollY / (document.body.offsetHeight - window.innerHeight);
});

// Función de interpolación lineal (Lerp)
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Acercar suavemente el scroll actual al objetivo (Crea el efecto "Smooth Scroll" en el 3D)
    currentScroll = lerp(currentScroll, targetScroll, 0.05);

    if(rocket) {
        // MOVIMIENTO DEL COHETE COREOGRAFIADO CON EL SCROLL SUAVIZADO
        
        // 1. Desplazamiento Y (sube un poco)
        rocket.position.y = (currentScroll * 3) - 0.5;

        // 2. Movimiento X (Esquiva el texto: Centro -> Izquierda -> Derecha -> Centro)
        // Usamos Math.sin para curvar la trayectoria a medida que bajamos
        const dodgeX = Math.sin(currentScroll * Math.PI * 2) * 2.5; 
        rocket.position.x = lerp(rocket.position.x, dodgeX, 0.1);

        // 3. Órbita de la cámara
        const radius = 8 + (currentScroll * 4); // Se aleja gradualmente
        // La cámara da casi una vuelta completa alrededor del cohete
        const angle = currentScroll * Math.PI * 1.8; 
        
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = Math.cos(angle) * radius;
        
        // 4. Inclinación dinámica para dar sensación de velocidad (pitch)
        rocket.rotation.x = currentScroll * 0.5;

        // La cámara siempre lo mira
        camera.lookAt(rocket.position.x, rocket.position.y, 0);

        // Rotación natural constante en Y
        rocket.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});