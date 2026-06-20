#!/usr/bin/env python3
"""批次生成魔境獵人圖片
- 7 武器 + 30 一般魔物 + 10 Boss = 47 張
- 用 MiniMax image-01 API
- 每天配額 50 張
"""
import os
import sys
import json
import time
import urllib.request
import urllib.parse

API_KEY = "MINIMAX_API_KEY_REVOKED_20260620"
API_URL = "https://api.minimax.io/v1/image_generation"
PROJECT_ROOT = "/Users/alex_bot_0223/.openclaw/workspace/magic-realm-hunter"

# ========== 武器清單（已生 sword） ==========
WEAPONS = [
    ("sword", "16-bit pixel art JRPG sword weapon icon, dark fantasy, single handed longsword, silver blade with leather wrapped handle, dark background, clean lines, retro game asset"),
    ("spear", "16-bit pixel art JRPG spear weapon icon, dark fantasy, long polearm with metal spearhead and wooden shaft, dark background, retro game asset"),
    ("bow", "16-bit pixel art JRPG bow weapon icon, dark fantasy, recurve bow with bowstring, dark background, retro game asset"),
    ("dual_blade", "16-bit pixel art JRPG dual blades weapon icon, dark fantasy, two short swords crossed, dark background, retro game asset"),
    ("long_sword", "16-bit pixel art JRPG great sword weapon icon, dark fantasy, massive two-handed katana with ornate guard, dark background, retro game asset"),
    ("hammer", "16-bit pixel art JRPG war hammer weapon icon, dark fantasy, large hammer with stone head and wooden handle, dark background, retro game asset"),
    ("gunlance", "16-bit pixel art JRPG gunlance weapon icon, dark fantasy, lance with integrated firearm barrel, dark background, retro game asset"),
]

# ========== 一般魔物（30 隻） ==========
MONSTERS = [
    # 森林（5）
    ("wolf", "16-bit pixel art JRPG forest wolf creature, dark fantasy forest, brown fur with glowing eyes, side view, dark background, retro game enemy sprite"),
    ("spider", "16-bit pixel art JRPG giant spider creature, dark fantasy, large black arachnid with red markings, side view, dark background, retro game enemy sprite"),
    ("mushroom", "16-bit pixel art JRPG poisonous mushroom humanoid, dark fantasy, bipedal mushroom creature with red cap, side view, dark background, retro game enemy sprite"),
    ("lizard", "16-bit pixel art JRPG forest lizard creature, dark fantasy, green reptilian with sharp claws, side view, dark background, retro game enemy sprite"),
    ("bee", "16-bit pixel art JRPG giant bee creature, dark fantasy, oversized hornet with yellow stripes and stinger, side view, dark background, retro game enemy sprite"),
    # 沙漠（5）
    ("sand_lizard", "16-bit pixel art JRPG sand lizard creature, dark fantasy desert, tan scaled reptile with horns, side view, dark background, retro game enemy sprite"),
    ("camel", "16-bit pixel art JRPG dune camel beast, dark fantasy desert, large humped beast with thick fur, side view, dark background, retro game enemy sprite"),
    ("scorpion", "16-bit pixel art JRPG giant scorpion, dark fantasy desert, oversized scorpion with curved tail and pincers, side view, dark background, retro game enemy sprite"),
    ("sand_worm", "16-bit pixel art JRPG sand worm creature, dark fantasy desert, giant sand burrowing worm, side view, dark background, retro game enemy sprite"),
    ("skeleton", "16-bit pixel art JRPG skeleton warrior, dark fantasy, undead warrior with rusted sword and shield, side view, dark background, retro game enemy sprite"),
    # 雪原（5）
    ("snow_rabbit", "16-bit pixel art JRPG snow rabbit beast, dark fantasy tundra, white fluffy rabbit with ice crystals, side view, dark background, retro game enemy sprite"),
    ("ice_wolf", "16-bit pixel art JRPG ice wolf creature, dark fantasy tundra, blue-white wolf with frost breath, side view, dark background, retro game enemy sprite"),
    ("frost_giant", "16-bit pixel art JRPG frost giant, dark fantasy tundra, hulking ice giant with frozen armor, side view, dark background, retro game enemy sprite"),
    ("ice_bird", "16-bit pixel art JRPG ice bird creature, dark fantasy tundra, crystalline bird with ice feathers, side view, dark background, retro game enemy sprite"),
    ("white_bear", "16-bit pixel art JRPG polar bear creature, dark fantasy tundra, massive white bear with ice claws, side view, dark background, retro game enemy sprite"),
    # 火山（5）
    ("fire_lizard", "16-bit pixel art JRPG fire lizard creature, dark fantasy volcano, red-orange lizard with flames, side view, dark background, retro game enemy sprite"),
    ("rock_turtle", "16-bit pixel art JRPG rock turtle creature, dark fantasy volcano, massive turtle with lava shell, side view, dark background, retro game enemy sprite"),
    ("lava_golem", "16-bit pixel art JRPG lava golem creature, dark fantasy volcano, molten rock humanoid with lava veins, side view, dark background, retro game enemy sprite"),
    ("fire_bird", "16-bit pixel art JRPG fire bird phoenix, dark fantasy volcano, blazing bird with flame wings, side view, dark background, retro game enemy sprite"),
    ("flame_imp", "16-bit pixel art JRPG flame imp demon, dark fantasy volcano, small horned fire demon, side view, dark background, retro game enemy sprite"),
    # 沼澤（5）
    ("frog", "16-bit pixel art JRPG frog man creature, dark fantasy swamp, bipedal frog warrior with club, side view, dark background, retro game enemy sprite"),
    ("swamp_dragon", "16-bit pixel art JRPG swamp dragon, dark fantasy swamp, small green dragon with moss, side view, dark background, retro game enemy sprite"),
    ("poison_snake", "16-bit pixel art JRPG poison snake, dark fantasy swamp, large viper with venom dripping, side view, dark background, retro game enemy sprite"),
    ("leech", "16-bit pixel art JRPG giant leech, dark fantasy swamp, massive blood-sucking worm, side view, dark background, retro game enemy sprite"),
    ("undead", "16-bit pixel art JRPG rotting undead corpse, dark fantasy swamp, zombie warrior with tattered robes, side view, dark background, retro game enemy sprite"),
    # 洞窟（5）
    ("bat", "16-bit pixel art JRPG giant bat creature, dark fantasy cave, large bat with leathery wings, side view, dark background, retro game enemy sprite"),
    ("rat", "16-bit pixel art JRPG giant rat creature, dark fantasy cave, oversized plague rat with red eyes, side view, dark background, retro game enemy sprite"),
    ("ghost", "16-bit pixel art JRPG ghost spirit, dark fantasy cave, ethereal floating specter with glowing eyes, side view, dark background, retro game enemy sprite"),
    ("crystal", "16-bit pixel art JRPG crystal beast, dark fantasy cave, creature made of glowing crystals, side view, dark background, retro game enemy sprite"),
    ("stone_golem", "16-bit pixel art JRPG stone golem, dark fantasy cave, rocky humanoid guardian with glowing runes, side view, dark background, retro game enemy sprite"),
]

