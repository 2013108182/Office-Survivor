import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Clock, Zap, Shield, Coffee, TrendingUp,
  Skull, Trophy, Play, RefreshCw, ChevronUp, Keyboard, Magnet,
  Paperclip, MousePointer2, CloudLightning, Undo, Flame, Disc
} from 'lucide-react';

// --- 스킬 메타 데이터 ---
const SKILLS = {
  coffee: {
    id: 'coffee', name: '아메리카노 수혈', desc: '자동 발사. 연사력과 화력이 증가합니다.',
    max: 5, icon: Coffee, color: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10', unlockDay: 1
  },
  xlookup: {
    id: 'xlookup', name: 'xlookup 광역기', desc: '데이터를 스캔하여 주변 적에게 지속 피해를 줍니다.',
    max: 5, icon: Zap, color: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10', unlockDay: 2
  },
  stapler: {
    id: 'stapler', name: '결재 서류철', desc: '적을 관통하며 날아가는 서류철을 날립니다.',
    max: 5, icon: Paperclip, color: 'text-rose-400', border: 'border-rose-400/50', bg: 'bg-rose-400/10', unlockDay: 2
  },
  mouse: {
    id: 'mouse', name: '무선 마우스', desc: '플레이어 주변을 회전하는 마우스를 소환합니다.',
    max: 5, icon: MousePointer2, color: 'text-slate-400', border: 'border-slate-400/50', bg: 'bg-slate-400/10', unlockDay: 3
  },
  lightning: {
    id: 'lightning', name: '긴급 호출 (낙뢰)', desc: '랜덤한 적에게 벼락을 떨어뜨려 광역 피해를 줍니다.',
    max: 5, icon: CloudLightning, color: 'text-yellow-300', border: 'border-yellow-300/50', bg: 'bg-yellow-300/10', unlockDay: 3
  },
  boomerang: {
    id: 'boomerang', name: '반려된 기획서', desc: '날아갔다가 플레이어에게 되돌아오는 부메랑을 던집니다.',
    max: 5, icon: Undo, color: 'text-orange-400', border: 'border-orange-400/50', bg: 'bg-orange-400/10', unlockDay: 4
  },
  shield: {
    id: 'shield', name: '메신저 읽씹', desc: '공격을 1회 방어하는 쉴드를 생성합니다.',
    max: 3, icon: Shield, color: 'text-cyan-400', border: 'border-cyan-400/50', bg: 'bg-cyan-400/10', unlockDay: 3
  },
  molotov: {
    id: 'molotov', name: '분노의 야근 (화염병)', desc: '지면에 일정 시간 유지되는 불길 장판을 생성합니다.',
    max: 5, icon: Flame, color: 'text-red-500', border: 'border-red-500/50', bg: 'bg-red-500/10', unlockDay: 4
  },
  soccer: {
    id: 'soccer', name: '탕비실 텀블러', desc: '화면과 적에게 튕기며 물리 피해를 주는 텀블러를 던집니다.',
    max: 5, icon: Disc, color: 'text-zinc-300', border: 'border-zinc-300/50', bg: 'bg-zinc-300/10', unlockDay: 5
  },
  magnet: {
    id: 'magnet', name: '끌어당김의 법칙', desc: '경험치(서류)를 끌어당기는 범위가 대폭 넓어집니다.',
    max: 5, icon: Magnet, color: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/10', unlockDay: 4
  },
  speed: {
    id: 'speed', name: '칼퇴 본능', desc: '마음이 급해져 이동 속도가 대폭 상승합니다.',
    max: 3, icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400/10', unlockDay: 1
  },
  keyboard: {
    id: 'keyboard', name: '키보드 샷건', desc: '주기적으로 8방향으로 사직서를 날립니다.',
    max: 5, icon: Keyboard, color: 'text-indigo-400', border: 'border-indigo-400/50', bg: 'bg-indigo-400/10', unlockDay: 5
  }
};

