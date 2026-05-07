import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ARPreview = ({ modelUrl, className = 'w-100 h-96 border rounded shadow-lg' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, controls, loader, model;

    const init = () => {
      // Scene
      scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Loader
      loader = new GLTFLoader();

      // Load model
      if (modelUrl) {
        loader.load(modelUrl, (gltf) => {
          model = gltf.scene;
          model.scale.set(2, 2, 2);
          model.position.y = -1;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(model);
        });
      }

      // Animate
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Responsive
      const handleResize = () => {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);
    };

    init();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <div 
      ref={mountRef} 
      className={`ar-preview ${className}`}
      style={{ height: '400px', position: 'relative' }}
      title="Modèle 3D interactif - Zoomez/rotatez avec souris"
    >
      {!modelUrl && (
        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
          <i className="bi bi-cube fs-1 opacity-50"></i>
          <div className="ms-3">
            <div>Pas de modèle 3D</div>
            <small>Upload via admin pour AR Preview</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARPreview;

