import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface BeverageModelProps {
  type: string;
  isSelected?: boolean;
}

// 可乐模型
const CocaBottle: React.FC<{ isSelected?: boolean }> = ({ isSelected }) => {
  const bottleRef = useRef<THREE.Group>(null);
  const previousState = useRef<boolean | undefined>(isSelected);
  const rotationAnimation = useRef<gsap.core.Tween | null>(null);
  const positionAnimation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (bottleRef.current && previousState.current !== isSelected) {
      // 清理动画
      if (rotationAnimation.current) {
        rotationAnimation.current.kill();
      }
      if (positionAnimation.current) {
        positionAnimation.current.kill();
      }
      
      if (isSelected) {
        // 旋转动画
        rotationAnimation.current = gsap.to(bottleRef.current.rotation, {
          y: bottleRef.current.rotation.y + Math.PI * 2,
          duration: 1.5,
          ease: 'bounce.out'
        });
        
        // 上下跳动动画
        positionAnimation.current = gsap.to(bottleRef.current.position, {
          y: 0.5,
          duration: 0.7,
          ease: 'back.out(1.7)',
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // 确保完成后回到原位
            if (bottleRef.current) {
              bottleRef.current.position.y = 0;
            }
          }
        });
      }
      previousState.current = isSelected;
    }
    
    // 清理函数
    return () => {
      if (rotationAnimation.current) {
        rotationAnimation.current.kill();
      }
      if (positionAnimation.current) {
        positionAnimation.current.kill();
      }
    };
  }, [isSelected]);

  // 持续的小幅度旋转效果
  useFrame((state, delta) => {
    if (bottleRef.current) {
      bottleRef.current.rotation.y += delta * 0.5; // 使用delta确保旋转速度与帧率无关
    }
  });

  return (
    <group ref={bottleRef} scale={isSelected ? 1.1 : 1}>
      {/* 瓶身 */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.5, 2.5, 32]} />
        <meshStandardMaterial color="#e60000" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* 瓶盖 */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 标签 */}
      <mesh position={[0, 0.2, 0.55]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// 咖啡模型
const CoffeeCup: React.FC<{ isSelected?: boolean }> = ({ isSelected }) => {
  const cupRef = useRef<THREE.Group>(null);
  const previousState = useRef<boolean | undefined>(isSelected);
  const rotationAnimation = useRef<gsap.core.Tween | null>(null);
  const positionAnimation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (cupRef.current && previousState.current !== isSelected) {
      // 清理动画
      if (rotationAnimation.current) {
        rotationAnimation.current.kill();
      }
      if (positionAnimation.current) {
        positionAnimation.current.kill();
      }
      
      if (isSelected) {
        // 旋转动画
        rotationAnimation.current = gsap.to(cupRef.current.rotation, {
          y: cupRef.current.rotation.y + Math.PI * 2,
          duration: 1.5,
          ease: 'bounce.out'
        });
        
        // 上下跳动动画
        positionAnimation.current = gsap.to(cupRef.current.position, {
          y: 0.5,
          duration: 0.7,
          ease: 'back.out(1.7)',
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // 确保完成后回到原位
            if (cupRef.current) {
              cupRef.current.position.y = 0;
            }
          }
        });
      }
      previousState.current = isSelected;
    }
    
    // 清理函数
    return () => {
      if (rotationAnimation.current) {
        rotationAnimation.current.kill();
      }
      if (positionAnimation.current) {
        positionAnimation.current.kill();
      }
    };
  }, [isSelected]);

  // 持续的小幅度旋转效果
  useFrame((state, delta) => {
    if (cupRef.current) {
      cupRef.current.rotation.y += delta * 0.5; // 使用delta确保旋转速度与帧率无关
    }
  });

  return (
    <group ref={cupRef} scale={isSelected ? 1.1 : 1}>
      {/* 杯身 */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.6, 1.5, 32]} />
        <meshStandardMaterial color="#784315" roughness={0.5} />
      </mesh>
      {/* 杯盖 */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 杯柄 */}
      <mesh position={[0.9, -0.1, 0]} castShadow>
        <torusGeometry args={[0.3, 0.1, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#784315" roughness={0.5} />
      </mesh>
      {/* 咖啡 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 32]} />
        <meshStandardMaterial color="#3d2314" />
      </mesh>
    </group>
  );
};

export const BeverageModel: React.FC<BeverageModelProps> = ({ 
  type,
  isSelected = false
}) => {
  return (
    <Canvas className="w-full h-64 bg-transparent" shadows>
      <ambientLight intensity={0.5} />
      <spotLight 
        position={[10, 15, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1} 
        castShadow 
      />
      <PerspectiveCamera makeDefault position={[0, 1, 5]} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 2.2} 
      />
      
      {type === 'coca' ? (
        <CocaBottle isSelected={isSelected} />
      ) : (
        <CoffeeCup isSelected={isSelected} />
      )}
    </Canvas>
  );
}; 