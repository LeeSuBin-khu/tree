export type TreeType = {
  id: number,
  type: 'group' | 'single',
  depth: number,
  items: TreeType[]
}
  
export type FlatDataType = {
  id: number,
  type: 'group' | 'single',
  depth: number,
  parentId: number
}