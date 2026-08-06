import React, { useEffect, useRef } from 'react';
import { useMap, Marker } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import useMapStore from '../../store/useMapStore';

export default function CustomModelLayer() {
  const { 'main-map': mapRef } = useMap();
  const modelLng = useMapStore(state => state.modelLng);
  const modelLat = useMapStore(state => state.modelLat);
  const modelScale = useMapStore(state => state.modelScale);
  const modelRotX = useMapStore(state => state.modelRotX);
  const modelRotY = useMapStore(state => state.modelRotY);
  const modelRotZ = useMapStore(state => state.modelRotZ);
  const setModelProps = useMapStore(state => state.setModelProps);
  
  const layerAdded = useRef(false);
  const customLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();

    const addThreeJSLayer = () => {
      if (!map || !map.getStyle()) return;
      if (map.getLayer('3d-model')) return;

      const customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          // Lighting (Dựa theo code tham khảo của user)
          // Ánh sáng động (Dynamic Light) - Sẽ được cập nhật vị trí trong render
          this.dynamicLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
          this.scene.add(this.dynamicLight);

          // Ánh sáng môi trường (Ambient)
          this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
          this.scene.add(this.ambientLight);
          
          // Hemisphere light tạo độ sáng tự nhiên cho toàn bộ mô hình
          this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
          this.hemiLight.position.set(0, 50, 0);
          this.scene.add(this.hemiLight);

          // Ánh sáng phụ lấp đầy bóng râm (Fill light)
          const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
          fillLight.position.set(100, 50, -100).normalize();
          this.scene.add(fillLight);

          // Load Model (Dùng MeshoptDecoder thay vì DRACOLoader)
          const loader = new GLTFLoader();
          loader.setMeshoptDecoder(MeshoptDecoder);

          loader.load(
            '/project-draco.glb',
            (gltf) => {
              const box = new THREE.Box3().setFromObject(gltf.scene);
              const center = box.getCenter(new THREE.Vector3());
              // Căn giữa mô hình
              gltf.scene.position.set(-center.x, -box.min.y, -center.z);
              
              // Tối ưu vật liệu để giảm thiểu Z-fighting (chớp giật) và thêm khử răng cưa (Anisotropic Filtering)
              gltf.scene.traverse((child) => {
                if (child.isMesh && child.material) {
                  // Ép chỉ render mặt trước để tránh xung đột mặt trước/mặt sau
                  child.material.side = THREE.FrontSide;
                  
                  // Thiết lập polygonOffset cho các vật liệu trong suốt nếu có
                  if (child.material.transparent) {
                    child.material.depthWrite = false;
                  }

                  // Tăng cường độ sắc nét cho texture (khử răng cưa cho góc nghiêng)
                  if (child.material.map) {
                    child.material.map.anisotropy = 16;
                  }
                }
              });

              this.model = new THREE.Group();
              this.model.add(gltf.scene);
              this.scene.add(this.model);
              
              map.triggerRepaint();
            },
            undefined,
            (error) => {
              console.error('Error loading Meshopt model:', error);
            }
          );

          this.map = map;
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
          });
          this.renderer.setPixelRatio(window.devicePixelRatio);
          this.renderer.autoClear = false;
        },
        onRemove: function (map, gl) {
          if (this.scene) {
            this.scene.traverse((child) => {
              if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
              }
            });
          }
          if (this.renderer) {
            this.renderer.dispose();
          }
        },
        render: function (gl, matrix) {
          if (!this.model) return;
          
          const currentState = useMapStore.getState();
          const { modelLng, modelLat, modelScale, modelRotX, modelRotY, modelRotZ, modelTransX, modelTransY, modelTransZ, timeOfDay } = currentState;

          // Cập nhật ánh sáng theo timeOfDay
          if (timeOfDay !== undefined && this.dynamicLight && this.ambientLight && this.hemiLight) {
            // position sun in a hemisphere arc
            const timeAngle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2; // 0h = -90deg, 6h = 0deg, 12h = 90deg, 18h = 180deg
            
            const sunX = Math.cos(timeAngle) * 500;
            const sunY = Math.sin(timeAngle) * 500;
            const sunZ = Math.sin(timeAngle) * 200; 
            
            this.dynamicLight.position.set(sunX, Math.max(sunY, -100), sunZ).normalize();

            // color temperature and intensity
            let intensity = 0;
            let ambientIntensity = 0.2;
            let hemiIntensity = 0.2;
            let lightColor = new THREE.Color(0xffffff);

            if (timeOfDay >= 5 && timeOfDay <= 7) {
              // Sunrise
              intensity = (timeOfDay - 5) / 2 * 1.2;
              ambientIntensity = 0.3 + intensity * 0.3;
              hemiIntensity = 0.3 + intensity * 0.5;
              lightColor.setHex(0xffaa66);
            } else if (timeOfDay > 7 && timeOfDay <= 16) {
              // Day
              intensity = 1.2;
              ambientIntensity = 0.8;
              hemiIntensity = 1.2;
              lightColor.setHex(0xffffee);
            } else if (timeOfDay > 16 && timeOfDay <= 18.5) {
              // Sunset
              intensity = (18.5 - timeOfDay) / 2.5 * 1.2;
              ambientIntensity = 0.3 + intensity * 0.3;
              hemiIntensity = 0.3 + intensity * 0.5;
              lightColor.setHex(0xff8844);
            } else {
              // Night
              intensity = 0.1;
              ambientIntensity = 0.1;
              hemiIntensity = 0.1;
              lightColor.setHex(0x4466ff);
            }
            
            this.dynamicLight.intensity = Math.max(0, intensity);
            this.dynamicLight.color = lightColor;
            this.ambientLight.intensity = ambientIntensity;
            this.hemiLight.intensity = hemiIntensity;
          }

          // Dùng scale gốc, không dùng scale động theo zoom để tránh lệch tâm (bị chạy)
          const finalScale = modelScale;

          // Cập nhật Model Transform trực tiếp trên Three.js Group giống code của user
          this.model.scale.set(finalScale, finalScale, finalScale);
          this.model.rotation.set(
            THREE.MathUtils.degToRad(modelRotX - 90),
            THREE.MathUtils.degToRad(modelRotY),
            THREE.MathUtils.degToRad(modelRotZ)
          );
          // Áp dụng dịch chuyển trục (X, Y, Z trong Three.js). Lưu ý: Mapbox Altitude = Three Y.
          this.model.position.set(modelTransX, modelTransZ, modelTransY);

          const modelAltitude = 0;
          // Góc xoay cố định để fix hệ toạ độ (Z-up vs Y-up)
          const modelRotate = [Math.PI / 2, 0, 0];

          const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            [modelLng, modelLat],
            modelAltitude
          );

          // Transformation matrices (Chỉ dùng góc cố định)
          const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelRotate[0]);
          const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelRotate[1]);
          const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelRotate[2]);

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              modelAsMercatorCoordinate.x,
              modelAsMercatorCoordinate.y,
              modelAsMercatorCoordinate.z
            )
            .scale(
              new THREE.Vector3(
                modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
                -modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
                modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
              )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          this.camera.projectionMatrix = m.multiply(l);
          
          // Cập nhật ánh sáng động (Đi theo góc nhìn của người dùng)
          if (this.dynamicLight) {
            const bearing = this.map.getBearing();
            const bearingRad = THREE.MathUtils.degToRad(bearing);
            this.dynamicLight.position.set(
              Math.sin(-bearingRad) * 200, 
              150, 
              Math.cos(-bearingRad) * 200
            ).normalize();
          }

          this.renderer.resetState();
          this.renderer.clearDepth();
          this.renderer.render(this.scene, this.camera);
        }
      };

      customLayerRef.current = customLayer;
      map.addLayer(customLayer, 'waterway-label');
      layerAdded.current = true;
    };

    if (map.isStyleLoaded()) {
      addThreeJSLayer();
    } else {
      map.on('style.load', addThreeJSLayer);
    }
    
    map.on('style.load', addThreeJSLayer);

    return () => {
      if (layerAdded.current && map && map.getStyle() && map.getLayer('3d-model')) {
        map.removeLayer('3d-model');
      }
      map.off('style.load', addThreeJSLayer);
      layerAdded.current = false;
    };
  }, [mapRef]);

  // When state changes, we must force Mapbox to repaint to see the 3D model update immediately
  useEffect(() => {
    if (mapRef && mapRef.getMap()) {
      mapRef.getMap().triggerRepaint();
    }
  }, [modelLng, modelLat, modelScale, modelRotX, modelRotY, modelRotZ, mapRef]);

  const onMarkerDrag = (e) => {
    setModelProps({
      modelLng: e.lngLat.lng,
      modelLat: e.lngLat.lat
    });
  };

  return (
    <Marker 
      longitude={modelLng} 
      latitude={modelLat} 
      draggable
      onDrag={onMarkerDrag}
      anchor="bottom"
    >
      <div style={{
        fontSize: '24px',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
        cursor: 'grab'
      }}>📍</div>
    </Marker>
  );
}
