import { Component, ElementRef, OnInit, OnDestroy, viewChild, signal } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-background360',
  standalone: true,
  template: `
    <canvas #canvas></canvas>
    @if (loading()) {
      <div class="loading">Cargando imagen 360°...</div>
    }
  `,
  styles: [`
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 20px;
      z-index: 10;
    }
  `]
})
export class Background360 implements OnInit, OnDestroy {
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.Mesh;
  private animationId?: number;
  protected loading = signal(true);

  ngOnInit() {
    this.initThree();
    this.create360Image();
    this.animate();
  }

  private initThree() {
    const canvasEl = this.canvas().nativeElement;
    
    // 1. ESCENA: Contenedor de todos los objetos 3D
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Fondo negro mientras carga
    
    // 2. CÁMARA: Tu punto de vista
    // - 75: Campo de visión en grados (más alto = más amplio)
    // - aspect: Relación ancho/alto de la pantalla
    // - 0.1: Distancia mínima de renderizado
    // - 1000: Distancia máxima de renderizado
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Posicionar cámara en el centro de la esfera
    this.camera.position.set(0, 0, 0.1);
    
    // 3. RENDERER: Dibuja la escena en el canvas
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvasEl,
      antialias: true // Suaviza los bordes
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // Mejor calidad en pantallas retina
    
    // 4. RESPONSIVE: Ajustar al cambiar tamaño de ventana
    window.addEventListener('resize', () => this.onResize());
  }

  private create360Image() {
    // 1. GEOMETRÍA: Crear esfera
    // - 500: Radio de la esfera
    // - 60: Segmentos horizontales (más = más suave)
    // - 40: Segmentos verticales (más = más suave)
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    
    // 2. INVERTIR ESFERA: Para ver el interior
    // scale(-1, 1, 1) invierte el eje X, volteando la esfera
    geometry.scale(-1, 1, 1);
    
    // 3. CARGAR TEXTURA: Imagen 360° equirectangular
    const loader = new THREE.TextureLoader();
    
    // Imagen 360° real de Poly Haven (sin CORS)
    const imageUrl = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloppenheim_02.jpg';
    
    loader.load(
      imageUrl,
      // onLoad: Cuando la imagen carga exitosamente
      (texture) => {
        console.log('✅ Imagen 360° cargada');
        
        // 4. MATERIAL: Cómo se ve la superficie
        const material = new THREE.MeshBasicMaterial({
          map: texture, // Aplicar la textura
          side: THREE.BackSide // Renderizar el lado interno
        });
        
        // 5. MESH: Combinar geometría + material
        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);
        
        this.loading.set(false);
      },
      // onProgress: Mientras carga
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Cargando: ${percent.toFixed(0)}%`);
      },
      // onError: Si falla
      (error) => {
        console.error('❌ Error cargando imagen:', error);
        // Crear esfera con color de respaldo
        const material = new THREE.MeshBasicMaterial({
          color: 0x1a1a3e,
          side: THREE.BackSide
        });
        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);
        this.loading.set(false);
      }
    );
  }

  private animate() {
    // LOOP DE ANIMACIÓN: Se ejecuta ~60 veces por segundo
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Rotar la esfera lentamente en el eje Y
    if (this.sphere) {
      this.sphere.rotation.y += 0.0005;
    }
    
    // Renderizar la escena desde la perspectiva de la cámara
    this.renderer.render(this.scene, this.camera);
  }

  private onResize() {
    // Actualizar aspecto de la cámara
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Actualizar tamaño del renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy() {
    // LIMPIEZA: Liberar recursos
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.onResize());
    this.renderer.dispose();
  }
}
