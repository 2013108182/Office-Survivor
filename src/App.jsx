import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Clock, Zap, Shield, Coffee, TrendingUp,
  Skull, Trophy, Play, RefreshCw, ChevronUp, Keyboard, Magnet
} from 'lucide-react';

// --- 스킬 메타 데이터 ---
const SKILLS = {
  coffee: {
    id: 'coffee', name: '아메리카노 수혈', desc: '자동 발사. 연사력과 화력이 증가합니다.',
    max: 5, icon: Coffee, color: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10'
  },
  vlookup: {
    id: 'vlookup', name: 'VLOOKUP 광역기', desc: '데이터를 스캔하여 주변 적에게 지속 피해를 줍니다.',
    max: 5, icon: Zap, color: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10'
  },
  shield: {
    id: 'shield', name: '메신저 읽씹', desc: '공격을 1회 방어하는 쉴드를 생성합니다.',
    max: 3, icon: Shield, color: 'text-cyan-400', border: 'border-cyan-400/50', bg: 'bg-cyan-400/10'
  },
  speed: {
    id: 'speed', name: '칼퇴 본능', desc: '마음이 급해져 이동 속도가 대폭 상승합니다.',
    max: 3, icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400/10'
  },
  keyboard: {
    id: 'keyboard', name: '키보드 샷건', desc: '주기적으로 8방향으로 사직서를 날립니다.',
    max: 5, icon: Keyboard, color: 'text-indigo-400', border: 'border-indigo-400/50', bg: 'bg-indigo-400/10'
  },
  magnet: {
    id: 'magnet', name: '끌어당김의 법칙', desc: '경험치(서류)를 끌어당기는 범위가 대폭 넓어집니다.',
    max: 5, icon: Magnet, color: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/10'
  }
};

// --- 게임 엔진 (Canvas Logic) ---
class GameEngine {
  constructor(canvas, callbacks, getSkills) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;
    this.getSkills = getSkills;

    this.isRunning = false;
    this.lastTime = performance.now();
    this.frameCount = 0;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.time = 9 * 60; // 09:00 시작 (540분)
    this.endTime = 18 * 60; // 18:00 종료
    this.lastReportedTime = this.time;

    this.cameraX = 0;
    this.cameraY = 0;

    this.player = new Player(0, 0, this);
    this.enemies = [];
    this.projectiles = [];
    this.gems = [];
    this.particles = [];
    this.texts = [];

