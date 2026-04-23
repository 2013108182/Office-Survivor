import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, FlaskConical, Sparkles, AlertCircle, Flame, 
  Store, Coins, Star, Users, ArrowRight, BookOpen,
  Search, Eye, ShoppingBag, X, PackageOpen, Target,
  ScrollText, CheckCircle2, XCircle, Info
} from 'lucide-react';

const INGREDIENTS = [
  { id: '1', emoji: '🔴', name: '붉은 이슬', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: '2', emoji: '🔵', name: '푸른 깃털', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: '3', emoji: '🐉', name: '용의 비늘', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { id: '4', emoji: '🧚', name: '요정 가루', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: '5', emoji: '🌊', name: '심해 소금', color: 'bg-cyan-100 border-cyan-300 text-cyan-700' },
  { id: '6', emoji: '🦄', name: '유니콘 뿔', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: '7', emoji: '🌱', name: '맨드레이크', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: '8', emoji: '🕸️', name: '밤의 거미줄', color: 'bg-gray-100 border-gray-400 text-gray-700' },
  { id: '9', emoji: '🌙', name: '달빛 결정', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { id: '10', emoji: '🍄', name: '별빛 버섯', color: 'bg-orange-100 border-orange-300 text-orange-700' }
];

const POTION_DB = {
  "깊은 밤의 숙면 물약": { slots: 3, maxAttempts: 8, baseReward: 35 },
  "올빼미의 시야 물약": { slots: 3, maxAttempts: 8, baseReward: 35 },
  "천상의 목소리 영약": { slots: 3, maxAttempts: 8, baseReward: 40 },
  "광속의 깃털 물약": { slots: 3, maxAttempts: 8, baseReward: 45 },
  "신속의 치유 물약": { slots: 4, maxAttempts: 10, baseReward: 50 },
  "맹독성 가스 물약": { slots: 4, maxAttempts: 10, baseReward: 55 },
  "마력 폭주 영약": { slots: 4, maxAttempts: 10, baseReward: 60 },
  "거인의 힘 물약": { slots: 4, maxAttempts: 10, baseReward: 65 },
  "그림자 걸음 물약": { slots: 4, maxAttempts: 10, baseReward: 70 },
  "눈부신 오로라 물약": { slots: 5, maxAttempts: 12, baseReward: 85 },
  "용의 숨결 물약": { slots: 5, maxAttempts: 12, baseReward: 90 },
  "시간 역행의 영약": { slots: 5, maxAttempts: 12, baseReward: 95 },
  "태양 극복의 영약": { slots: 5, maxAttempts: 12, baseReward: 100 }
};

const POTION_CATALOG = Object.keys(POTION_DB);

const CUSTOMER_DATA = [
  {
    type: 'villager', emoji: '👨‍🌾', name: '마을 농부',
    quests: [
      { dialogue: "요즘 잠을 통 못 자서 그러는데... 푹 잘 수 있는 약 하나 만들어 주시오.", potionName: "깊은 밤의 숙면 물약" },
      { dialogue: "밭일 하다가 허리를 크게 다쳤소. 금방 낫는 약이 필요하오.", potionName: "신속의 치유 물약" },
      { dialogue: "잡초가 너무 무성해서 골치요. 싹 다 말라 죽일 독한 약 없소?", potionName: "맹독성 가스 물약" },
      { dialogue: "장작을 패야 하는데 기운이 없구려. 힘이 솟는 약을 지어주시오.", potionName: "거인의 힘 물약" },
      { dialogue: "요즘 밤눈이 어두워져서 밤길 걷기가 무섭소.", potionName: "올빼미의 시야 물약" }
    ]
  },
  {
    type: 'bard', emoji: '🧑‍🎤', name: '떠돌이 음유시인',
    quests: [
      { dialogue: "내일 왕궁 공연이 있소. 목소리가 꾀꼬리처럼 청아해지는 약이 필요하오!", potionName: "천상의 목소리 영약" },
      { dialogue: "사흘 밤낮으로 작곡을 해야 하오. 잠이 확 깨는 영약이 필요하오!", potionName: "마력 폭주 영약" },
      { dialogue: "무대에서 돋보이고 싶소! 온몸에서 빛이 나는 약을 주시오!", potionName: "눈부신 오로라 물약" },
      { dialogue: "손가락이 베여서 류트 연주가 힘들구려. 흉터 없이 낫는 약이 있소?", potionName: "신속의 치유 물약" },
      { dialogue: "너무 긴장해서 잠이 안 오오... 무대에 서기 전 푹 쉬고 싶소.", potionName: "깊은 밤의 숙면 물약" }
    ]
  },
  {
    type: 'fairy', emoji: '🧚‍♀️', name: '장난꾸러기 요정',
    quests: [
      { dialogue: "인간들한테 장난칠래! 눈에 보이지 않을 만큼 짱 빨라지는 걸로 줘!", potionName: "광속의 깃털 물약" },
      { dialogue: "아무도 모르게 다가가서 놀래켜 줄 거야. 발소리를 없애줘!", potionName: "그림자 걸음 물약" },
      { dialogue: "친구한테 냄새나는 장난을 칠 거야! 지독한 냄새가 나는 약 있어?", potionName: "맹독성 가스 물약" },
      { dialogue: "반짝반짝 빛나는 요정이 되고 싶어! 빛가루가 떨어지는 약을 줘!", potionName: "눈부신 오로라 물약" },
      { dialogue: "인간들의 물건을 번쩍 들어올릴 만큼 힘이 세지는 약을 줘!", potionName: "거인의 힘 물약" }
    ]
  },
  {
    type: 'knight', emoji: '💂‍♂️', name: '상처입은 기사',
    quests: [
      { dialogue: "전투 중에 다쳤소! 상처가 금방 아무는 강력 약이 필요하오!", potionName: "신속의 치유 물약" },
      { dialogue: "적진에 몰래 잠입해야 하오. 그림자처럼 기척을 지우는 약을 주시오.", potionName: "그림자 걸음 물약" },
      { dialogue: "야간 정찰 임무를 맡았소. 칠흑 같은 어둠 속에서도 적을 볼 수 있게 해주시오.", potionName: "올빼미의 시야 물약" },
      { dialogue: "거대한 몬스터를 상대해야 하오. 바위도 부술 수 있는 괴력을 주시오!", potionName: "거인의 힘 물약" },
      { dialogue: "용의 브레스도 견뎌낼 수 있는 화염 마법 약이 필요하오!", potionName: "용의 숨결 물약" }
    ]
  },
  {
    type: 'wizard', emoji: '🧙‍♂️', name: '괴짜 마법사',
    quests: [
      { dialogue: "내 마나가 바닥났어! 마나를 폭발적으로 채워줄 영약이 필요한데, 할 수 있겠나?", potionName: "마력 폭주 영약" },
      { dialogue: "새로운 마법을 연구하다가 폭발이 일어났네. 화상을 치료할 약을 주게.", potionName: "신속의 치유 물약" },
      { dialogue: "연구를 너무 오래 했더니 눈이 침침하군. 시야가 맑아지는 약이 필요해.", potionName: "올빼미의 시야 물약" },
      { dialogue: "과거로 돌아가서 내 실수를 바로잡고 싶네. 시간의 흐름을 비트는 약을 주게!", potionName: "시간 역행의 영약" },
      { dialogue: "마법 실험에 쓸 아주 강력하고 위험한 독이 필요하네.", potionName: "맹독성 가스 물약" }
    ]
  },
  {
    type: 'witch', emoji: '🧙‍♀️', name: '늪지대 마녀',
    quests: [
      { dialogue: "히히히... 내 솥에 넣을 아주 지독하고 강력한 독약이 하나 필요해.", potionName: "맹독성 가스 물약" },
      { dialogue: "젊고 예쁜 시절로 돌아가고 싶어. 주름이 쫙 펴지는 빛나는 약을 다오.", potionName: "눈부신 오로라 물약" },
      { dialogue: "하늘을 빗자루 없이 날아다니고 싶어! 깃털처럼 가벼워지는 약을 줘!", potionName: "광속의 깃털 물약" },
      { dialogue: "어둠 속에서 길 잃은 아이들을 찾아야 해. 밤눈이 밝아지는 약이 필요해.", potionName: "올빼미의 시야 물약" },
      { dialogue: "마법을 너무 많이 써서 기력이 쇠했어. 마력을 꽉 채워주는 약을 다오.", potionName: "마력 폭주 영약" }
    ]
  },
  {
    type: 'thief', emoji: '🥷', name: '의심스러운 도적',
    quests: [
      { dialogue: "발소리를 없애주는 약... 질문은 받지 않겠어. 돈은 두둑이 주지.", potionName: "그림자 걸음 물약" },
      { dialogue: "경비병의 눈을 피해야 해. 순식간에 도망칠 수 있는 약을 줘.", potionName: "광속의 깃털 물약" },
      { dialogue: "금고 문이 너무 무거워. 혼자서도 번쩍 들 수 있는 힘이 필요해.", potionName: "거인의 힘 물약" },
      { dialogue: "달빛도 없는 밤에 임무를 수행해야 해. 어둠 속성 시야 물약 있나?", potionName: "올빼미의 시야 물약" },
      { dialogue: "경비견을 조용히 잠재울 약이 필요해. 냄새 없는 수면제로.", potionName: "깊은 밤의 숙면 물약" }
    ]
  },
  {
    type: 'noble', emoji: '🤴', name: '허영심 많은 귀족',
    quests: [
      { dialogue: "내일 파티가 있어요. 피부에서 빛이 나는 최고급 미용 약으로 준비하세요.", potionName: "눈부신 오로라 물약" },
      { dialogue: "최근 암살 위협에 시달려 잠을 못 자요. 아주 깊게 잠드는 약을 주세요.", potionName: "깊은 밤의 숙면 물약" },
      { dialogue: "무도회에서 누구보다 가볍고 우아하게 춤추고 싶어요.", potionName: "광속의 깃털 물약" },
      { dialogue: "연회에서 독을 마신 것 같아요! 당장 해독과 치유를 해주는 약을!!", potionName: "신속의 치유 물약" },
      { dialogue: "목소리가 너무 쉬었어요. 연설을 위해 성대를 맑게 해주는 약을 주시오.", potionName: "천상의 목소리 영약" }
    ]
  },
  {
    type: 'vampire', emoji: '🧛‍♂️', name: '창백한 뱀파이어',
    quests: [
      { dialogue: "햇빛을 견딜 수 있는 약이 필요하다... 피보다 비싼 값을 치르지.", potionName: "태양 극복의 영약" },
      { dialogue: "인간들의 마을에 섞여 들어가야 해. 내 기척과 냄새를 완전히 지워라.", potionName: "그림자 걸음 물약" },
      { dialogue: "오랜 세월을 살다 보니 몸이 둔해졌어. 폭발적인 힘을 낼 약을 다오.", potionName: "거인의 힘 물약" },
      { dialogue: "사냥꾼들의 은 화살에 맞았다... 재생력을 극한으로 끌어올리는 약을 줘.", potionName: "신속의 치유 물약" },
      { dialogue: "수백 년 전의 기억이 흐릿해. 과거를 엿볼 수 있는 약을 만들어다오.", potionName: "시간 역행의 영약" }
    ]
  }
];

const ITEM_COSTS = { hintIngredient: 5, hintSlot: 15 };

export default function App() {
  const [appState, setAppState] = useState('start');
  const [day, setDay] = useState(1);
  const [money, setMoney] = useState(0);
  const [reputation, setReputation] = useState(50);
  
  const [inventory, setInventory] = useState({ hintIngredient: 0, hintSlot: 0 });
  const [showShopModal, setShowShopModal] = useState(false);
  const [activeItemMode, setActiveItemMode] = useState(null);
  const [knownIngredients, setKnownIngredients] = useState({});
  const [knownSlots, setKnownSlots] = useState([]);

  const [dailyCustomers, setDailyCustomers] = useState([]);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
  
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisFeedback, setDiagnosisFeedback] = useState(null);

  const [secretRecipe, setSecretRecipe] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [brewPhase, setBrewPhase] = useState('idle'); 
  const [effectText, setEffectText] = useState('');
  const [minigameResult, setMinigameResult] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const startGame = () => {
    setDay(1);
    setMoney(50);
    setReputation(50);
    setInventory({ hintIngredient: 0, hintSlot: 0 });
    startNewDay(1, null);
  };

  const startNewDay = (currentDay, lastDayFinalCustomerType) => {
    const customersCount = 2 + Math.floor(currentDay / 3);
    const queue = [];
    let lastType = lastDayFinalCustomerType;

    let maxSlotsAllowed = 3;
    if (currentDay >= 3) maxSlotsAllowed = 4;
    if (currentDay >= 5) maxSlotsAllowed = 5;

    for(let i=0; i < (customersCount > 5 ? 5 : customersCount); i++) {
      const availableCustomers = CUSTOMER_DATA.map(customer => {
        const validQuests = customer.quests.filter(quest => POTION_DB[quest.potionName].slots <= maxSlotsAllowed);
        return { ...customer, validQuests };
      }).filter(c => c.validQuests.length > 0 && c.type !== lastType);

      let pool = availableCustomers;
      if (pool.length === 0) {
        pool = CUSTOMER_DATA.map(customer => {
          const validQuests = customer.quests.filter(quest => POTION_DB[quest.potionName].slots <= maxSlotsAllowed);
          return { ...customer, validQuests };
        }).filter(c => c.validQuests.length > 0);
      }

      const randomCustomer = pool[Math.floor(Math.random() * pool.length)];
      lastType = randomCustomer.type;

      const randomQuest = randomCustomer.validQuests[Math.floor(Math.random() * randomCustomer.validQuests.length)];
      const potionInfo = POTION_DB[randomQuest.potionName];
      const prescriptionCode = '#' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      queue.push({
        id: i,
        type: randomCustomer.type,
        emoji: randomCustomer.emoji,
        name: randomCustomer.name,
        dialogue: randomQuest.dialogue,
        potionName: randomQuest.potionName,
        slots: potionInfo.slots,
        maxAttempts: potionInfo.maxAttempts,
        baseReward: potionInfo.baseReward,
        prescriptionCode
      });
    }

    setDailyCustomers(queue);
    setCurrentCustomerIndex(0);
    setDay(currentDay);
    setAppState('shop');
    setIsDiagnosing(false);
    setDiagnosisFeedback(null);
  };

  const currentCustomer = dailyCustomers[currentCustomerIndex];

  const buyItem = (type) => {
    const cost = ITEM_COSTS[type];
    if (reputation - cost <= 0) {
      alert("명성이 0 이하로 떨어지면 파산합니다! 구매할 수 없습니다.");
      return;
    }
    setReputation(prev => prev - cost);
    setInventory(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const moveToNextCustomer = () => {
    const nextIndex = currentCustomerIndex + 1;
    if (nextIndex >= dailyCustomers.length) {
      setAppState('day_end');
    } else {
      setCurrentCustomerIndex(nextIndex);
      setIsDiagnosing(false);
      setDiagnosisFeedback(null);
      setAppState('shop');
    }
  };

  const handleDiagnose = (selectedPotion) => {
    if (selectedPotion === currentCustomer.potionName) {
      setDiagnosisFeedback('success');
      setTimeout(() => {
        acceptOrder();
      }, 1200);
    } else {
      setDiagnosisFeedback('fail');
      const penalty = 10;
      setReputation(prev => prev - penalty);
      
      setTimeout(() => {
        if (reputation - penalty <= 0) {
          setAppState('game_over');
        } else {
          moveToNextCustomer();
        }
      }, 1500);
    }
  };

  const acceptOrder = () => {
    const slotsCount = currentCustomer.slots;
    const shuffled = [...INGREDIENTS].sort(() => 0.5 - Math.random());
    setSecretRecipe(shuffled.slice(0, slotsCount).map(item => item.id));
    setCurrentGuess(Array(slotsCount).fill(null));
    setHistory([]);
    setBrewPhase('idle');
    setEffectText('');
    setMinigameResult(null);
    setSelectedSlotIndex(null);
    
    setActiveItemMode(null);
    setKnownIngredients({});
    setKnownSlots(Array(slotsCount).fill(null));
    
    setAppState('minigame');
  };

  const handleIngredientClick = (id) => {
    if (minigameResult || brewPhase !== 'idle') return;

    if (activeItemMode === 'hintIngredient') {
      if (knownIngredients[id] !== undefined) return;
      setKnownIngredients(prev => ({ ...prev, [id]: secretRecipe.includes(id) }));
      setInventory(prev => ({ ...prev, hintIngredient: prev.hintIngredient - 1 }));
      setActiveItemMode(null);
      return;
    }

    if (currentGuess.includes(id)) {
      setCurrentGuess(currentGuess.map(itemId => itemId === id ? null : itemId));
    } else if (currentGuess.includes(null)) {
      const newGuess = [...currentGuess];
      if (selectedSlotIndex !== null && newGuess[selectedSlotIndex] === null) {
        newGuess[selectedSlotIndex] = id;
        setSelectedSlotIndex(null);
      } else {
        const emptyIndex = newGuess.indexOf(null);
        newGuess[emptyIndex] = id;
      }
      setCurrentGuess(newGuess);
    }
  };

  const handleSlotClick = (index, guessId) => {
    if (minigameResult || brewPhase !== 'idle') return;

    if (activeItemMode === 'hintSlot') {
      if (knownSlots[index]) return;
      setKnownSlots(prev => {
        const next = [...prev];
        next[index] = secretRecipe[index];
        return next;
      });
      setInventory(prev => ({ ...prev, hintSlot: prev.hintSlot - 1 }));
      setActiveItemMode(null);
      return;
    }

    if (guessId) {
      handleIngredientClick(guessId);
      if (selectedSlotIndex === index) setSelectedSlotIndex(null);
    } else {
      setSelectedSlotIndex(selectedSlotIndex === index ? null : index);
    }
  };

  const handleBrew = () => {
    if (currentGuess.includes(null) || brewPhase !== 'idle') return;
    setActiveItemMode(null);
    setSelectedSlotIndex(null);

    setBrewPhase('heating');
    setEffectText('🔥 끓이는 중...');

    setTimeout(() => {
      setBrewPhase('mixing');
      setEffectText('✨ 마법 융합!');

      setTimeout(() => {
        let perfect = 0;
        let unstable = 0;

        currentGuess.forEach((guessId, index) => {
          if (guessId === secretRecipe[index]) perfect++;
          else if (secretRecipe.includes(guessId)) unstable++;
        });

        const newHistoryItem = { guess: currentGuess, perfect, unstable, attempt: history.length + 1 };
        const newHistory = [newHistoryItem, ...history];
        
        setHistory(newHistory);
        setCurrentGuess(Array(currentCustomer.slots).fill(null));
        setBrewPhase('idle');
        setEffectText('');

        if (perfect === currentCustomer.slots) {
          finishOrder(true, newHistory.length);
        } else if (newHistory.length >= currentCustomer.maxAttempts) {
          finishOrder(false, newHistory.length);
        }
      }, 1500);
    }, 1200);
  };

  const finishOrder = (isWin, attempts) => {
    let earnedMoney = 0;
    let earnedRep = 0;
    let tip = 0;
    const base = currentCustomer.baseReward;

    if (isWin) {
      const remainingAttempts = currentCustomer.maxAttempts - attempts;
      tip = Math.floor(base * (remainingAttempts * 0.15));
      earnedMoney = base + tip;
      earnedRep = 10;
    } else {
      earnedMoney = 0;
      earnedRep = -15;
    }

    setMinigameResult({
      status: isWin ? 'win' : 'lose',
      baseReward: base,
      tip: tip,
      earnedMoney,
      earnedRep,
      attempts
    });
  };

  const returnToShop = () => {
    const newReputation = reputation + minigameResult.earnedRep;
    setMoney(prev => prev + minigameResult.earnedMoney);
    setReputation(newReputation);

    if (newReputation <= 0) {
      setAppState('game_over');
    } else {
      moveToNextCustomer();
    }
  };

  const getIngredientDetails = (id) => INGREDIENTS.find(item => item.id === id);

  const renderTopBar = () => (
    <div className="flex items-center justify-between bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 shadow-md mb-4 sm:mb-6 relative z-20">
      <div className="flex items-center gap-2 text-purple-300 font-bold text-lg sm:text-xl">
        <Store className="w-5 h-5 sm:w-6 sm:h-6" />
        <span>Day {day}</span>
      </div>
      <div className="flex gap-3 sm:gap-6 text-sm sm:text-base">
        <div className="flex items-center gap-1 sm:gap-2 text-yellow-400 font-bold">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{money} G</span>
        </div>
        <div className={`flex items-center gap-1 sm:gap-2 font-bold ${reputation > 30 ? 'text-blue-400' : 'text-red-400 animate-pulse'}`}>
          <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>명성 {reputation}</span>
        </div>
      </div>
    </div>
  );

  if (appState === 'start') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 sm:space-y-6 max-w-md w-full">
          <div className="flex justify-center mb-4 sm:mb-8">
            <div className="relative">
              <FlaskConical className="w-24 h-24 sm:w-32 sm:h-32 text-purple-500 animate-pulse" />
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 absolute -top-2 -right-2 sm:-top-4 sm:-right-4 animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg">
            위대한 마법약 상점
          </h1>
          <p className="text-slate-400 leading-relaxed bg-slate-800 p-3 sm:p-4 rounded-lg border border-slate-700 text-xs sm:text-sm">
            손님들의 다양한 증상을 듣고 올바른 마법약을 처방하세요!<br/>
            <span className="text-purple-300 font-bold">(※ 동일한 물약이라도 체질에 따라 레시피가 다릅니다)</span><br/><br/>
            오진하거나 조제에 실패하면 명성이 깎이며,<br/>명성이 0이 되면 파산합니다.
          </p>
          <button 
            onClick={startGame}
            className="w-full py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg sm:text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105"
          >
            상점 문 열기
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'game_over') {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-20 h-20 sm:w-24 sm:h-24 text-red-500 mb-4 sm:mb-6 animate-bounce" />
        <h1 className="text-3xl sm:text-4xl font-black text-red-400 mb-2 sm:mb-4">파산했습니다!</h1>
        <p className="text-red-200 mb-6 sm:mb-8 text-sm sm:text-lg">명성이 바닥에 떨어져 상점을 닫습니다...</p>
        <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-700 mb-6 sm:mb-8 w-56 sm:w-64">
          <p className="text-slate-400 mb-1 sm:mb-2 text-sm sm:text-base">최종 기록</p>
          <p className="text-xl sm:text-2xl font-bold text-white">Day {day}</p>
          <p className="text-lg sm:text-xl font-bold text-yellow-400 mt-1 sm:mt-2">{money} G</p>
        </div>
        <button onClick={startGame} className="px-6 py-3 sm:px-8 sm:py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5"/> 처음부터 다시 시작
        </button>
      </div>
    );
  }

  if (appState === 'day_end') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl border-2 border-purple-500 max-w-sm w-full text-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <Star className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">영업 종료</h2>
          <p className="text-purple-300 mb-6 sm:mb-8 text-sm sm:text-base">Day {day}를 무사히 마쳤습니다.</p>
          
          <button 
            onClick={() => startNewDay(day + 1, dailyCustomers[dailyCustomers.length - 1].type)}
            className="w-full py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
          >
            다음 날 시작하기 <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-slate-100 p-2 sm:p-4 font-sans selection:bg-purple-500/30 flex flex-col">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-4px) rotate(-2deg); }
          50% { transform: translateX(4px) rotate(2deg); }
          75% { transform: translateX(-4px) rotate(-1deg); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out infinite; }
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-pulse-fast { animation: pulse-fast 0.4s ease-in-out infinite; }
        @keyframes walkIn {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-walk-in { animation: walkIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes popUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-up { animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.6s; opacity: 0; }
        .animate-fade-in-btn { animation: popUp 0.3s ease-in forwards; animation-delay: 1.0s; opacity: 0; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); border-color: rgba(59, 130, 246, 0.8); }
          50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.8); border-color: rgba(96, 165, 250, 1); }
        }
        .animate-pulse-glow { animation: pulse-glow 1.5s ease-in-out infinite; }
        @keyframes slideUp {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}</style>

      <div className="max-w-2xl mx-auto w-full relative overflow-hidden pb-2 sm:pb-4 flex-1 flex flex-col">
        {renderTopBar()}

        {showShopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border-2 border-blue-500 rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-300 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" /> 도구 상점
                </h2>
                <button onClick={() => setShowShopModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-1 text-sm sm:text-base"><Search className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400"/> 재료 감별 돋보기</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">특정 재료가 레시피에 쓰이는지 O/X.</p>
                  </div>
                  <button 
                    onClick={() => buyItem('hintIngredient')}
                    className="ml-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-800 hover:bg-indigo-900 border border-indigo-500 rounded-lg text-xs sm:text-sm font-bold text-indigo-300 flex flex-col items-center min-w-[60px] sm:min-w-[70px]"
                  >
                    <span>{ITEM_COSTS.hintIngredient} 명성</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">보유: {inventory.hintIngredient}</span>
                  </button>
                </div>

                <div className="bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-1 text-sm sm:text-base"><Eye className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400"/> 슬롯 투시 구슬</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">가마솥의 칸에 들어갈 재료를 확인.</p>
                  </div>
                  <button 
                    onClick={() => buyItem('hintSlot')}
                    className="ml-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-800 hover:bg-purple-900 border border-purple-500 rounded-lg text-xs sm:text-sm font-bold text-purple-300 flex flex-col items-center min-w-[60px] sm:min-w-[70px]"
                  >
                    <span>{ITEM_COSTS.hintSlot} 명성</span>
                    <span className="text-[10px] sm:text-xs text-slate-400">보유: {inventory.hintSlot}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-500">
                아이템은 조제실(미니게임)에서 사용할 수 있습니다.
              </div>
            </div>
          </div>
        )}

        {appState === 'shop' && currentCustomer && (
          <div className="bg-slate-900 rounded-t-3xl border-4 border-slate-700 flex-1 overflow-hidden relative shadow-2xl flex flex-col justify-end animate-in fade-in duration-500 min-h-[450px]">
            <div className="absolute inset-0 bg-slate-800/50 flex justify-around p-4">
              <div className="w-1/4 h-24 sm:h-32 bg-slate-700 rounded-lg border-b-4 border-slate-800 mt-6 sm:mt-10 opacity-50"></div>
              <div className="w-1/4 h-24 sm:h-32 bg-slate-700 rounded-lg border-b-4 border-slate-800 mt-12 sm:mt-20 opacity-50"></div>
              <div className="w-1/4 h-24 sm:h-32 bg-slate-700 rounded-lg border-b-4 border-slate-800 mt-6 sm:mt-10 opacity-50"></div>
            </div>

            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-900/80 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1 sm:gap-2 z-10 border border-slate-700">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" /> 
              대기표: {currentCustomerIndex + 1} / {dailyCustomers.length}
            </div>

            <div className="relative z-10 flex flex-col items-center animate-walk-in pt-12 sm:pt-0">
              <div className="bg-white text-slate-900 p-3 sm:p-5 rounded-2xl rounded-br-none mb-2 sm:mb-4 shadow-xl w-[90%] sm:max-w-sm relative mx-auto animate-pop-up">
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">{currentCustomer.name}</h3>
                <p className="text-xs sm:text-base text-slate-700 italic font-medium leading-relaxed break-keep">"{currentCustomer.dialogue}"</p>
                
                <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 flex justify-between items-end gap-1 sm:gap-2">
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold mb-0.5 sm:mb-1">상태</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 w-fit">
                      <Search className="w-3 h-3" /> 대기중...
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold mb-0.5 sm:mb-1">예상 보수</span>
                    <span className="text-amber-600 font-black flex items-center gap-1 text-sm sm:text-base">
                      {currentCustomer.baseReward} G
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-3 right-6 sm:-bottom-4 sm:right-10 w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-t-[12px] sm:border-t-[16px] border-t-white border-r-[12px] sm:border-r-[16px] border-r-transparent"></div>
              </div>

              {diagnosisFeedback && (
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-2xl sm:text-4xl font-black px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl animate-bounce border-4 whitespace-nowrap flex items-center gap-1 sm:gap-2 ${diagnosisFeedback === 'success' ? 'bg-green-100 text-green-600 border-green-500' : 'bg-red-100 text-red-600 border-red-500'}`}>
                  {diagnosisFeedback === 'success' ? <><CheckCircle2 className="w-6 h-6 sm:w-10 sm:h-10"/> 성공!</> : <><XCircle className="w-6 h-6 sm:w-10 sm:h-10"/> 오진!</>}
                </div>
              )}

              <div className={`text-[80px] sm:text-[120px] leading-none filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] translate-y-2 transition-all ${diagnosisFeedback === 'fail' ? 'grayscale opacity-50' : ''}`}>
                {currentCustomer.emoji}
              </div>
            </div>

            <div className="bg-amber-900 w-full border-t-[8px] sm:border-t-[12px] border-amber-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 relative shrink-0">
              <div className="absolute top-0 w-full h-1 sm:h-2 bg-white/10"></div>
              
              {!isDiagnosing ? (
                <div className="h-20 sm:h-32 flex items-center justify-center px-4">
                  <button 
                    onClick={() => setIsDiagnosing(true)}
                    disabled={diagnosisFeedback !== null}
                    className="w-full sm:w-auto px-4 py-3 sm:px-8 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm sm:text-xl rounded-xl shadow-[0_6px_0_rgba(67,56,202,1)] sm:shadow-[0_8px_0_rgba(67,56,202,1)] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 sm:gap-3 animate-fade-in-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ScrollText className="w-4 h-4 sm:w-6 sm:h-6" /> 처방전 작성하기
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800 border-t-4 border-slate-600 p-2 sm:p-4 animate-slide-up rounded-t-2xl max-h-[45vh] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-2 sm:mb-4 sticky top-0 bg-slate-800 py-1 z-10">
                    <h3 className="text-white font-bold flex items-center gap-1 sm:gap-2 text-xs sm:text-base"><ScrollText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400"/> 알맞은 약을 고르세요</h3>
                    <button onClick={() => setIsDiagnosing(false)} className="text-slate-400 hover:text-white bg-slate-700 p-1 rounded">
                      <X className="w-4 h-4 sm:w-5 sm:h-5"/>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    {POTION_CATALOG.map((potionName, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDiagnose(potionName)}
                        disabled={diagnosisFeedback !== null}
                        className="p-2 sm:p-3 bg-slate-700 hover:bg-indigo-600 text-left rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-slate-200 hover:text-white border border-slate-600 hover:border-indigo-400 transition-colors flex items-center gap-2"
                      >
                        <FlaskConical className="w-4 h-4 opacity-70 shrink-0" />
                        <span className="truncate">{potionName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {appState === 'minigame' && (
          <div className="flex flex-col flex-1 gap-2 sm:gap-4 overflow-y-auto custom-scrollbar">
            
            {minigameResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className={`bg-slate-800 border-2 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 sm:space-y-6 animate-in zoom-in-95 ${minigameResult.status === 'win' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]'}`}>
                  <div className="text-5xl sm:text-6xl mb-2">{minigameResult.status === 'win' ? '🎇' : '💥'}</div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${minigameResult.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {minigameResult.status === 'win' ? '완벽한 조제!' : '조제 실패...'}
                  </h2>
                  
                  {minigameResult.status === 'win' && (
                    <p className="text-sm sm:text-base text-slate-300">
                      남은 기회에 비례하여<br/>추가 팁을 받았습니다!
                    </p>
                  )}
                  {minigameResult.status === 'lose' && (
                    <p className="text-sm sm:text-base text-slate-300">
                      가마솥이 폭발하여 손님이 화를 내며 나갔습니다.
                    </p>
                  )}

                  <div className="flex justify-center gap-4 sm:gap-6 py-3 sm:py-4 bg-slate-900 rounded-xl">
                    <div className="text-center flex flex-col justify-end">
                      <p className="text-xs sm:text-sm text-slate-400 mb-1">획득 골드</p>
                      <p className={`font-bold text-base sm:text-lg flex flex-col items-center justify-center ${minigameResult.earnedMoney > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1">{minigameResult.earnedMoney > 0 ? '+' : ''}{minigameResult.earnedMoney} <Coins className="w-3 h-3 sm:w-4 sm:h-4"/></span>
                        {minigameResult.tip > 0 && (
                          <span className="text-[10px] sm:text-xs text-yellow-600/80 mt-1">(기본 {minigameResult.baseReward} + 팁 {minigameResult.tip})</span>
                        )}
                      </p>
                    </div>
                    <div className="text-center flex flex-col justify-start border-l border-slate-700 pl-4 sm:pl-6">
                      <p className="text-xs sm:text-sm text-slate-400 mb-1">명성 변화</p>
                      <p className={`font-bold text-base sm:text-lg flex items-center justify-center gap-1 ${minigameResult.earnedRep > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {minigameResult.earnedRep > 0 ? '+' : ''}{minigameResult.earnedRep} <Star className="w-3 h-3 sm:w-4 sm:h-4"/>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={returnToShop}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors text-sm sm:text-base"
                  >
                    상점 홀로 돌아가기
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-end shrink-0">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-purple-300 flex items-center gap-1.5 sm:gap-2">
                  <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" /> 조제실
                </h2>
                <p className="text-[11px] sm:text-sm text-slate-400 mt-1 truncate max-w-[180px] sm:max-w-xs">
                  {currentCustomer?.potionName} <span className="text-purple-400 font-mono text-[9px] sm:text-xs bg-purple-900/40 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded ml-1">{currentCustomer?.prescriptionCode}</span>
                </p>
              </div>
              <p className="text-[10px] sm:text-sm text-red-400 font-semibold animate-pulse bg-red-900/30 px-2 py-1 sm:px-3 sm:py-1 rounded-full whitespace-nowrap">
                기회: {currentCustomer?.maxAttempts - history.length}회 남음
              </p>
            </div>

            <div className="bg-slate-800 p-2 sm:p-3 rounded-xl border border-slate-700 flex flex-wrap gap-2 sm:gap-4 items-center shrink-0">
              <span className="hidden sm:flex text-sm text-slate-400 font-bold items-center gap-1"><PackageOpen className="w-4 h-4"/> 도구함</span>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setActiveItemMode(activeItemMode === 'hintIngredient' ? null : 'hintIngredient')}
                  disabled={inventory.hintIngredient <= 0 || brewPhase !== 'idle'}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeItemMode === 'hintIngredient' 
                      ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.8)]' 
                      : inventory.hintIngredient > 0 ? 'bg-slate-700 hover:bg-slate-600 text-indigo-300' : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Search className="w-3 h-3 sm:w-4 sm:h-4" /> 돋보기 ({inventory.hintIngredient})
                </button>

                <button 
                  onClick={() => setActiveItemMode(activeItemMode === 'hintSlot' ? null : 'hintSlot')}
                  disabled={inventory.hintSlot <= 0 || brewPhase !== 'idle'}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    activeItemMode === 'hintSlot' 
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.8)]' 
                      : inventory.hintSlot > 0 ? 'bg-slate-700 hover:bg-slate-600 text-purple-300' : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> 구슬 ({inventory.hintSlot})
                </button>
              </div>

              {activeItemMode && (
                <span className="w-full sm:w-auto text-center sm:text-left text-[10px] sm:text-xs text-blue-300 animate-pulse font-bold bg-blue-900/40 px-2 py-1 rounded">
                  {activeItemMode === 'hintIngredient' ? '감별할 재료 클릭!' : '투시할 칸 클릭!'}
                </span>
              )}

              <button 
                onClick={() => setShowShopModal(true)}
                className="hidden sm:flex ml-auto items-center gap-1 px-3 py-2 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-500 rounded-lg text-sm font-bold shadow-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> 상점
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 shrink-0">
              
              <div className={`bg-slate-800 p-3 sm:p-4 rounded-xl border transition-all ${activeItemMode === 'hintIngredient' ? 'animate-pulse-glow' : 'border-slate-700'}`}>
                <div className="flex justify-between items-center mb-2 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-slate-200">재료 선반</h3>
                  <button 
                    onClick={() => setShowShopModal(true)}
                    className="sm:hidden flex items-center gap-1 px-2 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-500 rounded text-[10px] font-bold transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3" /> 상점
                  </button>
                </div>
                <div className="grid grid-cols-5 md:grid-cols-5 gap-1 sm:gap-2">
                  {INGREDIENTS.map(item => {
                    const isSelected = currentGuess.includes(item.id);
                    const isKnown = knownIngredients[item.id] !== undefined;
                    const isItemTarget = activeItemMode === 'hintIngredient' && !isKnown;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleIngredientClick(item.id)}
                        disabled={minigameResult !== null || brewPhase !== 'idle' || (!isItemTarget && !isSelected && !currentGuess.includes(null)) || (activeItemMode === 'hintIngredient' && isKnown)}
                        className={`
                          relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-300 border-2
                          ${isSelected && !activeItemMode ? 'bg-slate-700 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transform scale-105' : 'bg-slate-900 border-slate-700'}
                          ${isItemTarget ? 'hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] cursor-crosshair' : ''}
                          ${(!activeItemMode && !isSelected && !currentGuess.includes(null)) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}
                        `}
                      >
                        <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{item.emoji}</span>
                        <span className="text-[8px] sm:text-[10px] text-center text-slate-300 leading-tight break-keep">{item.name}</span>
                        
                        {isKnown && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-slate-800 rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center border border-slate-600 shadow-lg text-[8px] sm:text-xs">
                            {knownIngredients[item.id] ? '✅' : '❌'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`
                bg-slate-800 p-3 sm:p-6 rounded-xl border flex flex-col relative overflow-hidden transition-all duration-500
                ${brewPhase === 'heating' ? 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] animate-shake' : ''}
                ${brewPhase === 'mixing' ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] animate-pulse-fast bg-slate-700' : ''}
                ${activeItemMode === 'hintSlot' ? 'animate-pulse-glow' : (!brewPhase || brewPhase === 'idle' ? 'border-slate-700' : '')}
              `}>
                
                {brewPhase !== 'idle' && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
                    <span className="text-lg sm:text-2xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-bounce">
                      {effectText}
                    </span>
                  </div>
                )}

                <h3 className="text-sm sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-4 text-center z-10 relative">투입된 재료 ({currentCustomer.slots}칸)</h3>
                
                <div className="flex justify-center gap-1.5 sm:gap-3 mb-4 sm:mb-8 z-10 relative flex-1 items-center w-full">
                  {Array.from({ length: currentCustomer?.slots || 3 }).map((_, index) => {
                    const guessId = currentGuess[index];
                    const item = guessId ? getIngredientDetails(guessId) : null;
                    const isKnownSlot = knownSlots[index] !== null;
                    const correctItem = isKnownSlot ? getIngredientDetails(knownSlots[index]) : null;
                    const isItemTarget = activeItemMode === 'hintSlot' && !isKnownSlot;
                    const isSelectedEmptySlot = selectedSlotIndex === index && !item && !activeItemMode;

                    return (
                      <div 
                        key={index} 
                        onClick={() => handleSlotClick(index, guessId)}
                        className={`
                          relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 rounded-full border-2 flex items-center justify-center text-lg sm:text-3xl transition-all duration-300
                          ${item ? 'bg-slate-800 border-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.4)]' : 'bg-slate-900 border-slate-700 border-dashed'}
                          ${isItemTarget ? 'cursor-crosshair hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]' : (item && !activeItemMode ? 'cursor-pointer' : '')}
                          ${isSelectedEmptySlot ? 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)] animate-pulse cursor-pointer' : (!item && !activeItemMode ? 'cursor-pointer hover:border-slate-500' : '')}
                          ${brewPhase === 'heating' ? 'animate-bounce shadow-[inset_0_0_15px_rgba(249,115,22,0.8)] border-orange-400' : ''}
                        `}
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        {item ? item.emoji : <span className="text-slate-700 text-[10px] sm:text-sm z-10">{index + 1}</span>}
                        
                        {!item && isKnownSlot && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-30 text-xl sm:text-3xl">
                            {correctItem.emoji}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleBrew}
                  disabled={currentGuess.includes(null) || minigameResult !== null || brewPhase !== 'idle' || activeItemMode !== null}
                  className={`
                    w-full py-3 sm:py-4 font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-lg z-10 relative
                    ${(brewPhase !== 'idle' || activeItemMode) ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]'}
                  `}
                >
                  {brewPhase === 'idle' ? (
                    <><Flame className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" /> 조합하기</>
                  ) : (
                    <><FlaskConical className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" /> 연성 중...</>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-inner flex flex-col flex-1 min-h-[150px]">
              <div className="bg-slate-800/80 border-b border-slate-700 p-2 rounded-t-xl text-[10px] sm:text-xs text-slate-300 flex items-center gap-3 justify-center z-10">
                <Info className="w-3 h-3 text-slate-400 shrink-0"/>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-green-400"/> 
                  <span className="text-green-400 font-bold whitespace-nowrap">완벽:</span> 종류/위치 일치
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-400"/> 
                  <span className="text-yellow-400 font-bold whitespace-nowrap">불안정:</span> 위치 다름
                </span>
              </div>

              {history.length > 0 ? (
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 overflow-y-auto custom-scrollbar flex-1 max-h-[30vh]">
                  {history.map((record, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all ${idx === 0 ? 'bg-slate-700 border-purple-500' : 'bg-slate-900 border-slate-700 opacity-80'}`}>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-slate-400 w-3 sm:w-4 text-[10px] sm:text-sm font-mono">{record.attempt}.</span>
                        <div className="flex flex-wrap gap-0.5 sm:gap-2">
                          {record.guess.map((id, i) => (
                            <div key={i} className="text-sm sm:text-xl" title={getIngredientDetails(id).name}>
                              {getIngredientDetails(id).emoji}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold">
                        <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-md ${record.perfect > 0 ? 'bg-green-900/60 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {record.perfect}
                        </div>
                        <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-md ${record.unstable > 0 ? 'bg-yellow-900/60 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                          <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {record.unstable}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs sm:text-sm p-4 text-center">
                  조합을 시작하면 여기에 기록이 표시됩니다.
                </div>
              )}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}