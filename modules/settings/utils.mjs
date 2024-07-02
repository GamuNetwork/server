export function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
}

export function mergeDicts(dict1, dict2) {
  for (const [key, value] of Object.entries(dict2)) {
    if (typeof value === 'object') {
      dict1[kebabToCamel(key)] = dict1[key] || {}
      mergeDicts(dict1[kebabToCamel(key)], value)
    } else {
      dict1[kebabToCamel(key)] = value
    }
  }
}