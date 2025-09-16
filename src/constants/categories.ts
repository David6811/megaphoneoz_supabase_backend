// Three-tier category structure
export const NEWS_CATEGORIES = {
  'News': {
    'Local': [],
    'National': [], 
    'World': [],
    'Features': [],
    'Environment': [],
    'Media': []
  },
  'Lifestyle': {
    'Food and Wine': [
      'Restaurant Reviews',
      'Wine Match'
    ],
    'Sport': [],
    'Travel': []
  },
  'Arts and Entertainment': {
    'Games': [],
    'Theatre': [
      'Reviews'
    ],
    'Film': [],
    'Music': [],
    'Galleries': [
      'Exhibitions',
      'Eye On The Street'
    ],
    'Books': [],
    'Drawn and Quartered': []
  }
}

// Standalone categories (can be selected directly)
export const STANDALONE_CATEGORIES = [
  'Opinion'
]

// Flatten categories for backward compatibility and storage
export const FLAT_CATEGORIES = [
  // Three-tier categories: Level1 > Level2 > Level3
  ...Object.entries(NEWS_CATEGORIES).flatMap(([level1, level2Obj]) => 
    Object.entries(level2Obj).flatMap(([level2, level3Array]) => {
      if (level3Array.length === 0) {
        // If no level3, just use level1 > level2
        return [`${level1} > ${level2}`]
      } else {
        // If has level3, create level1 > level2 > level3
        return level3Array.map(level3 => `${level1} > ${level2} > ${level3}`)
      }
    })
  ),
  ...STANDALONE_CATEGORIES
]

// Helper function to get parent category from full path
export const getParentCategory = (fullCategory: string): string => {
  const parts = fullCategory.split(' > ')
  return parts.length > 0 ? parts[0] : fullCategory
}

// Helper function to get middle category from full path
export const getMiddleCategory = (fullCategory: string): string => {
  const parts = fullCategory.split(' > ')
  return parts.length > 1 ? parts[1] : ''
}

// Helper function to get child category from full path
export const getChildCategory = (fullCategory: string): string => {
  const parts = fullCategory.split(' > ')
  return parts.length > 2 ? parts[2] : (parts.length > 1 ? parts[1] : fullCategory)
}

// Helper function to get display name (the most specific category)
export const getCategoryDisplayName = (fullCategory: string): string => {
  // If it's a standalone category, return as is
  if (STANDALONE_CATEGORIES.includes(fullCategory)) {
    return fullCategory
  }
  
  const parts = fullCategory.split(' > ')
  // Return the most specific part (last one)
  return parts[parts.length - 1]
}