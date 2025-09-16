/**
 * 统一的类别映射系统
 * 在backend和frontend项目之间共享，使用数字ID代替文本类别
 */

export interface CategoryInfo {
  id: number;
  name: string;
  displayName: string;
  parentId?: number;
  level: number; // 1, 2, or 3
  urlPath: string; // URL路径
  hierarchicalName: string; // 完整层级名称，如 "Arts and Entertainment > Theatre > Reviews"
}

// 类别映射表
export const CATEGORY_MAP: { [key: number]: CategoryInfo } = {
  // 顶级类别 (Level 1)
  1: {
    id: 1,
    name: 'News',
    displayName: 'News',
    level: 1,
    urlPath: 'news',
    hierarchicalName: 'News'
  },
  2: {
    id: 2,
    name: 'Lifestyle',
    displayName: 'Lifestyle', 
    level: 1,
    urlPath: 'lifestyle',
    hierarchicalName: 'Lifestyle'
  },
  3: {
    id: 3,
    name: 'Arts and Entertainment',
    displayName: 'Arts and Entertainment',
    level: 1,
    urlPath: 'artsentertainment',
    hierarchicalName: 'Arts and Entertainment'
  },
  4: {
    id: 4,
    name: 'Opinion',
    displayName: 'Opinion',
    level: 1,
    urlPath: 'opinion',
    hierarchicalName: 'Opinion'
  },

  // News 子类别 (Level 2)
  11: {
    id: 11,
    name: 'Local',
    displayName: 'Local',
    parentId: 1,
    level: 2,
    urlPath: 'news/localnews',
    hierarchicalName: 'News > Local'
  },
  12: {
    id: 12,
    name: 'National',
    displayName: 'National',
    parentId: 1,
    level: 2,
    urlPath: 'news/nationalnews',
    hierarchicalName: 'News > National'
  },
  13: {
    id: 13,
    name: 'World',
    displayName: 'World',
    parentId: 1,
    level: 2,
    urlPath: 'news/world',
    hierarchicalName: 'News > World'
  },
  14: {
    id: 14,
    name: 'Features',
    displayName: 'Features',
    parentId: 1,
    level: 2,
    urlPath: 'news/features',
    hierarchicalName: 'News > Features'
  },
  15: {
    id: 15,
    name: 'Environment',
    displayName: 'Environment',
    parentId: 1,
    level: 2,
    urlPath: 'news/environment',
    hierarchicalName: 'News > Environment'
  },
  16: {
    id: 16,
    name: 'Media',
    displayName: 'Media',
    parentId: 1,
    level: 2,
    urlPath: 'news/media',
    hierarchicalName: 'News > Media'
  },

  // Lifestyle 子类别 (Level 2)
  21: {
    id: 21,
    name: 'Food and Wine',
    displayName: 'Food and Wine',
    parentId: 2,
    level: 2,
    urlPath: 'lifestyle/food-and-wine',
    hierarchicalName: 'Lifestyle > Food and Wine'
  },
  22: {
    id: 22,
    name: 'Sport',
    displayName: 'Sport',
    parentId: 2,
    level: 2,
    urlPath: 'lifestyle/sport',
    hierarchicalName: 'Lifestyle > Sport'
  },
  23: {
    id: 23,
    name: 'Travel',
    displayName: 'Travel',
    parentId: 2,
    level: 2,
    urlPath: 'lifestyle/travel',
    hierarchicalName: 'Lifestyle > Travel'
  },

  // Arts and Entertainment 子类别 (Level 2)
  31: {
    id: 31,
    name: 'Games',
    displayName: 'Games',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/games',
    hierarchicalName: 'Arts and Entertainment > Games'
  },
  32: {
    id: 32,
    name: 'Theatre',
    displayName: 'Theatre',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/theatre',
    hierarchicalName: 'Arts and Entertainment > Theatre'
  },
  33: {
    id: 33,
    name: 'Film',
    displayName: 'Film',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/film',
    hierarchicalName: 'Arts and Entertainment > Film'
  },
  34: {
    id: 34,
    name: 'Music',
    displayName: 'Music',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/music',
    hierarchicalName: 'Arts and Entertainment > Music'
  },
  35: {
    id: 35,
    name: 'Galleries',
    displayName: 'Galleries',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/galleries',
    hierarchicalName: 'Arts and Entertainment > Galleries'
  },
  36: {
    id: 36,
    name: 'Books',
    displayName: 'Books',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/books',
    hierarchicalName: 'Arts and Entertainment > Books'
  },
  37: {
    id: 37,
    name: 'Drawn and Quartered',
    displayName: 'Drawn and Quartered',
    parentId: 3,
    level: 2,
    urlPath: 'artsentertainment/drawn-and-quartered',
    hierarchicalName: 'Arts and Entertainment > Drawn and Quartered'
  },

  // Food and Wine 子类别 (Level 3)
  211: {
    id: 211,
    name: 'Restaurant Reviews',
    displayName: 'Restaurant Reviews',
    parentId: 21,
    level: 3,
    urlPath: 'lifestyle/food-and-wine/restaurant-reviews',
    hierarchicalName: 'Lifestyle > Food and Wine > Restaurant Reviews'
  },
  212: {
    id: 212,
    name: 'Wine Match',
    displayName: 'Wine Match',
    parentId: 21,
    level: 3,
    urlPath: 'lifestyle/food-and-wine/wine-match',
    hierarchicalName: 'Lifestyle > Food and Wine > Wine Match'
  },

  // Theatre 子类别 (Level 3)
  321: {
    id: 321,
    name: 'Reviews',
    displayName: 'Reviews',
    parentId: 32,
    level: 3,
    urlPath: 'artsentertainment/theatre/theatrereviews',
    hierarchicalName: 'Arts and Entertainment > Theatre > Reviews'
  },

  // Galleries 子类别 (Level 3)
  351: {
    id: 351,
    name: 'Exhibitions',
    displayName: 'Exhibitions',
    parentId: 35,
    level: 3,
    urlPath: 'artsentertainment/galleries/exhibitions',
    hierarchicalName: 'Arts and Entertainment > Galleries > Exhibitions'
  },
  352: {
    id: 352,
    name: 'Eye On The Street',
    displayName: 'Eye On The Street',
    parentId: 35,
    level: 3,
    urlPath: 'artsentertainment/galleries/eye-on-the-street',
    hierarchicalName: 'Arts and Entertainment > Galleries > Eye On The Street'
  }
};

