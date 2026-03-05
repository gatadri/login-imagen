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

    // CAJAS DEL LOGIN
    this.createLoginBoxes();

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

  private createLoginBoxes() {
    // Caja principal del login
    const boxGeometry = new THREE.BoxGeometry(3, 4, 0.2);
    const boxMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.8
    });
    const loginBox = new THREE.Mesh(boxGeometry, boxMaterial);
    loginBox.position.set(0, 0, -10);
    this.scene.add(loginBox);

    // Caja para usuario
    const inputGeometry = new THREE.BoxGeometry(2.5, 0.5, 0.1);
    const inputMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2d2d44,
      transparent: true,
      opacity: 0.9
    });
    const userBox = new THREE.Mesh(inputGeometry, inputMaterial);
    userBox.position.set(0, 0.8, -9.8);
    this.scene.add(userBox);

    // Caja para contraseña
    const passBox = new THREE.Mesh(inputGeometry, inputMaterial);
    passBox.position.set(0, 0, -9.8);
    this.scene.add(passBox);

    // Botón de login
    const buttonGeometry = new THREE.BoxGeometry(2.5, 0.5, 0.1);
    const buttonMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.9
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(0, -0.8, -9.8);
    this.scene.add(button);
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
