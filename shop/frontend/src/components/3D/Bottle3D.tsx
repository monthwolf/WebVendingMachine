import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface Bottle3DProps {
  beverageImage?: string;
  isRolling: boolean;
  onAnimationComplete?: () => void;
}

const Bottle3D: React.FC<Bottle3DProps> = ({ 
  beverageImage, 
  isRolling,
  onAnimationComplete 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bottleRef = useRef<THREE.Group | null>(null);
  const animationCompleteRef = useRef<boolean>(false);
  
  // 初始化3D场景
  useEffect(() => {
    if (!mountRef.current) return;
    
    console.log('Initializing 3D scene');
    
    // 创建场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      45, 
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 0, 5);
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // 透明背景
    
    // 清除当前容器内容
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    
    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 创建一个简单的瓶子几何体
    const bottleGroup = new THREE.Group();
    bottleRef.current = bottleGroup;
    
    // 瓶身 - 使用圆柱体，但调整尺寸使其更像饮料瓶
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2.2, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x87ceeb, 
      transparent: true,
      opacity: 0.7,
      shininess: 30
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bottleGroup.add(body);
    
    // 瓶颈 - 细一点的圆柱体
    const neckGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 32);
    const neckMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xaaddee, 
      transparent: true,
      opacity: 0.8,
      shininess: 30
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 1.3;
    bottleGroup.add(neck);
    
    // 瓶盖 - 圆柱体
    const capGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32);
    const capMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x444444,
      shininess: 60
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.6;
    bottleGroup.add(cap);
    
    // 将瓶子横着放置并移到上方（画面外）
    bottleGroup.rotation.z = Math.PI / 2; // 横着放
    bottleGroup.position.set(0, 4, 0); // 放在上方，开始时不可见
    bottleGroup.scale.set(0.7, 0.7, 0.7); // 适当缩小瓶子尺寸
    
    scene.add(bottleGroup);
    
    // 渲染场景
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      requestAnimationFrame(animate);
      
      if (bottleRef.current && !isRolling && !animationCompleteRef.current) {
        // 非动画状态下的微小旋转
        bottleRef.current.rotation.y += 0.01;
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 初始调整一次大小
    setTimeout(handleResize, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // 清理资源
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // 清除场景中的所有对象
      if (sceneRef.current) {
        while(sceneRef.current.children.length > 0) { 
          sceneRef.current.remove(sceneRef.current.children[0]); 
        }
      }
    };
  }, []);
  
  // 处理滚动动画
  useEffect(() => {
    if (!bottleRef.current || !isRolling) return;
    
    console.log('Starting bottle animation - rolling horizontally from top to bottom');
    
    // 创建动画
    const timeline = gsap.timeline({
      onComplete: () => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        animationCompleteRef.current = true;
        console.log('Animation completed');
      }
    });
    
    // 瓶子从上方横着滚到下方的动画
    timeline
      // 等待一小段时间，让盖子完全打开
      .to({}, { duration: 0.2 })
      
      // 第一段：瓶子开始向下移动
      .to(bottleRef.current.position, {
        y: 1.5,
        duration: 0.4,
        ease: "power1.in"
      })
      
      // 第二段：瓶子继续下落并同时沿自身中心轴旋转（模拟滚动）
      .to(bottleRef.current.position, {
        y: -0.5, // 移动到底部
        duration: 0.8,
        ease: "power2.out"
      })
      
      // 瓶子旋转动画，与位移同时进行（模拟横着滚）
      .to(bottleRef.current.rotation, {
        z: Math.PI / 2 + Math.PI * 2, // 保持横着姿态，但绕轴旋转两圈
        duration: 0.8,
        ease: "power1.inOut"
      }, "-=0.8") // 与上一个动画同时开始
      
      // 在下落过程中，瓶子还会轻微前后倾斜，增加真实感
      .to(bottleRef.current.rotation, {
        x: 0.2, // 轻微前倾
        duration: 0.2,
        ease: "power1.in"
      }, "-=0.7")
      .to(bottleRef.current.rotation, {
        x: -0.2, // 轻微后倾
        duration: 0.3,
        ease: "power1.inOut"
      }, "-=0.5")
      .to(bottleRef.current.rotation, {
        x: 0, // 恢复直立
        duration: 0.2,
        ease: "power1.out"
      }, "-=0.2")
      
      // 到底后轻微晃动
      .to(bottleRef.current.position, {
        x: -0.2,
        duration: 0.15,
        ease: "power1.out"
      })
      .to(bottleRef.current.position, {
        x: 0.2,
        duration: 0.15,
        ease: "power1.inOut"
      })
      .to(bottleRef.current.position, {
        x: 0,
        duration: 0.15,
        ease: "power1.out"
      });
    
    return () => {
      timeline.kill();
    };
  }, [isRolling, onAnimationComplete]);
  
  // 如果饮料图像变化，更新材质
  useEffect(() => {
    if (!bottleRef.current || !beverageImage) return;
    
    console.log('Updating beverage texture:', beverageImage);
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    textureLoader.load(
      beverageImage,
      (texture) => {
        if (bottleRef.current && bottleRef.current.children.length > 0) {
          // 获取瓶身
          const bottleBody = bottleRef.current.children[0] as THREE.Mesh;
          const material = bottleBody.material as THREE.MeshPhongMaterial;
          
          // 调整纹理参数
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);
          texture.offset.set(0, 0);
          
          // 适当缩放以适应瓶身
          texture.repeat.set(2, 2);
          
          // 应用纹理
          material.map = texture;
          material.color.set(0xffffff); // 使用白色底色以不影响纹理颜色
          material.needsUpdate = true;
          
          console.log('Texture applied successfully');
        }
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
    
    // 如果是固定饮料，直接设置瓶身颜色
    if (beverageImage.includes('coffee')) {
      const bottleBody = bottleRef.current.children[0] as THREE.Mesh;
      const material = bottleBody.material as THREE.MeshPhongMaterial;
      material.color.set(0x5E350B); // 咖啡色
      material.needsUpdate = true;
    } else if (beverageImage.includes('cola')) {
      const bottleBody = bottleRef.current.children[0] as THREE.Mesh;
      const material = bottleBody.material as THREE.MeshPhongMaterial;
      material.color.set(0x2D0A00); // 可乐色
      material.needsUpdate = true;
    } else if (beverageImage.includes('green-tea')) {
      const bottleBody = bottleRef.current.children[0] as THREE.Mesh;
      const material = bottleBody.material as THREE.MeshPhongMaterial;
      material.color.set(0x7CBA6D); // 绿茶色
      material.needsUpdate = true;
    } else if (beverageImage.includes('orange')) {
      const bottleBody = bottleRef.current.children[0] as THREE.Mesh;
      const material = bottleBody.material as THREE.MeshPhongMaterial;
      material.color.set(0xFF9D2A); // 橙色
      material.needsUpdate = true;
    }
    
  }, [beverageImage]);
  
  return (
    <div 
      ref={mountRef} 
      className="w-full h-full" 
      style={{ 
        minHeight: '200px', 
        border: '0px solid red',
        position: 'relative',
        zIndex: 30
      }}
    />
  );
};

export default Bottle3D; 