// 特殊路由映射 (用于向后兼容)
export const SPECIAL_ROUTE_MAP: { [key: string]: number } = {
  'localnews': 11, // /localnews -> News > Local
  'news/localnews': 11, // /category/news/localnews -> News > Local
  'news/local': 11, // /category/news/local -> News > Local (backup)
  'opinion': 4,    // /opinion -> Opinion
  'arts/theatre/reviews': 321, // /category/arts/theatre/reviews -> Theatre Reviews (backup)
  'artsentertainment/theatre/theatrereviews': 321, // /category/artsentertainment/theatre/theatrereviews -> Theatre Reviews
};

// 调试：导出所有分类映射供前端使用
export const getAllCategoryMappings = () => {
  const mappings: { [key: string]: number } = { ...SPECIAL_ROUTE_MAP };
  
  // 添加所有正常的URL路径映射
  Object.values(CATEGORY_MAP).forEach(category => {
    mappings[category.urlPath] = category.id;
  });
  
  return mappings;
};

// 调试函数
export const debugCategoryMapping = () => {
  console.log('🔍 所有分类映射:', getAllCategoryMappings());
  console.log('🎯 Theatre Reviews 映射测试:');
  console.log('  - artsentertainment/theatre/theatrereviews:', getAllCategoryMappings()['artsentertainment/theatre/theatrereviews']);
  console.log('  - SPECIAL_ROUTE_MAP 中的值:', SPECIAL_ROUTE_MAP['artsentertainment/theatre/theatrereviews']);
  console.log('🎯 Local News 映射测试:');
  console.log('  - news/localnews:', getAllCategoryMappings()['news/localnews']);
};

// 辅助函数

/**
 * 根据ID获取类别信息
 */
export function getCategoryById(id: number): CategoryInfo | undefined {
  return CATEGORY_MAP[id];
}

/**
 * 根据URL路径获取类别ID
 */
export function getCategoryIdByPath(urlPath: string): number | undefined {
  // 先检查特殊路由
  if (SPECIAL_ROUTE_MAP[urlPath]) {
    return SPECIAL_ROUTE_MAP[urlPath];
  }

  // 查找匹配的URL路径
  for (const [id, category] of Object.entries(CATEGORY_MAP)) {
    if (category.urlPath === urlPath) {
      return parseInt(id);
    }
  }

  return undefined;
}

/**
 * 构建URL路径到类别ID的映射
 */
export function buildUrlToCategoryMap(): { [urlPath: string]: number } {
  const map: { [urlPath: string]: number } = { ...SPECIAL_ROUTE_MAP };
  
  for (const [id, category] of Object.entries(CATEGORY_MAP)) {
    map[category.urlPath] = parseInt(id);
  }
  
  return map;
}

/**
 * 获取类别的完整层级路径
 */
export function getCategoryHierarchy(categoryId: number): CategoryInfo[] {
  const hierarchy: CategoryInfo[] = [];
  let currentCategory = getCategoryById(categoryId);
  
  while (currentCategory) {
    hierarchy.unshift(currentCategory);
    if (currentCategory.parentId) {
      currentCategory = getCategoryById(currentCategory.parentId);
    } else {
      break;
    }
  }
  
  return hierarchy;
}

/**
 * 根据URL参数构建类别ID
 */
export function buildCategoryIdFromUrlParams(
  category?: string, 
  subcategory?: string, 
  subsubcategory?: string
): number | undefined {
  // 构建URL路径
  let urlPath = '';
  
  if (category) {
    urlPath = category;
    if (subcategory) {
      urlPath += `/${subcategory}`;
      if (subsubcategory) {
        urlPath += `/${subsubcategory}`;
      }
    }
  }
  
  return getCategoryIdByPath(urlPath);
}

export default CATEGORY_MAP;