// --- Area Of Effect (장판 스킬) ---
class AreaOfEffect {
  constructor(x, y, radius, damage, duration, emoji, color) {
    this.x = x; this.y = y; this.radius = radius;
    this.damage = damage; this.duration = duration;
    this.maxDuration = duration;
    this.emoji = emoji; this.color = color;
    this.tickTimer = 0;
  }
  update(dt, engine) {
    this.duration -= dt;
    if (this.duration <= 0) return false;

    this.tickTimer += dt;
    if (this.tickTimer >= 30) { // 0.5초(30프레임)마다 타격
      this.tickTimer = 0;
      engine.enemies.forEach(e => {
        if (Math.hypot(e.x - this.x, e.y - this.y) < this.radius + e.size) {
          e.takeDamage(this.damage, engine);
        }
      });
    }
    return true;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.min(1, this.duration / 30);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

// --- 게임 엔진 (Canvas Logic) ---
class GameEngine {
  constructor(canvas, callbacks, getSkills, day = 1, initialStats = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;
    this.getSkills = getSkills;
    this.day = day;

    this.isRunning = false;
    this.lastTime = performance.now();
    this.spawnTimer = 0;
    this.frameCount = 0;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.time = 9 * 60; // 09:00 시작 (540분)
    this.endTime = 18 * 60; // 18:00 종료
    this.lastReportedTime = this.time;

    this.cameraX = 0;
    this.cameraY = 0;

    this.player = new Player(0, 0, this, initialStats);
    this.enemies = [];
    this.projectiles = [];
    this.aoes = [];
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
    
    const dt = Math.min(deltaTime / 16.666, 3);

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

    this.update(dt);
    this.draw();

    requestAnimationFrame((n) => this.loop(n));
  }

  update(dt) {
    this.player.update(dt);

    this.cameraX = this.player.x - this.width / 2;
    this.cameraY = this.player.y - this.height / 2;

    const progress = (this.time - 540) / (this.endTime - 540);
    const dayFactor = (this.day - 1) * 3;
    const spawnRate = Math.max(10, 80 - (progress * 60) - dayFactor);

    this.spawnTimer += dt;
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer -= spawnRate;
      const rand = Math.random();
      let type = 'spam';
      if (rand > 0.90 - (progress * 0.2)) type = 'folder';
      else if (rand > 0.70 - (this.day * 0.03)) type = 'slack';
      else if (this.day >= 3 && rand > 0.5) type = 'bug';

      this.enemies.push(new Enemy(type, this.player.x, this.player.y, Math.max(this.width, this.height), progress, this.day));
    }

    this.aoes = this.aoes.filter(a => a.update(dt, this));

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const alive = p.update(dt, this);
      
      if (!alive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      let remove = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (!p.hitIds.has(e.id) && Math.hypot(p.x - e.x, p.y - e.y) < p.size + e.size) {
          e.takeDamage(p.damage, this);
          p.hitIds.add(e.id);
          this.addParticle(p.x, p.y, '#fbbf24', 3);
          
          if (p.type === 'soccer') {
            // 튕기기 물리엔진 (간단화)
            p.vx *= -1; p.vy *= -1;
            p.hitIds.clear(); // 튕긴 후 다시 맞출 수 있게
            p.pierce--;
            if (p.pierce <= 0) remove = true;
          } else if (p.type !== 'boomerang') {
            p.pierce--;
            if (p.pierce <= 0) remove = true;
          }
        }
      }

      if (remove || (p.type !== 'boomerang' && p.type !== 'soccer' && p.isOutOfBounds(this.cameraX, this.cameraY, this.width, this.height))) {
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
      e.update(this.player, dt);

      if (Math.hypot(this.player.x - e.x, this.player.y - e.y) < e.size + this.player.size - 5) {
        this.player.takeDamage(1);
        e.hp = 0;
      }
    }

    for (let i = this.gems.length - 1; i >= 0; i--) {
      if (this.gems[i].update(this.player, dt)) {
        this.gems.splice(i, 1);
      }
    }

    this.particles = this.particles.filter(p => p.update(dt));
    this.texts = this.texts.filter(t => t.update(dt));
  }

  draw() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, -this.cameraY);

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

    this.aoes.forEach(a => a.draw(this.ctx));
    this.gems.forEach(g => g.draw(this.ctx));
    this.enemies.forEach(e => e.draw(this.ctx));
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.particles.forEach(p => p.draw(this.ctx));
    this.player.draw(this.ctx);
    this.texts.forEach(t => t.draw(this.ctx));

