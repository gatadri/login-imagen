import { Component, ElementRef, OnInit, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-background360',
  standalone: true,
  template: '<canvas #canvas></canvas>',
  styles: [`
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class Background360 implements OnInit, OnDestroy {
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationId?: number;

  ngOnInit() {
    this.init();
  }

  private init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas().nativeElement 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Escena
    this.scene = new THREE.Scene();

    // Cámara
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 0, 0.1);

    // Esfera invertida
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Textura
    const texture = new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg'
    );

    // Material + Mesh
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    // Controles de mouse para girar
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = -0.5;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Animar
    this.animate();

    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
