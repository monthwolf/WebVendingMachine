# 智能饮料售货机

基于装饰器模式的智能饮料系统，支持饮料和配料的自由搭配，并提供AI推荐和聊天功能。

## 项目技术栈

### 前端
- React 18
- TypeScript
- NextUI (基于Tailwind CSS的UI组件库)
- GSAP (动画库)
- Three.js / React Three Fiber (3D渲染)
- Axios (HTTP请求)

### 后端
- Flask (Python Web框架)
- 装饰器设计模式
- 简单AI推荐系统

## 功能特点

- 可视化3D饮料模型展示
- 丰富的动画和交互效果
- 基于装饰器模式的饮料配置系统
- AI聊天机器人提供饮料推荐和帮助
- 个性化饮料推荐
- 订单历史记录和管理

## 快速开始

### 安装后端依赖
```bash
cd shop/backend
pip install -r requirements.txt
```

### 启动后端服务
```bash
cd shop/backend
python app.py
```

### 安装前端依赖
```bash
cd shop/frontend
npm install
```

### 启动前端服务
```bash
cd shop/frontend
npm start
```

访问 http://localhost:3000 即可看到应用界面。

## 系统架构

### 前端架构
- 使用React和TypeScript构建组件化界面
- NextUI提供现代化UI组件
- GSAP实现流畅的动画效果
- Three.js实现3D模型展示
- 基于Axios的HTTP客户端

### 后端架构
- Flask提供REST API
- 装饰器模式实现饮料和配料的组合
- 基于Python的简单AI服务

## 装饰器模式实现

本项目使用装饰器模式实现饮料和配料的自由组合。具体包括：

- 基础饮料类: `Beverage`
- 具体饮料: `Coca`, `Coffee`
- 装饰器基类: `Decorator`
- 具体装饰器: `Milk`, `Ice`

通过这种方式，我们可以动态地组合不同的饮料和配料，例如：
```python
# 制作加奶的咖啡
beverage = Coffee()
beverage = Milk(beverage)

# 制作加奶和冰的可乐
beverage = Coca()
beverage = Milk(beverage)
beverage = Ice(beverage)
```

## 3D模型与动画

项目使用Three.js和React Three Fiber创建3D饮料模型，并通过GSAP实现丰富的动画效果，包括：
- 选择饮料时的旋转动画
- 点击菜单的弹跳效果
- 添加配料的缩放效果
- 订单完成时的祝贺动画

## 贡献

欢迎提交Issue和Pull Request对项目进行改进。

## 许可

MIT License 