import React, { useState, useEffect } from "react";

import TreeFlatData from "./components/TreeFlatData/index.tsx";
import TreeRecursion from "./components/TreeRecursion/index.tsx";

import { TreeType, FlatDataType } from "./@Types/index.ts";

import { TREE_DATA } from "./utils/dummy.ts";

const App = () => {
  /** 전체 리스트 */
  const [list, setList] = useState<TreeType[]>(TREE_DATA);
  /** 드래그로 선택된 아이템의 ID */
  const [currentID, setCurrentID] = useState<string>('');
  /** 드래그로 선택된 아이템의 부모들의 ID 배열 */
  const [currentParentList, setCurrentParentList] = useState<string[]>([]);
  /** 드래그로 선택된 아이템이 속한 배열 */
  const [currentList, setCurrentList] = useState<TreeType[]>([]);

  /** FlatData */
  const [items, setItems] = useState<FlatDataType[]>([]);

  /** making Flat data */
  useEffect(() => {
    const array: FlatDataType[] = [];

    TREE_DATA.forEach(item => {
      const { items, ...rest } = item;
      array.push({ ...rest, parentId: 0 });
      makeFlatData(item, array);
    });

    setItems(array);
  }, []);

  const makeFlatData = (item: TreeType, array: FlatDataType[]) => {
    item.items.forEach(data => {
      const { items, ...rest } = data;
      array.push({ ...rest, parentId: item.id });
      makeFlatData(data, array);
    });
  };

  return (
    <div className="App">
      <div className="contents-container">
        <div className="tree-container">
          <span className="title">Tree using Flat Data</span>
          <TreeFlatData 
            items={items} 
            onChangeItems={(items: FlatDataType[]) => setItems(items)}
          />
        </div>
        <div className="tree-container">
        <span className="title">Tree using Recursion</span>
          <TreeRecursion 
            list={list} 
            items={list} 
            parentList={[]}
            currentList={currentList}
            currentID={currentID}
            currentParentList={currentParentList}
            setList={(list: TreeType[]) => setList(list)}
            setCurrentList={(list: TreeType[]) => setCurrentList(list)}
            setCurrentID={(id: string) => setCurrentID(id)}
            setCurrentParentList={(list: string[]) => setCurrentParentList(list)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
