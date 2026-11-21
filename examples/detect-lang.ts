// 依瀏覽器偏好語言清單挑出展示站語言。
// 純函式且不引用任何外部符號：建置時以 toString() 內嵌進根目錄導向頁，導向頁沒有執行期依賴。
import type { Lang } from './shell-strings';

// 依清單順序取第一個有對應的語言：
// - 字形標示（hant／hans）優先於地區，例如 zh-Hant-CN 進繁體。
// - 沒有字形標示時，台灣、香港、澳門進繁體；其他中文（含單純的 zh）進簡體。
// - en 與 en-* 進英文；其他語言略過看下一項。清單為空或全無對應時進英文。
// - 不分大小寫，並容許用底線分隔。
export function detectLang(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const parts = String(tag).toLowerCase().split(/[-_]/);
    if (parts[0] === 'en') return 'en';
    if (parts[0] !== 'zh') continue;
    const subtags = parts.slice(1);
    if (subtags.includes('hant')) return 'zh-Hant';
    if (subtags.includes('hans')) return 'zh-Hans';
    if (subtags.some((s) => s === 'tw' || s === 'hk' || s === 'mo')) return 'zh-Hant';
    return 'zh-Hans';
  }
  return 'en';
}
