#!/usr/bin/env python
# -*- coding: utf-8 -*-

# 前端使用的自动选择代码模板
AUTO_SELECT_TEMPLATE = """// 自动选择饮品和配料
// 可以根据需要修改以下变量
const targetBeverage = "{{BEVERAGE_ID}}"; // 饮品ID，例如: "latte"
const targetCondiments = [
  { id: "{{CONDIMENT_ID}}", quantity: {{QUANTITY}} }, // 配料ID和数量，例如: { id: "sugar", quantity: 2 }
  // 可以添加更多配料...
];

// 清空当前选择并返回到饮品选择页
function clearCurrentSelection() {
  console.log('正在清空当前选择...');
  
  // 查找清空按钮并点击
  const clearButton = document.querySelector('button[title="清空订单"]');
  if (clearButton) {
    clearButton.click();
    console.log('已点击清空按钮');
    return true;
  }
  
  // 如果没找到清空按钮，可能是没有选择饮品，直接返回
  return true;
}

// 检查当前是否在配料选择页，如果是则返回到饮品选择页
function checkAndReturnToBeveragePage(callback) {
  // 检查是否在配料选择页（通过查找返回按钮）
  const backButton = document.querySelector('button[aria-label="返回饮品选择"]');
  if (backButton) {
    console.log('当前在配料选择页，返回到饮品选择页');
    backButton.click();
    setTimeout(callback, 300);
  } else {
    // 如果已经在饮品选择页，直接执行回调
    callback();
  }
}

// 执行选择饮品
function selectBeverage() {
  // 获取所有饮品卡片
  const beverageCards = document.querySelectorAll('[data-beverage-id]');
  let found = false;
  
  // 遍历查找目标饮品
  beverageCards.forEach(card => {
    const beverageId = card.getAttribute('data-beverage-id');
    if (beverageId === targetBeverage) {
      // 模拟点击选择饮品
      card.click();
      found = true;
      console.log(`已选择饮品: ${beverageId}`);
      
      // 选择饮品后，点击"添加配料"按钮
      setTimeout(() => {
        const addCondimentsBtn = document.querySelector('[data-action="add-condiments"]');
        if (addCondimentsBtn) {
          addCondimentsBtn.click();
          console.log('点击添加配料按钮');
          
          // 添加延迟以确保配料面板已加载
          setTimeout(selectCondiments, 300);
        }
      }, 300);
    }
  });
  
  if (!found) {
    console.error(`未找到指定饮品: ${targetBeverage}`);
  }
}

// 执行选择配料
function selectCondiments() {
  // 使用顺序处理配料，而不是并行处理
  const processCondiments = (index) => {
    if (index >= targetCondiments.length) {
      // 所有配料都处理完毕，点击下单按钮
      setTimeout(() => {
        const orderButton = document.querySelector('[data-action="place-order"]');
        if (orderButton) {
          orderButton.click();
          console.log('点击下单按钮');
        }
      }, 500);
      return;
    }
    
    const targetItem = targetCondiments[index];
    // 获取所有配料卡片
    const condimentCards = document.querySelectorAll('[data-condiment-id]');
    let found = false;
    
    // 遍历查找目标配料
    condimentCards.forEach(card => {
      const condimentId = card.getAttribute('data-condiment-id');
      if (condimentId === targetItem.id) {
        found = true;
        
        // 先检查当前已选择的份数（显示在UI上的数量）
        const quantityElement = card.querySelector('span.font-mono.text-white');
        let currentQuantity = 0;
        if (quantityElement) {
          currentQuantity = parseInt(quantityElement.textContent || '0', 10) || 0;
        }
        
        // 如果已经有足够份数，不需要再点击
        if (currentQuantity >= targetItem.quantity) {
          console.log(`配料 ${condimentId} 已经有 ${currentQuantity} 份，无需再点击`);
          setTimeout(() => processCondiments(index + 1), 300);
          return;
        }
        
        // 计算需要点击的次数（targetItem.quantity - currentQuantity）
        const clicksNeeded = targetItem.quantity - currentQuantity;
        console.log(`配料 ${condimentId} 需要点击 ${clicksNeeded} 次，从 ${currentQuantity} 到 ${targetItem.quantity}`);
        
        // 查找加号按钮
        const plusButton = card.querySelector('[data-action="increase"]');
        if (plusButton) {
          // 逐个点击，每次点击之间添加延迟
          const clickButton = (clickCount) => {
            if (clickCount >= clicksNeeded) {
              // 完成当前配料的点击，处理下一个配料
              console.log(`完成配料: ${condimentId}, 从 ${currentQuantity} 增加到 ${targetItem.quantity}`);
              setTimeout(() => processCondiments(index + 1), 300);
              return;
            }
            
            // 执行点击
            plusButton.click();
            console.log(`点击配料: ${condimentId}, 第 ${clickCount + 1}次/${clicksNeeded}次`);
            
            // 延迟后进行下一次点击
            setTimeout(() => clickButton(clickCount + 1), 150);
          };
          
          // 开始点击
          clickButton(0);
        } else {
          // 如果找不到按钮，继续处理下一个配料
          console.error(`未找到配料增加按钮: ${condimentId}`);
          setTimeout(() => processCondiments(index + 1), 300);
        }
      }
    });
    
    if (!found) {
      console.error(`未找到指定配料: ${targetItem.id}`);
      // 继续处理下一个配料
      setTimeout(() => processCondiments(index + 1), 300);
    }
  };
  
  // 开始处理第一个配料
  processCondiments(0);
}

// 开始自动选择流程的函数
function startAutomation() {
  console.log('开始自动选择流程...');
  
  // 1. 清空当前选择
  clearCurrentSelection();
  
  // 2. 确保我们在饮品选择页，然后选择饮品
  checkAndReturnToBeveragePage(function() {
    // 3. 延迟后选择饮品
    setTimeout(selectBeverage, 500);
  });
}

// 开始执行自动选择流程
startAutomation();
""" 