import { Recommendation } from '../types';

// 推荐组合列表
const recommendations: Recommendation[] = [
  {
    beverage: 'coffee',
    condiments: ['milk', 'sugar'],
    reason: '经典搭配',
    explanation: '牛奶和糖的完美比例让咖啡更加香浓顺滑。'
  },
  {
    beverage: 'latte',
    condiments: ['vanilla', 'cream'],
    reason: '香草风味',
    explanation: '香草糖浆和奶油让拿铁更加香甜可口。'
  },
  {
    beverage: 'americano',
    condiments: ['ice', 'caramel'],
    reason: '清爽解暑',
    explanation: '冰块和焦糖的搭配让美式咖啡更加清爽可口。'
  },
  {
    beverage: 'mocha',
    condiments: ['cream', 'chocolate'],
    reason: '巧克力控首选',
    explanation: '额外的巧克力酱和奶油让摩卡更加浓郁。'
  },
  {
    beverage: 'cola',
    condiments: ['ice'],
    reason: '清凉饮品',
    explanation: '冰块让可乐更加清爽解暑。'
  },
  {
    beverage: 'sprite',
    condiments: ['ice'],
    reason: '夏日特饮',
    explanation: '冰块让雪碧更加清凉提神。'
  },
  {
    beverage: 'greenTea',
    condiments: ['honey', 'ice'],
    reason: '健康之选',
    explanation: '蜂蜜的甜味和冰块的清爽让绿茶更加可口。'
  },
  {
    beverage: 'blackTea',
    condiments: ['milk', 'sugar'],
    reason: '英式风味',
    explanation: '牛奶和糖的搭配让红茶更加醇厚。'
  },
  {
    beverage: 'orangeJuice',
    condiments: ['ice'],
    reason: '果汁推荐',
    explanation: '冰块让橙汁更加清爽可口。'
  },
  {
    beverage: 'appleJuice',
    condiments: ['ice'],
    reason: '果汁推荐',
    explanation: '冰块让苹果汁更加清凉解暑。'
  }
];

// 获取随机推荐
export const getRandomRecommendation = (): Recommendation => {
  const index = Math.floor(Math.random() * recommendations.length);
  return recommendations[index];
}; 