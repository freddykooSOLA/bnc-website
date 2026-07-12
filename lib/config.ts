import fs from 'fs';
import path from 'path';
import type { SiteConfig } from '@/types';
import defaultConfig from '@/config.json';

const CONFIG_FILENAME = 'config.json';
const CONFIG_PATH = path.join(process.cwd(), CONFIG_FILENAME);
const TMP_CONFIG_PATH = path.join('/tmp', 'bnc-config.json');

/** 内存缓存（Vercel 无服务器环境写入后即时生效） */
let memoryConfig: SiteConfig | null = null;

/** 深拷贝配置，避免意外修改导入的默认对象 */
function cloneConfig(config: SiteConfig): SiteConfig {
  return structuredClone(config);
}

/** 从文件读取配置（本地开发） */
function readConfigFromFile(filePath: string): SiteConfig | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as SiteConfig;
  } catch {
    return null;
  }
}

/** 读取站点配置（兼容 Vercel 无服务器环境） */
export function getConfig(): SiteConfig {
  if (memoryConfig) return cloneConfig(memoryConfig);

  const fromTmp = readConfigFromFile(TMP_CONFIG_PATH);
  if (fromTmp) {
    memoryConfig = fromTmp;
    return cloneConfig(fromTmp);
  }

  const fromCwd = readConfigFromFile(CONFIG_PATH);
  if (fromCwd) {
    memoryConfig = fromCwd;
    return cloneConfig(fromCwd);
  }

  memoryConfig = defaultConfig as SiteConfig;
  return cloneConfig(defaultConfig as SiteConfig);
}

/** 保存站点配置（Vercel 写入 /tmp，本地写入项目根目录） */
export function saveConfig(config: SiteConfig): void {
  const data = JSON.stringify(config, null, 2);
  memoryConfig = cloneConfig(config);

  // Vercel 等平台：文件系统只读，写入 /tmp
  try {
    fs.writeFileSync(TMP_CONFIG_PATH, data, 'utf-8');
  } catch {
    // 忽略 /tmp 写入失败
  }

  // 本地开发：写入项目根目录 config.json
  try {
    fs.writeFileSync(CONFIG_PATH, data, 'utf-8');
  } catch {
    // Vercel 上会失败，已通过内存和 /tmp 缓存
  }
}