    this.keys = {};
    this.pointer = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };

    this.bindEvents();
    this.resize();
  }

  bindEvents() {
    this.handleKeyDown = (e) => { this.keys[e.key] = true; };
    this.handleKeyUp = (e) => { this.keys[e.key] = false; };

    this.handlePointerDown = (e) => {
      this.pointer.active = true;
      this.pointer.startX = e.clientX;
      this.pointer.startY = e.clientY;
      this.pointer.currentX = e.clientX;
      this.pointer.currentY = e.clientY;
    };
    this.handlePointerMove = (e) => {
      if (this.pointer.active) {
        this.pointer.currentX = e.clientX;
        this.pointer.currentY = e.clientY;
      }
    };
    this.handlePointerUp = () => { this.pointer.active = false; };
    this.handleResize = () => this.resize();

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('pointercancel', this.handlePointerUp);
  }

  destroy() {
    this.isRunning = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame((now) => this.loop(now));
    }
  }

  pause() {
    this.isRunning = false;
  }

  addParticle(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  addText(x, y, text, color) {
    this.texts.push(new FloatingText(x, y, text, color));
  }

  loop(now) {
    if (!this.isRunning) return;

    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;

    this.time += (deltaTime / 1000) * 12;

    if (Math.floor(this.time) > Math.floor(this.lastReportedTime)) {
      this.callbacks.onTimeChange(this.time);
      this.lastReportedTime = this.time;
      if (this.time >= this.endTime) {
        this.pause();
        this.callbacks.onWin();
        return;
      }
    }

    this.update();
    this.draw();

    requestAnimationFrame((n) => this.loop(n));
  }

  update() {
    this.player.update();

    // 카메라 위치 (플레이어가 화면 중앙에 오도록)
    this.cameraX = this.player.x - this.width / 2;
    this.cameraY = this.player.y - this.height / 2;

    const progress = (this.time - 540) / (this.endTime - 540);
    const spawnRate = Math.max(20, 80 - (progress * 60));

    if (this.frameCount % Math.floor(spawnRate) === 0) {
      const rand = Math.random();
      let type = 'spam'; // 📧
      if (rand > 0.85 - (progress * 0.3)) type = 'folder'; // 🗂️
      else if (rand > 0.6) type = 'slack'; // 💬

      this.enemies.push(new Enemy(type, this.player.x, this.player.y, Math.max(this.width, this.height), progress));
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update();

      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(p.x - e.x, p.y - e.y) < p.size + e.size) {
          e.takeDamage(p.damage, this);
          hit = true;
          this.addParticle(p.x, p.y, '#fbbf24', 3);
          break;
        }
      }
      if (hit || p.isOutOfBounds(this.cameraX, this.cameraY, this.width, this.height)) {
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp <= 0) {
        this.addParticle(e.x, e.y, e.particleColor, 10);
        this.gems.push(new XPGem(e.x, e.y, e.xpValue));
        this.enemies.splice(i, 1);
        continue;
      }
      e.update(this.player);

      if (Math.hypot(this.player.x - e.x, this.player.y - e.y) < e.size + this.player.size - 5) {
        this.player.takeDamage(1);
        e.hp = 0;
      }
    }

    for (let i = this.gems.length - 1; i >= 0; i--) {
      if (this.gems[i].update(this.player)) {
        this.gems.splice(i, 1);
      }
    }

    this.particles = this.particles.filter(p => p.update());
    this.texts = this.texts.filter(t => t.update());
  }

  draw() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, -this.cameraY);

    // 무한 배경
    this.ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    const startX = Math.floor(this.cameraX / 40) * 40;
    const endX = startX + this.width + 80;
    const startY = Math.floor(this.cameraY / 40) * 40;
    const endY = startY + this.height + 80;

    for (let x = startX; x <= endX; x += 40) {
      this.ctx.moveTo(x, startY); this.ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += 40) {
      this.ctx.moveTo(startX, y); this.ctx.lineTo(endX, y);
    }
    this.ctx.stroke();

    this.gems.forEach(g => g.draw(this.ctx));
    this.enemies.forEach(e => e.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.particles.forEach(p => p.draw(this.ctx));
    this.player.draw(this.ctx);
    this.texts.forEach(t => t.draw(this.ctx));

    this.ctx.restore();

    // 가상 조이스틱
    if (this.pointer.active) {
      this.ctx.beginPath();
      this.ctx.arc(this.pointer.startX, this.pointer.startY, 50, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      let dx = this.pointer.currentX - this.pointer.startX;
      let dy = this.pointer.currentY - this.pointer.startY;
      let dist = Math.hypot(dx, dy);
      if (dist > 50) {
        dx = (dx / dist) * 50;
        dy = (dy / dist) * 50;
      }

      this.ctx.beginPath();
      this.ctx.arc(this.pointer.startX + dx, this.pointer.startY + dy, 20, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }
}

class Player {
  constructor(x, y, engine) {
    this.x = x; this.y = y; this.engine = engine;
    this.size = 20; this.baseSpeed = 3.5;
    this.maxHp = 10; this.hp = 10;
    this.xp = 0; this.maxXp = 8; this.level = 1;

    this.coffeeCooldown = 0;
    this.vlookupAngle = 0;
    this.shieldActive = false;
    this.shieldCooldown = 0;
    this.keyboardTimer = 0;
  }

  update() {
    const skills = this.engine.getSkills();
    let dx = 0, dy = 0;
    const { keys, pointer } = this.engine;

    if (keys['w'] || keys['ArrowUp']) dy -= 1;
    if (keys['s'] || keys['ArrowDown']) dy += 1;
    if (keys['a'] || keys['ArrowLeft']) dx -= 1;
    if (keys['d'] || keys['ArrowRight']) dx += 1;

    if (pointer.active && dx === 0 && dy === 0) {
      const diffX = pointer.currentX - pointer.startX;
      const diffY = pointer.currentY - pointer.startY;
      if (Math.hypot(diffX, diffY) > 10) { dx = diffX; dy = diffY; }
    }

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
    }

    const speed = this.baseSpeed + (skills.speed * 0.7);
    this.x += dx * speed;
    this.y += dy * speed;

    if (this.coffeeCooldown > 0) this.coffeeCooldown--;
    if (this.coffeeCooldown <= 0 && this.engine.enemies.length > 0) {
      let closest = null, minDist = Infinity;
      this.engine.enemies.forEach(e => {
        const d = Math.hypot(e.x - this.x, e.y - this.y);
        if (d < minDist) { minDist = d; closest = e; }
      });
      if (closest) {
        const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
        const pSpeed = 8 + skills.coffee;
        const pDamage = 1 + (skills.coffee * 0.5);
        this.engine.projectiles.push(new Projectile(this.x, this.y, angle, pSpeed, pDamage));
        this.coffeeCooldown = Math.max(15, 60 - (skills.coffee * 10));
      }
    }

    if (skills.keyboard > 0) {
      this.keyboardTimer++;
      if (this.keyboardTimer > 120 - (skills.keyboard * 12)) {
        this.keyboardTimer = 0;
        const damage = 1 + (skills.keyboard * 0.5);
        for(let i=0; i<8; i++) {
          const angle = (Math.PI / 4) * i;
          this.engine.projectiles.push(new Projectile(this.x, this.y, angle, 6, damage, '📄'));
        }
      }
    }

    if (skills.vlookup > 0) {
      this.vlookupAngle += 0.05;
      if (this.engine.frameCount % 20 === 0) {
        const radius = 70 + (skills.vlookup * 25);
        const damage = 0.5 + (skills.vlookup * 0.4);
        this.engine.enemies.forEach(e => {
          if (Math.hypot(e.x - this.x, e.y - this.y) < radius + e.size) {
            e.takeDamage(damage, this.engine);
            this.engine.addParticle(e.x, e.y, '#38bdf8', 1);
          }
        });
      }
    }

    if (skills.shield > 0 && !this.shieldActive) {
      if (this.shieldCooldown > 0) this.shieldCooldown--;
      else this.shieldActive = true;
    }
  }

  draw(ctx) {
    const skills = this.engine.getSkills();

    if (skills.vlookup > 0) {
      const radius = 70 + (skills.vlookup * 25);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.vlookupAngle);

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fill();

      ctx.beginPath();
      ctx.setLineDash([15, 20]);
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    if (this.shieldActive) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 12, 0, Math.PI * 2);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    const bounce = Math.sin(this.engine.frameCount * 0.1) * 3;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧑‍💻', this.x, this.y + bounce);
  }

  takeDamage(amt) {
    if (this.shieldActive) {
      this.shieldActive = false;
      const skills = this.engine.getSkills();
      this.shieldCooldown = 400 - (skills.shield * 80);
      this.engine.addText(this.x, this.y - 30, "방어함!", "#22d3ee");
      return;
    }
    this.hp -= amt;
    this.engine.callbacks.onHpChange(this.hp);
    this.engine.addParticle(this.x, this.y, '#ef4444', 8);
    if (this.hp <= 0) {
      this.engine.pause();
      this.engine.callbacks.onGameOver();
    }
  }

  gainXp(amt) {
    this.xp += amt;
    if (this.xp >= this.maxXp) {
      this.xp -= this.maxXp;
      this.level++;
      this.maxXp = Math.floor(this.maxXp * 1.25);
      this.engine.callbacks.onLevelUp();
    }
    this.engine.callbacks.onXpChange(this.xp, this.maxXp, this.level);
  }
}