# ========== Boss（10 隻） ==========
BOSSES = [
    ("boss_forest_king", "16-bit pixel art JRPG forest king boss, dark fantasy, giant crowned wolf with glowing eyes and armor, intimidating stance, dark background, retro game boss sprite, dramatic"),
    ("boss_bee_queen", "16-bit pixel art JRPG hive queen boss, dark fantasy, giant queen bee with crown and royal wings, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_ancient_tree", "16-bit pixel art JRPG ancient treant boss, dark fantasy, massive tree humanoid with glowing eyes and twisted roots, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_flame_lord", "16-bit pixel art JRPG flame lord boss, dark fantasy volcano, armored demon with flaming sword and crown of fire, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_ice_queen", "16-bit pixel art JRPG ice queen boss, dark fantasy tundra, regal female figure with ice crown and frozen scepter, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_sand_serpent", "16-bit pixel art JRPG sand serpent boss, dark fantasy desert, colossal sand snake with jeweled hood, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_swamp_king", "16-bit pixel art JRPG swamp king boss, dark fantasy swamp, bloated toad king with crown of eyes, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_abyss_beast", "16-bit pixel art JRPG abyssal beast boss, dark fantasy, eldritch horror with multiple eyes and tentacles, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_sky_lord", "16-bit pixel art JRPG sky lord boss, dark fantasy, majestic armored griffin with storm wings, intimidating, dark background, retro game boss sprite, dramatic"),
    ("boss_demon_god", "16-bit pixel art JRPG demon god boss, dark fantasy, towering demon lord with horns and dark wings, ultimate boss, intimidating, dark background, retro game boss sprite, dramatic"),
]


def generate_one(prompt, output_path, retries=2):
    """呼叫 MiniMax API 生一張圖，下載到 output_path"""
    payload = {
        "model": "image-01",
        "prompt": prompt,
        "n": 1
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                if result.get('base_resp', {}).get('status_code') != 0:
                    print(f"  ✗ API error: {result}")
                    return False
                url = result['data']['image_urls'][0]
                # 下載
                with urllib.request.urlopen(url, timeout=60) as img_resp:
                    with open(output_path, 'wb') as f:
                        f.write(img_resp.read())
                return True
        except Exception as e:
            print(f"  ✗ Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    return False


def main():
    os.makedirs(f"{PROJECT_ROOT}/assets/weapons", exist_ok=True)
    os.makedirs(f"{PROJECT_ROOT}/assets/monsters", exist_ok=True)

    # 刪掉測試的 sword_test.jpeg
    test_path = f"{PROJECT_ROOT}/assets/weapons/sword_test.jpeg"
    if os.path.exists(test_path):
        os.remove(test_path)
        print(f"🗑️  刪除測試圖：{test_path}")

    tasks = []
    # 武器（sword 重新生，因為測試圖被刪了）
    for wid, prompt in WEAPONS:
        tasks.append(("weapons", wid, prompt))
    # 一般魔物
    for mid, prompt in MONSTERS:
        tasks.append(("monsters", mid, prompt))
    # Boss
    for bid, prompt in BOSSES:
        tasks.append(("monsters", bid, prompt))

    total = len(tasks)
    print(f"📦 總共 {total} 張圖片要生成")
    print(f"💰 每日配額 50，今日剩餘配額計算中...")

    success = 0
    failed = []

    for i, (folder, name, prompt) in enumerate(tasks, 1):
        output = f"{PROJECT_ROOT}/assets/{folder}/{name}.jpeg"
        if os.path.exists(output) and os.path.getsize(output) > 1000:
            print(f"[{i}/{total}] ⏭️  {folder}/{name} 已存在，跳過")
            success += 1
            continue

        print(f"[{i}/{total}] 🎨 生成 {folder}/{name}...")
        ok = generate_one(prompt, output)
        if ok:
            success += 1
            size_kb = os.path.getsize(output) / 1024
            print(f"         ✅ {size_kb:.0f}KB")
        else:
            failed.append(f"{folder}/{name}")
            print(f"         ❌ 失敗")

        # 避免 rate limit
        time.sleep(1.5)

    print(f"\n📊 完成：{success}/{total} 成功")
    if failed:
        print(f"❌ 失敗清單：{failed}")
        return False
    return True


if __name__ == '__main__':
    ok = main()
    sys.exit(0 if ok else 1)
