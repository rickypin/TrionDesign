import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  // 从 localStorage 读取用户偏好，默认为 'system'
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // 根据选择的主题应用对应的类
    if (theme === 'system') {
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = (e: MediaQueryList | MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      
      // 初始应用
      applySystemTheme(mediaQuery);
      
      // 监听变化
      mediaQuery.addEventListener('change', applySystemTheme);
      
      return () => {
        mediaQuery.removeEventListener('change', applySystemTheme);
      };
    } else if (theme === 'dark') {
      // 手动设置为深色
      root.classList.add('dark');
    } else {
      // 手动设置为浅色
      root.classList.remove('dark');
    }
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 获取当前实际显示的主题（解析 system）
  const getResolvedTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  return {
    theme,
    setTheme: changeTheme,
    resolvedTheme: getResolvedTheme(),
  };
};