    this.ctx.restore();

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
  constructor(x, y, engine, initialStats = {}) {
    this.x = x; this.y = y; this.engine = engine;
    this.size = 20; this.baseSpeed = 3.5;
    this.maxHp = 10;
    this.hp = initialStats.hp || 10;
    this.xp = initialStats.xp || 0;
    this.maxXp = initialStats.maxXp || 8;
    this.level = initialStats.level || 1;

    this.coffeeCooldown = 0;
    this.staplerCooldown = 0;
    this.lightningTimer = 0;
    this.boomerangTimer = 0;
    this.molotovTimer = 0;
    this.soccerTimer = 0;

    this.xlookupAngle = 0;
    this.xlookupTimer = 0;
    this.mouseAngle = 0;
    this.mouseHitTimer = 0;
    this.shieldActive = false;
    this.shieldCooldown = 0;
    this.keyboardTimer = 0;
  }

  update(dt) {
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
    this.x += dx * speed * dt;
    this.y += dy * speed * dt;

    // 아메리카노 (가장 가까운 적 기본 공격)
    this.coffeeCooldown -= dt;
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
        this.engine.projectiles.push(new Projectile(this.x, this.y, angle, pSpeed, pDamage, '☕', 1, 'normal'));
        this.coffeeCooldown = Math.max(15, 60 - (skills.coffee * 10));
      }
    }

    // 결재 서류철 (관통 공격)
    if (skills.stapler > 0) {
      this.staplerCooldown -= dt;
      if (this.staplerCooldown <= 0 && this.engine.enemies.length > 0) {
        let closest = null, minDist = Infinity;
        this.engine.enemies.forEach(e => {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minDist) { minDist = d; closest = e; }
        });
        if (closest) {
          const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
          const pDamage = 1.5 + (skills.stapler * 0.8);
          const pierce = 1 + skills.stapler;
          this.engine.projectiles.push(new Projectile(this.x, this.y, angle, 9, pDamage, '📎', pierce, 'normal'));
          this.staplerCooldown = Math.max(40, 100 - (skills.stapler * 10));
        }
      }
    }

    // [신규] 번개 발사기 (낙뢰)
    if (skills.lightning > 0) {
      this.lightningTimer += dt;
      if (this.lightningTimer > 100 - (skills.lightning * 10)) {
        this.lightningTimer = 0;
        const target = this.engine.enemies[Math.floor(Math.random() * this.engine.enemies.length)];
        if (target) {
          const damage = 3 + skills.lightning * 1.5;
          const radius = 60 + skills.lightning * 10;
          this.engine.addParticle(target.x, target.y, '#facc15', 15);
          this.engine.addText(target.x, target.y - 20, '⚡', '#facc15');
          this.engine.enemies.forEach(e => {
            if (Math.hypot(e.x - target.x, e.y - target.y) < radius) {
              e.takeDamage(damage, this.engine);
            }
          });
        }
      }
    }

    // [신규] 부메랑
    if (skills.boomerang > 0) {
      this.boomerangTimer += dt;
      if (this.boomerangTimer > 110 - (skills.boomerang * 12)) {
        this.boomerangTimer = 0;
        let closest = null, minDist = Infinity;
        this.engine.enemies.forEach(e => {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minDist) { minDist = d; closest = e; }
        });
        const angle = closest ? Math.atan2(closest.y - this.y, closest.x - this.x) : Math.random() * Math.PI * 2;
        const damage = 1.5 + skills.boomerang * 0.8;
        // pierce=Infinity, type='boomerang'
        this.engine.projectiles.push(new Projectile(this.x, this.y, angle, 10, damage, '🪃', Infinity, 'boomerang'));
      }
    }

    // [신규] 화염병 (장판)
    if (skills.molotov > 0) {
      this.molotovTimer += dt;
      if (this.molotovTimer > 160 - (skills.molotov * 15)) {
        this.molotovTimer = 0;
        const target = this.engine.enemies[Math.floor(Math.random() * this.engine.enemies.length)];
        const targetX = target ? target.x : this.x;
        const targetY = target ? target.y : this.y;
        const damage = 0.5 + skills.molotov * 0.3;
        const duration = 180 + skills.molotov * 30;
        this.engine.aoes.push(new AreaOfEffect(targetX, targetY, 80, damage, duration, '🔥', 'rgba(239, 68, 68, 0.3)'));
      }
    }

    // [신규] 축구공 (바운스)
    if (skills.soccer > 0) {
      this.soccerTimer += dt;
      if (this.soccerTimer > 130 - (skills.soccer * 12)) {
        this.soccerTimer = 0;
        const angle = Math.random() * Math.PI * 2;
        const damage = 2 + skills.soccer * 1;
        const bounces = 3 + skills.soccer;
        this.engine.projectiles.push(new Projectile(this.x, this.y, angle, 8, damage, '⚽', bounces, 'soccer'));
      }
    }

    // 키보드 샷건 (8방향)
    if (skills.keyboard > 0) {
      this.keyboardTimer += dt;
      if (this.keyboardTimer > 120 - (skills.keyboard * 12)) {
        this.keyboardTimer = 0;
        const damage = 1 + (skills.keyboard * 0.5);
        for(let i=0; i<8; i++) {
          const angle = (Math.PI / 4) * i;
          this.engine.projectiles.push(new Projectile(this.x, this.y, angle, 6, damage, '📄', 1, 'normal'));
        }
      }
    }

    // xlookup (광역 오라)
    if (skills.xlookup > 0) {
      this.xlookupAngle += 0.05 * dt;
      this.xlookupTimer += dt;
      if (this.xlookupTimer >= 20) {
        this.xlookupTimer -= 20;
        const radius = 70 + (skills.xlookup * 25);
        const damage = 0.5 + (skills.xlookup * 0.4);
        this.engine.enemies.forEach(e => {
          if (Math.hypot(e.x - this.x, e.y - this.y) < radius + e.size) {
            e.takeDamage(damage, this.engine);
            this.engine.addParticle(e.x, e.y, '#38bdf8', 1);
          }
        });
      }
    }

    // 무선 마우스 (주위를 회전하는 궤도 공격)
    if (skills.mouse > 0) {
      this.mouseAngle += 0.08 * dt;
      this.mouseHitTimer += dt;
      const count = skills.mouse;
      const radius = 60 + skills.mouse * 5;
      const damage = 0.8 + skills.mouse * 0.4;
      
      const canHit = this.mouseHitTimer > 15;
      if (canHit) this.mouseHitTimer = 0;

      for (let i = 0; i < count; i++) {
        const angle = this.mouseAngle + (Math.PI * 2 / count) * i;
        const mx = this.x + Math.cos(angle) * radius;
        const my = this.y + Math.sin(angle) * radius;

        if (canHit) {
          this.engine.enemies.forEach(e => {
            if (Math.hypot(e.x - mx, e.y - my) < e.size + 15) {
              e.takeDamage(damage, this.engine);
              this.engine.addParticle(mx, my, '#94a3b8', 2);
            }
          });
        }
      }
    }

    // 쉴드
    if (skills.shield > 0 && !this.shieldActive) {
      if (this.shieldCooldown > 0) this.shieldCooldown -= dt;
      else this.shieldActive = true;
    }
  }

  draw(ctx) {
    const skills = this.engine.getSkills();

    if (skills.xlookup > 0) {
      const radius = 70 + (skills.xlookup * 25);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.xlookupAngle);

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

    if (skills.mouse > 0) {
      const count = skills.mouse;
      const radius = 60 + skills.mouse * 5;
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < count; i++) {
        const angle = this.mouseAngle + (Math.PI * 2 / count) * i;
        const mx = this.x + Math.cos(angle) * radius;
        const my = this.y + Math.sin(angle) * radius;
        ctx.fillText('🖱️', mx, my);
      }
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
  constructor(type, playerX, playerY, maxScreenDim, progress, day) {
    this.id = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const dist = maxScreenDim * 0.6;
    this.x = playerX + Math.cos(angle) * dist;
    this.y = playerY + Math.sin(angle) * dist;
    this.type = type;

    const diff = 1 + progress * 2.5 + (day - 1) * 0.5;

    if (type === 'spam') {
      this.emoji = '📧'; this.size = 15;
      this.hp = 1.5 * diff; this.speed = 1.8 + Math.random();
      this.xpValue = 1; this.particleColor = '#f472b6';
    } else if (type === 'slack') {
      this.emoji = '💬'; this.size = 18;
      this.hp = 2.5 * diff; this.speed = 2.2 + Math.random();
      this.xpValue = 2; this.particleColor = '#60a5fa';
      this.stateTimer = 0;
    } else if (type === 'bug') {
      this.emoji = '🐛'; this.size = 14;
      this.hp = 2.0 * diff; this.speed = 2.5 + Math.random();
      this.xpValue = 1; this.particleColor = '#84cc16';
      this.waveTimer = Math.random() * Math.PI * 2;
    } else { // folder
      this.emoji = '🗂️'; this.size = 25;
      this.hp = 6 * diff; this.speed = 0.8 + Math.random() * 0.5;
      this.xpValue = 5; this.particleColor = '#fbbf24';
    }
    this.maxHp = this.hp;
  }

  update(player, dt) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);

    if (this.type === 'slack') { 
      this.stateTimer += dt;
      if (this.stateTimer < 60) {
        this.x += Math.cos(angle) * this.speed * 0.4 * dt;
        this.y += Math.sin(angle) * this.speed * 0.4 * dt;
        this.dashAngle = angle;
      } else if (this.stateTimer < 80) {
        this.x += Math.cos(this.dashAngle) * this.speed * 4.0 * dt;
        this.y += Math.sin(this.dashAngle) * this.speed * 4.0 * dt;
      } else {
        this.stateTimer = 0;
      }
    } else if (this.type === 'bug') { 
      this.waveTimer += 0.1 * dt;
      const waveAngle = angle + Math.PI / 2;
      const waveAmp = Math.sin(this.waveTimer) * 3.5;
      this.x += (Math.cos(angle) * this.speed + Math.cos(waveAngle) * waveAmp) * dt;
      this.y += (Math.sin(angle) * this.speed + Math.sin(waveAngle) * waveAmp) * dt;
    } else { 
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }
  }

  draw(ctx) {
    ctx.font = `${this.size * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, this.x, this.y);

    // HP Bar (피격된 적만 표시)
    if (this.hp < this.maxHp) {
      const hpPercent = Math.max(0, this.hp / this.maxHp);
      const barWidth = 30;
      ctx.fillStyle = '#ef4444'; // 빨간색 배경
      ctx.fillRect(this.x - barWidth/2, this.y - this.size - 10, barWidth, 4);
      ctx.fillStyle = '#22c55e'; // 녹색 체력
      ctx.fillRect(this.x - barWidth/2, this.y - this.size - 10, barWidth * hpPercent, 4);
    }
  }

  takeDamage(amt, engine) {
    this.hp -= amt;
    engine.addText(this.x, this.y - 20, Math.ceil(amt).toString(), "#ffffff");
  }
}

class Projectile {
  constructor(x, y, angle, speed, damage, emoji = '☕', pierce = 1, type = 'normal') {
    this.x = x; this.y = y;
    this.speed = speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.size = 10;
    this.emoji = emoji;
    this.pierce = pierce; 
    this.type = type;
    this.hitIds = new Set();
    
    // 특수 스킬 용 변수
    this.lifeTimer = 40; // 부메랑 왕복 시간
    this.returning = false;
  }
  
  update(dt, engine) {
    if (this.type === 'boomerang') {
      this.lifeTimer -= dt;
      if (this.lifeTimer <= 0 && !this.returning) {
        this.returning = true;
        this.hitIds.clear(); // 돌아올 때 다시 타격 가능
      }
      if (this.returning) {
        const angle = Math.atan2(engine.player.y - this.y, engine.player.x - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        // 플레이어에게 닿으면 소멸
        if (Math.hypot(engine.player.x - this.x, engine.player.y - this.y) < 30) {
          return false;
        }
      }
    }

    if (this.type === 'soccer') {
      // 화면(카메라) 밖으로 나가면 튕김 처리
      const cx = engine.cameraX;
      const cy = engine.cameraY;
      const w = engine.width;
      const h = engine.height;

      if (this.x < cx) { this.x = cx; this.vx *= -1; this.pierce--; this.hitIds.clear(); }
      else if (this.x > cx + w) { this.x = cx + w; this.vx *= -1; this.pierce--; this.hitIds.clear(); }
      
      if (this.y < cy) { this.y = cy; this.vy *= -1; this.pierce--; this.hitIds.clear(); }
      else if (this.y > cy + h) { this.y = cy + h; this.vy *= -1; this.pierce--; this.hitIds.clear(); }

      if (this.pierce <= 0) return false;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    return true; // 계속 살아있음
  }

  draw(ctx) {
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 10;
    
    // 부메랑 회전 효과
    if (this.type === 'boomerang') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Date.now() * 0.01);
      ctx.fillText(this.emoji, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(this.emoji, this.x, this.y);
    }
    
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
  update(player, dt) {
    const skills = player.engine.getSkills();
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < 120 + (skills.magnet * 60)) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * 7 * dt;
      this.y += Math.sin(angle) * 7 * dt;
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
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= this.decay * dt;
    return this.life > 0;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.life);
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
  update(dt) {
    this.y -= 1.5 * dt;
    this.life -= 0.03 * dt;
    return this.life > 0;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.life);
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
  const [day, setDay] = useState(1);
  const [hp, setHp] = useState(10);
  const [time, setTime] = useState(540);
  const [xpData, setXpData] = useState({ xp: 0, maxXp: 8, level: 1 });
  
  const [skills, setSkills] = useState({ 
    coffee: 1, xlookup: 0, shield: 0, speed: 0, keyboard: 0, magnet: 0, stapler: 0, mouse: 0,
    lightning: 0, boomerang: 0, molotov: 0, soccer: 0
  });
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

  const startDay = useCallback((currentDay, currentHp, currentXpData, currentSkills) => {
    setDay(currentDay);
    setHp(currentHp);
    setTime(540);
    setXpData(currentXpData);
    setSkills(currentSkills);
    setGameState('PLAYING');

    if (engineRef.current) engineRef.current.destroy();

    const engine = new GameEngine(
      canvasRef.current,
      {
        onHpChange: setHp,
        onXpChange: (xp, maxXp, level) => setXpData({ xp, maxXp, level }),
        onTimeChange: setTime,
        onGameOver: () => setGameState('GAMEOVER'),
        onWin: () => {
          if (currentDay >= 10) {
            setGameState('WIN');
          } else {
            setGameState('DAYCLEAR');
          }
        },
        onLevelUp: () => {
          engine.pause();
          const current = skillsRef.current;
          const available = Object.keys(SKILLS).filter(k => current[k] < SKILLS[k].max && SKILLS[k].unlockDay <= currentDay);
          const shuffled = available.sort(() => 0.5 - Math.random());
          const choices = shuffled.slice(0, 3);
          setLevelUpChoices(choices.length > 0 ? choices : ['heal']);
          setGameState('LEVELUP');
        }
      },
      () => skillsRef.current,
      currentDay,
      { hp: currentHp, xp: currentXpData.xp, maxXp: currentXpData.maxXp, level: currentXpData.level }
    );

    engineRef.current = engine;
    engine.start();
  }, []);

  const startGame = useCallback(() => {
    startDay(1, 10, { xp: 0, maxXp: 8, level: 1 }, { 
      coffee: 1, xlookup: 0, shield: 0, speed: 0, keyboard: 0, magnet: 0, stapler: 0, mouse: 0,
      lightning: 0, boomerang: 0, molotov: 0, soccer: 0 
    });
  }, [startDay]);

  const nextDay = useCallback(() => {
    startDay(day + 1, hp, xpData, skills);
  }, [day, hp, xpData, skills, startDay]);

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
                <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded mr-1">DAY {day}</span>
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
                  <span className="p-2 bg-slate-800 rounded-lg"><span className="text-xl">📅</span></span>
                  <span>총 <b className="text-white">10일차(10 스테이지)</b>까지 버텨야 합니다.</span>
                </p>
                <p className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="p-2 bg-slate-800 rounded-lg"><span className="text-xl">🔓</span></span>
                  <span>생존 일차가 오를수록 <b>새로운 스킬이 해제</b>됩니다.</span>
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
              <p className="mb-6 text-slate-400 text-lg">업무 스트레스로 쓰러졌습니다.<br/>도달 기록: <b className="text-white">DAY {day} - {formatTime(time)}</b></p>
              
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
              <h2 className="text-4xl font-black mb-2 text-emerald-400">최종 클리어! 🎉</h2>
              <p className="mb-8 text-slate-300 text-lg">지옥 같은 10일을 버티고 휴가를 획득했습니다.<br/>당신은 진정한 오피스 서바이버!</p>
              
              <button
                onClick={startGame}
                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                <span>처음부터 다시 도전하기</span>
              </button>
            </div>
          )}

          {gameState === 'DAYCLEAR' && (
            <div className="bg-slate-800/90 border border-blue-500/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] max-w-md w-full text-center">
              <Trophy className="w-16 h-16 text-blue-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
              <h2 className="text-4xl font-black mb-2 text-blue-400">DAY {day} 퇴근 성공!</h2>
              <p className="mb-8 text-slate-300 text-lg">오늘 하루도 무사히 넘겼습니다.<br/>하지만 내일도 출근해야 합니다...</p>
              
              <button
                onClick={nextDay}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Play className="w-5 h-5" />
                <span>DAY {day + 1} 출근하기</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