class Enemy {
  constructor(type, playerX, playerY, maxScreenDim, progress) {
    const angle = Math.random() * Math.PI * 2;
    const dist = maxScreenDim * 0.6;
    this.x = playerX + Math.cos(angle) * dist;
    this.y = playerY + Math.sin(angle) * dist;

    const diff = 1 + progress * 2.5;

    if (type === 'spam') {
      this.emoji = '📧'; this.size = 15;
      this.hp = 1.5 * diff; this.speed = 1.8 + Math.random();
      this.xpValue = 1; this.particleColor = '#f472b6';
    } else if (type === 'slack') {
      this.emoji = '💬'; this.size = 18;
      this.hp = 2.5 * diff; this.speed = 2.2 + Math.random();
      this.xpValue = 2; this.particleColor = '#60a5fa';
    } else {
      this.emoji = '🗂️'; this.size = 25;
      this.hp = 6 * diff; this.speed = 0.8 + Math.random() * 0.5;
      this.xpValue = 5; this.particleColor = '#fbbf24';
    }
    this.maxHp = this.hp;
  }

  update(player) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }

  draw(ctx) {
    ctx.font = `${this.size * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.x, this.y);
  }

  takeDamage(amt, engine) {
    this.hp -= amt;
    engine.addText(this.x, this.y - 20, Math.ceil(amt).toString(), "#ffffff");
  }
}

class Projectile {
  constructor(x, y, angle, speed, damage, emoji = '☕') {
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.size = 10;
    this.emoji = emoji;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
  }
  draw(ctx) {
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 10;
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.shadowBlur = 0;
  }
  isOutOfBounds(cx, cy, w, h) {
    return this.x < cx - 100 || this.x > cx + w + 100 || this.y < cy - 100 || this.y > cy + h + 100;
  }
}

class XPGem {
  constructor(x, y, value) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.value = value;
    this.size = 8;
  }
  update(player) {
    const skills = player.engine.getSkills();
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < 120 + (skills.magnet * 60)) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * 7;
      this.y += Math.sin(angle) * 7;
    }
    if (dist < player.size + this.size) {
      player.gainXp(this.value);
      return true;
    }
    return false;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x + this.size, this.y);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.lineTo(this.x - this.size, this.y);
    ctx.closePath();
    ctx.fillStyle = '#60a5fa';
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = 0.02 + Math.random() * 0.03;
    this.color = color;
    this.size = Math.random() * 3 + 2;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.life -= this.decay;
    return this.life > 0;
  }
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class FloatingText {
  constructor(x, y, text, color) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 1.0;
  }
  update() {
    this.y -= 1.5;
    this.life -= 0.03;
    return this.life > 0;
  }
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

export default function App() {
  const [gameState, setGameState] = useState('START');
  const [hp, setHp] = useState(10);
  const [time, setTime] = useState(540);
  const [xpData, setXpData] = useState({ xp: 0, maxXp: 8, level: 1 });
  const [skills, setSkills] = useState({ coffee: 1, vlookup: 0, shield: 0, speed: 0, keyboard: 0, magnet: 0 });
  const [levelUpChoices, setLevelUpChoices] = useState([]);

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const skillsRef = useRef(skills);

  useEffect(() => {
    skillsRef.current = skills;
  }, [skills]);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const startGame = useCallback(() => {
    setHp(10);
    setTime(540);
    setXpData({ xp: 0, maxXp: 8, level: 1 });
    setSkills({ coffee: 1, vlookup: 0, shield: 0, speed: 0, keyboard: 0, magnet: 0 });
    setGameState('PLAYING');

    if (engineRef.current) engineRef.current.destroy();

    const engine = new GameEngine(
      canvasRef.current,
      {
        onHpChange: setHp,
        onXpChange: (xp, maxXp, level) => setXpData({ xp, maxXp, level }),
        onTimeChange: setTime,
        onGameOver: () => setGameState('GAMEOVER'),
        onWin: () => setGameState('WIN'),
        onLevelUp: () => {
          engine.pause();
          const current = skillsRef.current;
          const available = Object.keys(SKILLS).filter(k => current[k] < SKILLS[k].max);
          const shuffled = available.sort(() => 0.5 - Math.random());
          const choices = shuffled.slice(0, 3);
          setLevelUpChoices(choices.length > 0 ? choices : ['heal']);
          setGameState('LEVELUP');
        }
      },
      () => skillsRef.current
    );

    engineRef.current = engine;
    engine.start();
  }, []);

  const selectSkill = (skillId) => {
    if (skillId === 'heal') {
      setHp(10);
      if (engineRef.current) engineRef.current.player.hp = 10;
    } else {
      setSkills(prev => ({ ...prev, [skillId]: prev[skillId] + 1 }));
    }
    setGameState('PLAYING');
    if (engineRef.current) engineRef.current.start();
  };

  useEffect(() => {
    return () => {
      if (engineRef.current) engineRef.current.destroy();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans touch-none select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {gameState !== 'START' && (
        <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="backdrop-blur-md bg-slate-800/60 p-3 rounded-xl border border-slate-600/50 shadow-lg pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-2xl font-black text-amber-400 tracking-wider">
                  {formatTime(time)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-300">
                <span>LV. {xpData.level}</span>
                <span>{Math.floor((xpData.xp / xpData.maxXp) * 100)}%</span>
              </div>
              <div className="w-40 h-2 bg-slate-900/80 rounded-full mt-1 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                  style={{ width: `${(xpData.xp / xpData.maxXp) * 100}%` }}
                />
              </div>
            </div>

            <div className="backdrop-blur-md bg-slate-800/60 p-3 rounded-xl border border-slate-600/50 shadow-lg flex items-center gap-2 pointer-events-auto">
              <Heart className={`w-8 h-8 ${hp <= 3 ? 'text-red-500 fill-red-500 animate-pulse' : 'text-rose-400 fill-rose-400'}`} />
              <span className={`text-3xl font-black ${hp <= 3 ? 'text-red-500' : 'text-slate-100'}`}>
                x {hp}
              </span>
            </div>
          </div>
        </div>
      )}

      {gameState !== 'PLAYING' && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {gameState === 'START' && (
            <div className="bg-slate-800/90 border border-slate-600 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden transform transition-all">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
              
              <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 text-transparent bg-clip-text">
                오피스 서바이버
              </h1>
              <p className="text-slate-400 mb-8 font-medium">REMASTERED</p>
              
              <div className="bg-slate-900/50 rounded-xl p-5 mb-8 text-left border border-slate-700/50 space-y-3">
                <p className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="p-2 bg-slate-800 rounded-lg"><span className="text-xl">🕹️</span></span>
                  <span><b className="text-white">드래그 & 방향키</b>로 이동하세요.</span>
                </p>
                <p className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="p-2 bg-slate-800 rounded-lg"><span className="text-xl">☕</span></span>
                  <span>가장 가까운 적에게 <b>자동 공격</b>합니다.</span>
                </p>
                <p className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="p-2 bg-slate-800 rounded-lg"><span className="text-xl">📄</span></span>
                  <span>서류를 주워 <b>레벨업</b>하고 스킬을 얻으세요.</span>
                </p>
              </div>

              <button
                onClick={startGame}
                className="group relative w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                <span className="text-lg tracking-wide">출근하기 (게임 시작)</span>
              </button>
            </div>
          )}

          {gameState === 'LEVELUP' && (
            <div className="bg-slate-800/90 border border-slate-600 p-6 rounded-2xl shadow-2xl max-w-lg w-full text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ChevronUp className="w-8 h-8 text-yellow-400 animate-bounce" />
                <h2 className="text-3xl font-black text-yellow-400">인사 평가</h2>
              </div>
              <p className="mb-6 text-slate-300">새로운 스킬을 선택하거나 강화하세요.</p>
              
              <div className="flex flex-col gap-3">
                {levelUpChoices.map(key => {
                  if (key === 'heal') {
                    return (
                      <button key="heal" onClick={() => selectSkill('heal')}
                        className="group flex items-center gap-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-xl transition-all hover:scale-[1.02]">
                        <div className="bg-emerald-500/20 p-3 rounded-lg"><Heart className="w-6 h-6 text-emerald-400 fill-emerald-400" /></div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-emerald-400 text-lg">💊 비타민 C (체력 회복)</div>
                          <div className="text-sm text-slate-400">모든 스킬 마스터! 체력을 가득 채웁니다.</div>
                        </div>
                      </button>
                    );
                  }
                  
                  const skill = SKILLS[key];
                  const currentLevel = skills[key];
                  const Icon = skill.icon;
                  const isNew = currentLevel === 0;

                  return (
                    <button key={key} onClick={() => selectSkill(key)}
                      className={`group flex items-center gap-4 ${skill.bg} hover:bg-slate-700/80 border ${skill.border} p-4 rounded-xl transition-all hover:scale-[1.02]`}>
                      <div className="bg-slate-900/50 p-3 rounded-lg shadow-inner">
                        <Icon className={`w-6 h-6 ${skill.color}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 font-bold text-lg text-slate-100">
                          {skill.name}
                          <span className={`text-xs px-2 py-0.5 rounded font-black tracking-wider ${isNew ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                            {isNew ? 'NEW' : `LV.${currentLevel + 1}`}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1 leading-snug">{skill.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
            <div className="bg-slate-800/90 border border-slate-600 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
              <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-4xl font-black mb-2 text-red-500">야근 확정...</h2>
              <p className="mb-6 text-slate-400 text-lg">업무 스트레스로 쓰러졌습니다.<br/>버틴 시간: <b className="text-white">{formatTime(time)}</b></p>
              
              <button
                onClick={startGame}
                className="w-full flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                <span>재입사하기 (다시 시작)</span>
              </button>
            </div>
          )}

          {gameState === 'WIN' && (
            <div className="bg-slate-800/90 border border-emerald-600/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] max-w-md w-full text-center">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <h2 className="text-4xl font-black mb-2 text-emerald-400">칼퇴 성공! 🎉</h2>
              <p className="mb-8 text-slate-300 text-lg">무사히 18:00를 맞이했습니다.<br/>오늘도 고생하셨습니다!</p>
              
              <button
                onClick={startGame}
                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                <span>내일 다시 출근하기</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
