import React, { useState } from "react";

import { TreeType } from "../../@Types";

import './index.scss';

interface ITreeRecursionProps {
  /** 전체 리스트 */
  list: TreeType[];
  /** 현재 리스트: 상위 계층의 items 데이터 */
  items: TreeType[];
  /** 현재 아이템의 부모 ID 리스트 */
  parentList: string[];
  /** 드래그로 선택된 아이템이 속한 계층의 리스트 */
  currentList: TreeType[];
  /** 드래그로 선택된 아이템의 ID */
  currentID: string;
  /** 드래그로 선택된 아이템의 부모 ID 리스트 */
  currentParentList: string[];
  /** 전체 리스트 변경 함수 */
  setList: (list: TreeType[]) => void;
  /** 현재 아이템이 속한 리스트 변경 함수 */
  setCurrentList: (list: TreeType[]) => void;
  /** 현재 아이템 ID 변경 함수 */
  setCurrentID: (id: string) => void;
  /** 현재 아이템의 부모 ID 리스트 변경 함수 */
  setCurrentParentList: (list: string[]) => void;
}

const TreeRecursion = ({
  list, 
  items, 
  parentList, 
  currentList,
  currentID, 
  currentParentList,
  setList, 
  setCurrentList,
  setCurrentID,
  setCurrentParentList
}: ITreeRecursionProps) => {
  const [expanded, setExpanded] = useState<number[]>([]);

  /** 드래그 시작시, 현재 아이템 관련 정보 저장 */
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    e.stopPropagation();
    setCurrentID(id);
    setCurrentParentList(parentList);
    setCurrentList(items);
  };

  /** 드롭시, 소속 변경 */
  const onDropChangeGroup = (id: string, depth: number) => (e: React.DragEvent) => {
    onDragEvent(e);

    const target = e.target as HTMLElement;
    target.classList.remove('active');

    const currentItem = currentList.filter(item => `${item.type}${item.id}` === currentID)[0];
    const dropItem = items.filter(item => `${item.type}${item.id}` === id)[0];

    /** 자기 자신에게 드롭하는 경우, */
    if (id === currentID) return;

    /** 이미 속해져있는 부모 계층에 드롭하는 경우, */
    if (currentParentList.includes(id)) return;

    /** 자식 계층에 드롭하는 경우, */
    if (parentList.includes(currentID)) return;

    const temp = onChangeDepth(currentItem.items, items.filter(item => `${item.type}${item.id}` === id)[0].depth, 1);
    const newData = { ...currentItem, depth: items.filter(item => `${item.type}${item.id}` === id)[0].depth + 1, items: temp };
    const newArray: TreeType[] = items.map(item => {
      if (`${item.type}${item.id}` === id) {
        item.items.push(newData);
      } 

      return item;
    });

    const index = 0;
    const newList: TreeType[] = [];

    if (currentParentList.length) {
      newList.push(...mapping(list, index, newArray, parentList));
    } else {
      newList.push(...list.filter(item => `${item.type}${item.id}` !== currentID));
    }

    const removedList = onDeleteCurrentItem(newList);

    setList(removedList);
  };

  /** 드롭시, 위치 변경 */
  const onDropChangePosition = (idx: number, id: string, type?: string) => (e: React.DragEvent) => {
    onDragEvent(e);

    const target = e.target as HTMLElement;
    target.classList.remove('active');

    /** 자기 자신에게 드롭하는 경우, */
    if (id === currentID) return;

    /** 자식 계층에 드롭하는 경우, */
    if (parentList.includes(currentID)) return;

    const currentItem = currentList.filter(item => `${item.type}${item.id}` === currentID)[0];
    const temp = onChangeDepth(currentItem.items, parentList.length, 1);
    const newData = { ...currentItem, depth: parentList.length + 1, items: temp };
    const newList: TreeType[] = [];

    if (JSON.stringify(parentList) !== JSON.stringify(currentParentList)) {
      /* 같은 계층이 아닌 경우, */
      /* 해당 인덱스로 데이터 이동 */
      if (type === 'first') {
        items.splice(idx, 0, newData);
      } else {
        items.splice(idx + 1, 0, newData);
      }
      newList.push(...onDeleteCurrentItem());
    } else {
      /* 같은 계층의 경우, */
      newList.push(...onDeleteCurrentItem());
      /* 해당 인덱스로 데이터 이동 */
      if (type === 'first') {
        items.splice(idx, 0, newData);
      } else {
        items.splice(idx + 1, 0, newData);
      }
    }

    if (currentParentList.length || parentList.length) {
      /** 최상위 요소가 아닌 경우, */
      setList(newList);
    } else {
      /** 최상위 요소의 경우, */
      setList(items.slice());
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    onDragEvent(e);

    const target = e.target as HTMLElement;
    target.classList.add('active');
  };

  const onDragLeave = (e: React.DragEvent) => {
    onDragEvent(e);

    const target = e.target as HTMLElement;
    target.classList.remove('active');
  };

  /** TEMP: 변화된 객체 데이터에 따라 전체 리스트를 수정하는 함수 */
  const mapping = (nodeList: TreeType[], index: number, tempList: TreeType[], parentList: string[]) => {
    /* 변경이 이루어진 후, 같은 그룹의 다른 요소는 확인하지 않기 위한 변수 */
    let flag = true;

    const array = nodeList.map((item) => {

      if (flag && `${item.type}${item.id}` === parentList[index]) {
        /** 변경하려는 아이템의 부모의 경우, */
        index++;
        flag = false;

        if (parentList.length > index) {
          const array: TreeType[] = mapping(item.items, index, tempList, parentList);
          tempList = array;
        }

        /* 변경되는 부분 */
        const temp: TreeType = { ...item, items: tempList };
        
        return temp;
      } else {
        /** 부모가 아닌 경우, */
        return item;
      }
    });

    return array;
  };

  const onDragEvent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /** 현재 아이템을 소속된 그룹에서 삭제하는 함수 */
  const onDeleteCurrentItem = (arr: TreeType[] = list) => {
    const index = 0; // 부모 ID 배열을 탐색하기 위한 인덱스
    const newList: TreeType[] = [];
    const currentItem = currentList.filter(item => `${item.type}${item.id}` === currentID)[0];

    if (JSON.stringify(parentList) !== JSON.stringify(currentParentList)) {
      /** 선택된 아이템과 드롭된 아이템이 다른 그룹의 경우, */
      if (currentParentList.length) {
        /** 최상위 계층이 아닌 경우, */
        newList.push(...mapping(arr, index, currentList.filter(item => `${item.type}${item.id}` !== currentID), currentParentList));
      } else {
        /** 최상위 계층인 경우, */
        newList.push(...currentList.filter(item => `${item.type}${item.id}` !== currentID));
      }
    } else {
      /** 같은 그룹의 경우, */
      const currentIndex = currentList.indexOf(currentItem);
      items.splice(currentIndex, 1);
      
      newList.push(...mapping(arr, index, items, currentParentList));
    }

    return newList;
  };

  /** 뎁스를 변경하는 함수 */
  const onChangeDepth = (items: TreeType[], depth: number, sum: number) => {
    sum++;
    const list = items.map((item) => {
      const itemList: TreeType[] = onChangeDepth(item.items, depth, sum);
      
      return { ...item, depth: depth + sum, items: itemList };
    });

    return list;
  };

  const getMaxDepth = (item: TreeType, depth: number, lastGroup: boolean) => {
    depth = item.depth;

    if (item.items.length) {
      item.items.forEach(item => {
        if (depth < item.depth) {
          depth = getMaxDepth(item, depth, lastGroup).depth;
          if (item.type === 'group') {
            lastGroup = getMaxDepth(item, depth, true).lastGroup;
          }
        }
      });
    }

    return { depth: depth, lastGroup: lastGroup };
  };

  const onClickItem = (item: TreeType) => (e: React.MouseEvent) => {
    if (!item.items.length) return;

    if (expanded.includes(item.id)) {
      setExpanded(expanded.filter(itemId => itemId !== item.id));
    } else {
      setExpanded(prev => [...prev, item.id]);
    }
  };

    return (
        <div className="tree">
          {items.map((item, idx) =>
            <div 
              key={idx}
              className="tree-wrapper"
              draggable
              onDragStart={onDragStart(`${item.type}${item.id}`)}
              onDrop={onDropChangeGroup(`${item.type}${item.id}`, item.depth)}
              onDragEnter={onDragEvent}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
            >
            {idx === 0 &&
              <div 
                className={`position first depth-${item.depth}`}
                onDrop={onDropChangePosition(idx, `${item.type}${item.id}`, 'first')} 
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
              />
            }
            {/** 해당 아이템 */}
            <div className={'item'} data-id={`${item.type}${item.id}`} onClick={onClickItem(item)}>
                <div className={`depth-${item.depth} ${item.items.length === 0 && 'inactive'}`}>
                  {item.id}
                </div>
            </div>
            <div 
              className={`position depth-${item.depth}`}
              onDrop={onDropChangePosition(idx, `${item.type}${item.id}`)} 
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
            />
            {expanded.includes(item.id) && 
              <div className="item-children">
                {/** 하위 계층 */}
                <TreeRecursion 
                  list={list} 
                  items={item.items} 
                  parentList={[...parentList, `${item.type}${item.id}`]}
                  currentList={currentList}
                  currentID={currentID}
                  currentParentList={currentParentList}
                  setList={(list: TreeType[]) => setList(list)}
                  setCurrentList={setCurrentList}
                  setCurrentID={setCurrentID}
                  setCurrentParentList={setCurrentParentList}
                />
              </div>
            }
            </div>
          )}
        </div>
    );
}

export default TreeRecursion;